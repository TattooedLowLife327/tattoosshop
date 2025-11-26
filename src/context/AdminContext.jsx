import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

const ADMIN_PINCODE = import.meta.env.VITE_ADMIN_PINCODE || '1234'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true'
  })

  const login = (pincode) => {
    if (pincode === ADMIN_PINCODE) {
      setIsAdmin(true)
      sessionStorage.setItem('isAdmin', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem('isAdmin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
