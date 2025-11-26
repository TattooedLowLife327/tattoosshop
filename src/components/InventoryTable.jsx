import { useState, useEffect } from 'react'
import { getInventory } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import StatusChip from './StatusChip'

const TYPES = ['barrel', 'flight', 'shaft', 'tip']
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor']

export default function InventoryTable({ onEdit, isAdmin = false }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    condition: '',
    status: '',
    sortBy: 'created_at',
    sortAsc: false
  })
  const { addToCart, removeFromCart, isInCart } = useCart()
  const { requireUserInfo } = useUser()

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await getInventory(filters)
      setInventory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortAsc: prev.sortBy === column ? !prev.sortAsc : true
    }))
  }

  const handleCartToggle = (item) => {
    if (isInCart(item.id)) {
      removeFromCart(item.id)
    } else {
      requireUserInfo(() => addToCart(item))
    }
  }

  if (error) {
    return <div className="error-text">Error: {error}</div>
  }

  return (
    <div className="inventory-container">
      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search brand..."
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
        />

        <select
          value={filters.condition}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>

        <button onClick={loadInventory} className="btn-secondary">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Photos</th>
                <th onClick={() => handleSort('type')}>
                  Type {filters.sortBy === 'type' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('brand')}>
                  Brand {filters.sortBy === 'brand' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('model')}>
                  Model {filters.sortBy === 'model' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('weight')}>
                  Weight {filters.sortBy === 'weight' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('condition')}>
                  Condition {filters.sortBy === 'condition' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('price')}>
                  Price {filters.sortBy === 'price' && (filters.sortAsc ? '↑' : '↓')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No items found</td>
                </tr>
              ) : (
                inventory.map(item => (
                  <tr key={item.id} className={item.status !== 'available' ? 'row-disabled' : ''}>
                    <td>
                      <div className="item-photos">
                        {item.photo_urls?.slice(0, 3).map((url, idx) => (
                          <img key={idx} src={url} alt={`${item.brand} ${item.model}`} />
                        ))}
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td>{item.brand}</td>
                    <td>{item.model}</td>
                    <td>{item.weight}g</td>
                    <td>{item.condition}</td>
                    <td className="price">${parseFloat(item.price).toFixed(2)}</td>
                    <td><StatusChip status={item.status} /></td>
                    <td className="actions">
                      {isAdmin ? (
                        <button
                          onClick={() => onEdit?.(item)}
                          className="btn-small"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCartToggle(item)}
                          disabled={item.status !== 'available'}
                          className={`btn-small ${isInCart(item.id) ? 'btn-active' : ''}`}
                        >
                          {isInCart(item.id) ? 'Remove' : 'Add'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
