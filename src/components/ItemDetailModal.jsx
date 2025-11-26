import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import StatusChip from './StatusChip'

const CONDITIONS_INFO = {
  'new': 'Brand new, never used, in original packaging if applicable',
  'like new': 'Used once or twice, no visible wear, looks new',
  'good': 'Light use, minor cosmetic marks, fully functional',
  'fair': 'Moderate use, visible wear, fully functional',
  'poor': 'Heavy use, significant wear, may have issues'
}

export default function ItemDetailModal({ item, onClose, onWatchlistToggle, isWatched = false }) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [showConditionInfo, setShowConditionInfo] = useState(false)
  const { addToCart, removeFromCart, isInCart } = useCart()
  const { requireUserInfo } = useUser()

  if (!item) return null

  const photos = item.photo_urls || []
  const inCart = isInCart(item.id)
  const isAvailable = item.status === 'available'

  const handleCartClick = () => {
    if (inCart) {
      removeFromCart(item.id)
    } else {
      requireUserInfo(() => addToCart(item))
    }
  }

  const handleWatchlistClick = () => {
    if (onWatchlistToggle) {
      requireUserInfo(() => onWatchlistToggle(item))
    }
  }

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>X</button>

        <div style={styles.layout}>
          <div style={styles.gallery}>
            {photos.length > 0 ? (
              <>
                <div style={styles.mainImage}>
                  <img
                    src={photos[currentPhoto]}
                    alt={`${item.brand} ${item.player}`}
                    style={styles.image}
                  />
                  {photos.length > 1 && (
                    <>
                      <button style={styles.navLeft} onClick={prevPhoto}>&lt;</button>
                      <button style={styles.navRight} onClick={nextPhoto}>&gt;</button>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <div style={styles.thumbnails}>
                    {photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Thumbnail ${idx + 1}`}
                        style={{
                          ...styles.thumbnail,
                          border: idx === currentPhoto ? '2px solid #9b4dff' : '2px solid transparent'
                        }}
                        onClick={() => setCurrentPhoto(idx)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={styles.noPhotos}>No photos available</div>
            )}
          </div>

          <div style={styles.details}>
            <div style={styles.header}>
              <span style={styles.type}>{item.type}</span>
              <StatusChip status={item.status} />
            </div>

            <h2 style={styles.title}>{item.brand}</h2>
            <p style={styles.player}>{item.player}</p>

            <div style={styles.specs}>
              {item.weight > 0 && (
                <div style={styles.spec}>
                  <span style={styles.specLabel}>Weight</span>
                  <span style={styles.specValue}>{item.weight}g</span>
                </div>
              )}
              <div style={styles.spec}>
                <span style={styles.specLabel}>
                  Condition
                  <button
                    style={styles.infoBtn}
                    onClick={() => setShowConditionInfo(!showConditionInfo)}
                  >
                    ?
                  </button>
                </span>
                <span style={styles.specValue}>{item.condition}</span>
              </div>
              {showConditionInfo && (
                <div style={styles.conditionInfo}>
                  {CONDITIONS_INFO[item.condition] || 'No description available'}
                </div>
              )}
            </div>

            <div style={styles.pricing}>
              {item.retail_price && parseFloat(item.retail_price) > parseFloat(item.price) && (
                <div style={styles.priceDropRow}>
                  <span style={styles.retailPrice}>${parseFloat(item.retail_price).toFixed(2)}</span>
                  <span style={styles.priceDropBadge}>PRICE DROP!</span>
                </div>
              )}
              <span style={styles.price}>${parseFloat(item.price).toFixed(2)}</span>
            </div>

            {item.notes && (
              <div style={styles.notes}>
                <span style={styles.notesLabel}>Notes</span>
                <p style={styles.notesText}>{item.notes}</p>
              </div>
            )}

            <div style={styles.actions}>
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
              <button
                style={{
                  ...styles.watchlistBtn,
                  color: isWatched ? '#9b4dff' : '#fff'
                }}
                onClick={handleWatchlistClick}
              >
                {isWatched ? '\u2605 Watching' : '\u2606 Add to Watchlist'}
              </button>
            </div>

            {!isAvailable && (
              <p style={styles.unavailable}>
                This item is currently {item.status}
              </p>
            )}
          </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer',
    zIndex: 10
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    padding: '24px'
  },
  gallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  mainImage: {
    position: 'relative',
    width: '100%',
    paddingTop: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  navLeft: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.7)',
    border: 'none',
    color: '#fff',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer'
  },
  navRight: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.7)',
    border: 'none',
    color: '#fff',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer'
  },
  thumbnails: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  thumbnail: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  noPhotos: {
    width: '100%',
    paddingTop: '100%',
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  type: {
    color: '#9b4dff',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: '600',
    margin: 0
  },
  player: {
    color: '#aaa',
    fontSize: '18px',
    margin: 0
  },
  specs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  spec: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #222'
  },
  specLabel: {
    color: '#888',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  specValue: {
    color: '#fff',
    fontSize: '14px'
  },
  infoBtn: {
    background: '#333',
    border: 'none',
    color: '#888',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    fontSize: '11px',
    cursor: 'pointer'
  },
  conditionInfo: {
    backgroundColor: '#1a1a1a',
    padding: '12px',
    borderRadius: '4px',
    color: '#aaa',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  pricing: {
    padding: '16px 0',
    borderTop: '1px solid #333',
    borderBottom: '1px solid #333'
  },
  priceDropRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px'
  },
  retailPrice: {
    color: '#888',
    fontSize: '18px',
    textDecoration: 'line-through'
  },
  priceDropBadge: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  price: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: '700'
  },
  notes: {
    backgroundColor: '#1a1a1a',
    padding: '12px',
    borderRadius: '4px'
  },
  notesLabel: {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  notesText: {
    color: '#ccc',
    fontSize: '14px',
    margin: '8px 0 0 0',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cartBtn: {
    padding: '14px',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  watchlistBtn: {
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  unavailable: {
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center',
    margin: 0
  }
}
