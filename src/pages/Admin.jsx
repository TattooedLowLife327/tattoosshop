import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import PincodeEntry from '../components/PincodeEntry'
import AdminDashboard from '../components/AdminDashboard'

export default function Admin() {
  const { isAdmin, logout } = useAdmin()

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <header className="site-header">
          <h1>Admin Access</h1>
          <nav>
            <Link to="/">Back to Shop</Link>
          </nav>
        </header>
        <PincodeEntry />
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="site-header">
        <h1>Admin Dashboard</h1>
        <nav>
          <Link to="/">Back to Shop</Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </nav>
      </header>

      <main>
        <AdminDashboard />
      </main>
    </div>
  )
}
