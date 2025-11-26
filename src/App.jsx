import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AdminProvider } from './context/AdminContext'
import { UserProvider } from './context/UserContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { NotificationProvider } from './context/NotificationContext'
import UserInfoModal from './components/UserInfoModal'
import NotificationBanner from './components/NotificationBanner'
import HelpSidebar from './components/HelpSidebar'
import { Footer } from './components/ui'
import { useNotifications } from './context/NotificationContext'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'

function AppContent() {
  const { notifications, dismissNotification } = useNotifications()
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpTab, setHelpTab] = useState('faq')

  const handleOpenHelp = (tab) => {
    setHelpTab(tab)
    setHelpOpen(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
      <Footer onOpenHelp={handleOpenHelp} />
      <UserInfoModal />
      <NotificationBanner
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <HelpSidebar
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        initialTab={helpTab}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <UserProvider>
          <WatchlistProvider>
            <CartProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </CartProvider>
          </WatchlistProvider>
        </UserProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
