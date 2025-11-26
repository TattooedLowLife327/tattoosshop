import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, clearCart, getTotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} className="close-btn">X</button>
        </div>

        <div className="drawer-content">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <ul className="cart-items">
                {cart.map(item => (
                  <li key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">
                        {item.brand} {item.model}
                      </span>
                      <span className="cart-item-type">{item.type}</span>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-price">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn-small btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-total">
                <span>Total:</span>
                <span className="total-price">${getTotal().toFixed(2)}</span>
              </div>

              <div className="cart-actions">
                <button onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
                <button onClick={clearCart} className="btn-secondary">
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
