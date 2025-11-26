import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import StatusChip from './StatusChip'

export default function ItemCard({ item, onSelect, onWatchlistToggle, isWatched = false }) {
  const { addToCart, removeFromCart, isInCart } = useCart()
  const { requireUserInfo } = useUser()

  const inCart = isInCart(item.id)
  const isAvailable = item.status === 'available'
  const mainPhoto = item.photo_urls?.[0]

  const handleCartClick = (e) => {
    e.stopPropagation()
    if (inCart) {
      removeFromCart(item.id)
    } else {
      requireUserInfo(() => {
        const confirmed = window.confirm(`Add "${item.brand} ${item.player}" to your cart for $${parseFloat(item.price).toFixed(2)}?`)
        if (confirmed) {
          addToCart(item)
        }
      })
    }
  }

  const handleWatchlistClick = (e) => {
    e.stopPropagation()
    if (onWatchlistToggle) {
      requireUserInfo(() => onWatchlistToggle(item))
    }
  }

  return (
    <div
      style={{
        ...styles.card,
        opacity: isAvailable ? 1 : 0.6,
        cursor: 'pointer'
      }}
      onClick={() => onSelect?.(item)}
    >
      <div style={styles.imageContainer}>
        {mainPhoto ? (
          <img src={mainPhoto} alt={`${item.brand} ${item.player}`} style={styles.image} />
        ) : (
          <div style={styles.noImage}>No Photo</div>
        )}
        {item.photo_urls?.length > 1 && (
          <span style={styles.photoCount}>{item.photo_urls.length} photos</span>
        )}
        <button
          style={{
            ...styles.watchlistBtn,
            color: isWatched ? '#9b4dff' : '#666'
          }}
          onClick={handleWatchlistClick}
          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isWatched ? '\u2605' : '\u2606'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <span style={styles.type}>{item.type}</span>
          <StatusChip status={item.status} />
        </div>

        <h3 style={styles.title}>{item.brand}</h3>
        <p style={styles.player}>{item.player}</p>

        <div style={styles.details}>
          {item.weight > 0 && <span style={styles.detail}>{item.weight}g</span>}
          <span style={styles.detail}>{item.condition}</span>
        </div>

        <div style={styles.footer}>
          <div style={styles.priceContainer}>
            {item.retail_price && parseFloat(item.retail_price) > parseFloat(item.price) && (
              <span style={styles.retailPrice}>${parseFloat(item.retail_price).toFixed(2)}</span>
            )}
            <span style={styles.price}>${parseFloat(item.price).toFixed(2)}</span>
          </div>
          {item.retail_price && parseFloat(item.retail_price) > parseFloat(item.price) && (
            <span style={styles.priceDropBadge}>PRICE DROP!</span>
          )}
        </div>

        <button
          style={{
            ...styles.cartBtn,
            backgroundColor: inCart ? '#333' : '#9b4dff',
            opacity: isAvailable ? 1 : 0.5
          }}
          onClick={handleCartClick}
          disabled={!isAvailable}
        >
          {inCart ? 'Remove from Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s, border-color 0.2s'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '100%',
    backgroundColor: '#1a1a1a'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#555',
    fontSize: '14px'
  },
  photoCount: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  watchlistBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: '12px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  type: {
    color: '#9b4dff',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0'
  },
  player: {
    color: '#aaa',
    fontSize: '14px',
    margin: '0 0 8px 0'
  },
  details: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px'
  },
  detail: {
    color: '#666',
    fontSize: '12px',
    backgroundColor: '#1a1a1a',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  price: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700'
  },
  retailPrice: {
    color: '#888',
    fontSize: '14px',
    textDecoration: 'line-through'
  },
  priceDropBadge: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  cartBtn: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}
