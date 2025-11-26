import { Link } from 'react-router-dom'
import OrderCheckout from '../components/OrderCheckout'

export default function Checkout() {
  return (
    <div className="checkout-page">
      <header className="site-header">
        <h1>Checkout</h1>
        <nav>
          <Link to="/">Back to Shop</Link>
        </nav>
      </header>

      <main>
        <OrderCheckout />
      </main>
    </div>
  )
}
