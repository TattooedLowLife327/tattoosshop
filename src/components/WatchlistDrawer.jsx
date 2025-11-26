import { useWatchlist } from '../context/WatchlistContext'
import { useCart } from '../context/CartContext'

export default function WatchlistDrawer({ isOpen, onClose }) {
  const { watchlist, toggleWatchlist } = useWatchlist()
  const { addToCart, isInCart } = useCart()

  if (!isOpen) return null

  const handleAddToCart = (item) => {
    if (!isInCart(item.id)) {
      addToCart(item)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Your Watchlist</h2>
          <button onClick={onClose} style={styles.closeBtn}>X</button>
        </div>

        <div style={styles.content}>
          {watchlist.length === 0 ? (
            <p style={styles.empty}>Your watchlist is empty</p>
          ) : (
            <ul style={styles.list}>
              {watchlist.map(w => {
                const item = w.inventory
                if (!item) return null
                const inCart = isInCart(item.id)
                const isSold = item.status === 'sold'
                const isPending = item.status === 'pending'

                return (
                  <li key={w.id} style={styles.item}>
                    {item.photo_urls && item.photo_urls[0] && (
                      <img
                        src={item.photo_urls[0]}
                        alt={item.player}
                        style={styles.thumbnail}
                      />
                    )}
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>
                        {item.brand} {item.player}
                      </span>
                      <span style={styles.itemType}>{item.type}</span>
                      {isSold && <span style={styles.soldBadge}>SOLD</span>}
                      {isPending && <span style={styles.pendingBadge}>PENDING</span>}
                    </div>
                    <div style={styles.itemActions}>
                      <div style={styles.priceContainer}>
                        {item.retail_price && parseFloat(item.retail_price) > parseFloat(item.price) && (
                          <span style={styles.retailPrice}>${parseFloat(item.retail_price).toFixed(2)}</span>
                        )}
                        <span style={styles.itemPrice}>
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.retail_price && parseFloat(item.retail_price) > parseFloat(item.price) && (
                        <span style={styles.priceDropBadge}>PRICE DROP!</span>
                      )}
                      <div style={styles.buttons}>
                        {!isSold && !isPending && (
                          <button
                            onClick={() => handleAddToCart(item)}
                            style={{
                              ...styles.btnSmall,
                              ...(inCart ? styles.btnDisabled : styles.btnPrimary)
                            }}
                            disabled={inCart}
                          >
                            {inCart ? 'In Cart' : 'Add'}
                          </button>
                        )}
                        <button
                          onClick={() => toggleWatchlist(item)}
                          style={{ ...styles.btnSmall, ...styles.btnDanger }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  drawer: {
    width: '100%',
    maxWidth: '400px',
    height: '100%',
    backgroundColor: '#111',
    borderLeft: '1px solid #333',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#fff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px'
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: '40px'
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#1a1a1a',
    borderRadius: '6px',
    border: '1px solid #333'
  },
  thumbnail: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  itemName: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500'
  },
  itemType: {
    color: '#888',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  soldBadge: {
    color: '#ff4d4d',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  pendingBadge: {
    color: '#ffaa00',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  },
  retailPrice: {
    color: '#888',
    fontSize: '12px',
    textDecoration: 'line-through'
  },
  itemPrice: {
    color: '#9b4dff',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  priceDropBadge: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '2px 4px',
    borderRadius: '3px'
  },
  buttons: {
    display: 'flex',
    gap: '6px'
  },
  btnSmall: {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer'
  },
  btnPrimary: {
    backgroundColor: '#9b4dff',
    color: '#fff'
  },
  btnDanger: {
    backgroundColor: '#333',
    color: '#ff4d4d'
  },
  btnDisabled: {
    backgroundColor: '#333',
    color: '#666',
    cursor: 'not-allowed'
  }
}
