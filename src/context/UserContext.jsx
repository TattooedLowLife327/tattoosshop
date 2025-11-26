import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

const STORAGE_KEY = 'tattoos_shop_user'

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })

  const [showUserModal, setShowUserModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [shouldRunPending, setShouldRunPending] = useState(false)

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo))
    }
  }, [userInfo])

  // Run pending action after userInfo state has updated
  useEffect(() => {
    if (shouldRunPending && userInfo && pendingAction) {
      pendingAction()
      setPendingAction(null)
      setShouldRunPending(false)
    }
  }, [shouldRunPending, userInfo, pendingAction])

  const saveUserInfo = (info) => {
    setUserInfo({
      facebookName: info.facebookName,
      shippingAddress: info.shippingAddress,
      agreedAt: new Date().toISOString()
    })
    setShowUserModal(false)
    setShouldRunPending(true)
  }

  const clearUserInfo = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUserInfo(null)
  }

  const requireUserInfo = (callback) => {
    if (userInfo) {
      callback()
    } else {
      setPendingAction(() => callback)
      setShowUserModal(true)
    }
  }

  const isAgreed = () => {
    return userInfo !== null
  }

  return (
    <UserContext.Provider value={{
      userInfo,
      saveUserInfo,
      clearUserInfo,
      requireUserInfo,
      isAgreed,
      showUserModal,
      setShowUserModal
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
