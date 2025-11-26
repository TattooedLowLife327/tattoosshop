import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from './UserContext'
import { addToWishlist, removeFromWishlist, getWishlist } from '../lib/agreements'

const WatchlistContext = createContext()

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(false)
  const { userInfo } = useUser()

  useEffect(() => {
    if (userInfo?.facebookName) {
      loadWatchlist()
    } else {
      setWatchlist([])
    }
  }, [userInfo?.facebookName])

  const loadWatchlist = async () => {
    if (!userInfo?.facebookName) return

    try {
      setLoading(true)
      const data = await getWishlist(userInfo.facebookName)
      setWatchlist(data || [])
    } catch (err) {
      console.error('Failed to load watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async (item) => {
    if (!userInfo?.facebookName || !userInfo?.shippingAddress) return

    const isWatched = watchlist.some(w => w.item_id === item.id)

    try {
      if (isWatched) {
        await removeFromWishlist(userInfo.facebookName, item.id)
        setWatchlist(prev => prev.filter(w => w.item_id !== item.id))
      } else {
        const result = await addToWishlist(
          userInfo.facebookName,
          userInfo.shippingAddress,
          item.id
        )
        setWatchlist(prev => [...prev, { ...result, inventory: item }])
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err)
      loadWatchlist()
    }
  }

  const isWatched = (itemId) => {
    return watchlist.some(w => w.item_id === itemId)
  }

  const getWatchlistCount = () => {
    return watchlist.length
  }

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loading,
      toggleWatchlist,
      isWatched,
      getWatchlistCount,
      loadWatchlist
    }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}
