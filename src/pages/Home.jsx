import { useState } from 'react'
import { Link } from 'react-router-dom'
import ItemGrid from '../components/ItemGrid'
import CartDrawer from '../components/CartDrawer'
import WatchlistDrawer from '../components/WatchlistDrawer'
import { useCart } from '../context/CartContext'
import { useWatchlist } from '../context/WatchlistContext'

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)
  const [watchlistOpen, setWatchlistOpen] = useState(false)
  const { cart } = useCart()
  const { getWatchlistCount } = useWatchlist()

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <img src="/Group 16.png" alt="Tattoo's Shop" style={styles.logo} />
        <nav style={styles.nav}>
          <button onClick={() => setWatchlistOpen(true)} style={styles.watchlistBtn}>
            Watchlist ({getWatchlistCount()})
          </button>
          <button onClick={() => setCartOpen(true)} style={styles.cartBtn}>
            Cart ({cart.length})
          </button>
          <Link to="/admin" style={styles.adminLink}>Admin</Link>
        </nav>
      </header>

      <main style={styles.main}>
        <ItemGrid />
      </main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WatchlistDrawer isOpen={watchlistOpen} onClose={() => setWatchlistOpen(false)} />
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'Helvetica, Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #222',
    position: 'sticky',
    top: 0,
    backgroundColor: '#000',
    zIndex: 100
  },
  logo: {
    height: '80px',
    width: 'auto'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  watchlistBtn: {
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  cartBtn: {
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  adminLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px'
  },
  main: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  }
}
