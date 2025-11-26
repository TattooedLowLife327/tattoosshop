import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from './UserContext'
import { useWatchlist } from './WatchlistContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const { userInfo } = useUser()
  const { watchlist, loadWatchlist } = useWatchlist()

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id)
    }, 5000)
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Subscribe to inventory changes - only if user is logged in and has watchlist items
  useEffect(() => {
    // Don't subscribe if user not logged in or no watchlist items
    if (!userInfo?.facebookName || !watchlist || watchlist.length === 0) {
      return
    }

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inventory'
        },
        (payload) => {
          const { old: oldItem, new: newItem } = payload

          // Check if this item is in user's watchlist
          const isWatched = watchlist.some(w => w.item_id === newItem.id)

          if (isWatched) {
            // Status changed
            if (oldItem.status !== newItem.status) {
              if (newItem.status === 'sold') {
                addNotification(
                  `Watchlist item "${newItem.brand} ${newItem.player}" has been sold`,
                  'warning'
                )
              } else if (newItem.status === 'pending') {
                addNotification(
                  `Watchlist item "${newItem.brand} ${newItem.player}" is now pending`,
                  'warning'
                )
              } else if (newItem.status === 'available' && oldItem.status !== 'available') {
                addNotification(
                  `Watchlist item "${newItem.brand} ${newItem.player}" is available again!`,
                  'success'
                )
              }
            }

            // Price dropped
            if (oldItem.price > newItem.price) {
              addNotification(
                `PRICE DROP on "${newItem.brand} ${newItem.player}": Now $${parseFloat(newItem.price).toFixed(2)}!`,
                'success'
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userInfo?.facebookName, watchlist, addNotification])

  // Subscribe to watchlist changes
  useEffect(() => {
    if (!userInfo?.facebookName) return

    const channel = supabase
      .channel('watchlist-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'watchlist',
          filter: `facebook_name=eq.${userInfo.facebookName}`
        },
        () => {
          // Reload watchlist when it changes
          loadWatchlist()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userInfo?.facebookName, loadWatchlist])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      dismissNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
