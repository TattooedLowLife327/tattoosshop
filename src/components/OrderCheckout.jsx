import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { createOrder, claimItems } from '../lib/supabase'

export default function OrderCheckout() {
  const { cart, getTotal, clearCart } = useCart()
  const { userInfo } = useUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      setError('Your cart is empty')
      return
    }

    if (!userInfo?.facebookName || !userInfo?.shippingAddress) {
      setError('Missing user information. Please go back to shop and try again.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const order = await createOrder({
        items: cart.map(i => i.id),
        facebook_name: userInfo.facebookName,
        shipping_address: userInfo.shippingAddress,
        payment_method: 'venmo',
        payment_handle: 'TBD via Facebook',
        status: 'pending'
      })

      await claimItems(cart.map(i => i.id), order.id)
      clearCart()
      setSuccess(true)
    } catch (err) {
      if (err.message.includes('duplicate') || err.message.includes('already claimed')) {
        setError('One or more items have already been claimed. Please refresh and try again.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successBox}>
          <h2 style={styles.successTitle}>Items Reserved!</h2>

          <div style={styles.noticeBox}>
            <p style={styles.noticeBold}>
              A notification has been sent to TattooedLowLife and she will reach out via Facebook with your final total including the shipping costs.
            </p>
            <p style={styles.warningText}>
              ITEMS ARE RESERVED FOR ONLY 24 HOURS PENDING PAYMENT. PLEASE PAY PROMPTLY!
            </p>
          </div>

          <button onClick={() => navigate('/')} style={styles.backBtn}>
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reserve Items</h2>

      {cart.length === 0 ? (
        <div style={styles.emptyCart}>
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} style={styles.btn}>Browse Items</button>
        </div>
      ) : (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <ul style={styles.itemList}>
              {cart.map(item => (
                <li key={item.id} style={styles.item}>
                  <span>{item.brand} {item.player} ({item.type})</span>
                  <span style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div style={styles.total}>
              <span>Subtotal (shipping not included):</span>
              <span style={styles.totalPrice}>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Information</h3>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <label style={styles.label}>Facebook Name:</label>
                <span style={styles.infoValue}>{userInfo?.facebookName || 'Not provided'}</span>
              </div>
              <div style={styles.infoRow}>
                <label style={styles.label}>Shipping Address:</label>
                <span style={styles.infoValue}>{userInfo?.shippingAddress || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.reserveBtn,
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Processing...' : 'Reserve Items'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'Helvetica, Arial, sans-serif'
  },
  title: {
    fontSize: '28px',
    marginBottom: '24px',
    color: '#fff'
  },
  section: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  sectionTitle: {
    fontSize: '18px',
    marginBottom: '16px',
    color: '#9b4dff'
  },
  itemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #222'
  },
  itemPrice: {
    color: '#9b4dff'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
    marginTop: '8px',
    fontWeight: 'bold'
  },
  totalPrice: {
    color: '#9b4dff',
    fontSize: '20px'
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    color: '#888',
    fontSize: '14px'
  },
  infoValue: {
    color: '#fff',
    whiteSpace: 'pre-line'
  },
  error: {
    color: '#ff4d4d',
    padding: '12px',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  reserveBtn: {
    flex: 1,
    padding: '14px 24px',
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '14px 24px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px'
  },
  btn: {
    padding: '12px 24px',
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '16px'
  },
  successContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'Helvetica, Arial, sans-serif'
  },
  successBox: {
    textAlign: 'center',
    padding: '32px',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  successTitle: {
    fontSize: '32px',
    color: '#9b4dff',
    marginBottom: '24px'
  },
  noticeBox: {
    backgroundColor: '#1a1a1a',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  noticeBold: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  warningText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ff4d4d',
    textTransform: 'uppercase',
    margin: 0
  },
  backBtn: {
    padding: '14px 32px',
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}
