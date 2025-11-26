import { useState, useEffect } from 'react'
import { getOrders, updateOrder, deleteOrder, markItemsSold, releaseItems, getInventory, updateInventoryItem } from '../lib/supabase'
import InventoryTable from './InventoryTable'
import ItemForm from './ItemForm'
import StatusChip from './StatusChip'

export default function AdminDashboard() {
  const [view, setView] = useState('inventory')
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [inventoryMap, setInventoryMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({ available: 0, pending: 0, sold: 0, totalValue: 0 })

  const loadData = async () => {
    setLoading(true)
    try {
      const [ordersData, inventoryData] = await Promise.all([
        getOrders(),
        getInventory()
      ])
      setOrders(ordersData)
      setInventory(inventoryData)

      const map = {}
      inventoryData.forEach(item => {
        map[item.id] = item
      })
      setInventoryMap(map)

      // Calculate stats
      const available = inventoryData.filter(i => i.status === 'available').length
      const pending = inventoryData.filter(i => i.status === 'pending').length
      const sold = inventoryData.filter(i => i.status === 'sold').length
      const totalValue = inventoryData
        .filter(i => i.status === 'available')
        .reduce((sum, i) => sum + parseFloat(i.price || 0), 0)

      setStats({ available, pending, sold, totalValue })

      // Auto-revert pending items older than 24 hours
      await autoRevertPendingItems(inventoryData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const autoRevertPendingItems = async (items) => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const expiredItems = items.filter(item => {
      if (item.status !== 'pending' || !item.pending_since) return false
      const pendingSince = new Date(item.pending_since)
      return pendingSince < twentyFourHoursAgo
    })

    if (expiredItems.length > 0) {
      try {
        await releaseItems(expiredItems.map(i => i.id))
        setError(`Auto-reverted ${expiredItems.length} expired pending item(s)`)
        setTimeout(() => setError(null), 5000)
        loadData()
      } catch (err) {
        console.error('Failed to auto-revert items:', err)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (view === 'orders' || view === 'analytics') {
      loadData()
    }
  }, [view])

  const handleMarkSold = async (order) => {
    try {
      await markItemsSold(order.items)
      await updateOrder(order.id, { status: 'completed' })
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelOrder = async (order) => {
    if (!confirm('Cancel this order and release items back to available?')) return
    try {
      await releaseItems(order.items)
      await deleteOrder(order.id)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingItem(null)
    loadData()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const exportInventoryCSV = () => {
    const headers = ['ID', 'Type', 'Brand', 'Player', 'Weight', 'Condition', 'Current Price', 'Retail Price', 'Quantity', 'Status', 'Notes', 'Created At']
    const rows = inventory.map(item => [
      item.id,
      item.type,
      item.brand,
      item.player,
      item.weight,
      item.condition,
      item.price,
      item.retail_price || '',
      item.quantity || 1,
      item.status,
      (item.notes || '').replace(/,/g, ';'),
      item.created_at
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    downloadCSV(csv, 'inventory.csv')
  }

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Facebook Name', 'Shipping Address', 'Payment Method', 'Payment Handle', 'Status', 'Items', 'Total', 'Created At']
    const rows = orders.map(order => {
      const itemDetails = order.items.map(id => {
        const item = inventoryMap[id]
        return item ? `${item.brand} ${item.player}` : id
      }).join('; ')
      const total = order.items.reduce((sum, id) => {
        const item = inventoryMap[id]
        return sum + (item ? parseFloat(item.price) : 0)
      }, 0)

      return [
        order.id,
        order.facebook_name,
        (order.shipping_address || '').replace(/,/g, ';').replace(/\n/g, ' '),
        order.payment_method,
        order.payment_handle,
        order.status,
        itemDetails,
        total.toFixed(2),
        order.created_at
      ]
    })

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    downloadCSV(csv, 'orders.csv')
  }

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-nav">
        <button
          onClick={() => setView('inventory')}
          className={view === 'inventory' ? 'active' : ''}
        >
          Inventory
        </button>
        <button
          onClick={() => setView('orders')}
          className={view === 'orders' ? 'active' : ''}
        >
          Orders
        </button>
        <button
          onClick={() => setView('analytics')}
          className={view === 'analytics' ? 'active' : ''}
        >
          Analytics
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {view === 'analytics' && (
        <div style={styles.analyticsContainer}>
          <h2 style={styles.analyticsTitle}>Dashboard Analytics</h2>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statValue}>{stats.available}</span>
              <span style={styles.statLabel}>Available</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>{stats.pending}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>{stats.sold}</span>
              <span style={styles.statLabel}>Sold</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>${stats.totalValue.toFixed(2)}</span>
              <span style={styles.statLabel}>Available Value</span>
            </div>
          </div>

          <div style={styles.exportSection}>
            <h3 style={styles.exportTitle}>Export Data</h3>
            <div style={styles.exportButtons}>
              <button onClick={exportInventoryCSV} style={styles.exportBtn}>
                Export Inventory CSV
              </button>
              <button onClick={exportOrdersCSV} style={styles.exportBtn}>
                Export Orders CSV
              </button>
            </div>
          </div>

          <div style={styles.topItems}>
            <h3 style={styles.exportTitle}>Top Wishlisted Items</h3>
            <div style={styles.topList}>
              {inventory
                .filter(i => i.wishlist_count > 0)
                .sort((a, b) => (b.wishlist_count || 0) - (a.wishlist_count || 0))
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} style={styles.topItem}>
                    <span>{item.brand} {item.player}</span>
                    <span style={styles.wishlistCount}>{item.wishlist_count} wishlists</span>
                  </div>
                ))
              }
              {inventory.filter(i => i.wishlist_count > 0).length === 0 && (
                <p style={styles.noData}>No wishlisted items yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'inventory' && (
        <div className="admin-inventory">
          <div className="admin-actions">
            <button onClick={handleAddNew}>Add New Item</button>
            <button onClick={loadData} className="btn-secondary">Refresh</button>
          </div>

          {showForm ? (
            <ItemForm
              item={editingItem}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          ) : (
            <InventoryTable onEdit={handleEditItem} isAdmin={true} />
          )}
        </div>
      )}

      {view === 'orders' && (
        <div className="admin-orders">
          <div className="admin-actions">
            <button onClick={loadData} className="btn-secondary">
              Refresh Orders
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <p className="no-data">No orders found</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                    <StatusChip status={order.status} />
                  </div>

                  <div className="order-details">
                    <p><strong>Facebook:</strong> {order.facebook_name}</p>
                    <p><strong>Address:</strong> {order.shipping_address}</p>
                    <p><strong>Payment:</strong> {order.payment_method} ({order.payment_handle})</p>
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  </div>

                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {order.items.map(itemId => {
                        const item = inventoryMap[itemId]
                        return (
                          <li key={itemId}>
                            {item ? `${item.brand} ${item.player} (${item.type}) - $${parseFloat(item.price).toFixed(2)}` : itemId}
                          </li>
                        )
                      })}
                    </ul>
                    <p className="order-total">
                      <strong>Total:</strong> $
                      {order.items.reduce((sum, id) => {
                        const item = inventoryMap[id]
                        return sum + (item ? parseFloat(item.price) : 0)
                      }, 0).toFixed(2)}
                    </p>
                  </div>

                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button onClick={() => handleMarkSold(order)}>
                        Mark as Sold
                      </button>
                      <button onClick={() => handleCancelOrder(order)} className="btn-danger">
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  analyticsContainer: {
    padding: '20px'
  },
  analyticsTitle: {
    color: '#fff',
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statValue: {
    color: '#9b4dff',
    fontSize: '32px',
    fontWeight: '700'
  },
  statLabel: {
    color: '#888',
    fontSize: '14px',
    textTransform: 'uppercase'
  },
  exportSection: {
    marginBottom: '32px'
  },
  exportTitle: {
    color: '#fff',
    fontSize: '18px',
    marginBottom: '16px'
  },
  exportButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  exportBtn: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  topItems: {
    marginBottom: '32px'
  },
  topList: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  topItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    color: '#fff'
  },
  wishlistCount: {
    color: '#9b4dff',
    fontSize: '14px'
  },
  noData: {
    color: '#666',
    padding: '20px',
    textAlign: 'center',
    margin: 0
  }
}
