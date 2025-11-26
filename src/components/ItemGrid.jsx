import { useState, useEffect } from 'react'
import { getInventory } from '../lib/supabase'
import { useWatchlist } from '../context/WatchlistContext'
import ItemCard from './ItemCard'
import ItemDetailModal from './ItemDetailModal'
import FilterPanel from './FilterPanel'

export default function ItemGrid() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [filters, setFilters] = useState({
    types: [],
    conditions: [],
    statuses: ['available'],
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'created_at',
    sortAsc: false
  })

  const { toggleWatchlist, isWatched } = useWatchlist()

  const loadInventory = async () => {
    try {
      setLoading(true)
      const filterParams = {
        types: filters.types.length > 0 ? filters.types : undefined,
        conditions: filters.conditions.length > 0 ? filters.conditions : undefined,
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sortBy: filters.sortBy,
        sortAsc: filters.sortAsc
      }
      const data = await getInventory(filterParams)
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

  const clearFilters = () => {
    setFilters({
      types: [],
      conditions: [],
      statuses: ['available'],
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'created_at',
      sortAsc: false
    })
  }

  const handleWatchlistToggle = (item) => {
    toggleWatchlist(item)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.types.length > 0) count += filters.types.length
    if (filters.conditions.length > 0) count += filters.conditions.length
    if (filters.statuses.length > 0 && !(filters.statuses.length === 1 && filters.statuses[0] === 'available')) count += filters.statuses.length
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    return count
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button
          onClick={() => setFilterPanelOpen(true)}
          style={styles.filterBtn}
        >
          <span style={styles.filterIcon}>&#9776;</span>
          Filter
          {getActiveFilterCount() > 0 && (
            <span style={styles.filterBadge}>{getActiveFilterCount()}</span>
          )}
        </button>

        <div style={styles.sortDisplay}>
          {filters.sortBy === 'created_at' && !filters.sortAsc && 'Newest First'}
          {filters.sortBy === 'created_at' && filters.sortAsc && 'Oldest First'}
          {filters.sortBy === 'price' && filters.sortAsc && 'Price: Low to High'}
          {filters.sortBy === 'price' && !filters.sortAsc && 'Price: High to Low'}
          {filters.sortBy === 'brand' && filters.sortAsc && 'Brand: A-Z'}
          {filters.sortBy === 'brand' && !filters.sortAsc && 'Brand: Z-A'}
        </div>

        <button onClick={loadInventory} style={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      {/* Active filter pills */}
      {getActiveFilterCount() > 0 && (
        <div style={styles.activePills}>
          {filters.types.map(t => (
            <span key={t} style={styles.activePill}>
              {t}
              <button
                onClick={() => handleFilterChange('types', filters.types.filter(x => x !== t))}
                style={styles.pillRemove}
              >x</button>
            </span>
          ))}
          {filters.conditions.map(c => (
            <span key={c} style={styles.activePill}>
              {c}
              <button
                onClick={() => handleFilterChange('conditions', filters.conditions.filter(x => x !== c))}
                style={styles.pillRemove}
              >x</button>
            </span>
          ))}
          {filters.statuses.filter(s => s !== 'available' || filters.statuses.length > 1).map(s => (
            <span key={s} style={styles.activePill}>
              {s}
              <button
                onClick={() => handleFilterChange('statuses', filters.statuses.filter(x => x !== s))}
                style={styles.pillRemove}
              >x</button>
            </span>
          ))}
          {(filters.minPrice || filters.maxPrice) && (
            <span style={styles.activePill}>
              ${filters.minPrice || '0'} - ${filters.maxPrice || '...'}
              <button
                onClick={() => {
                  handleFilterChange('minPrice', '')
                  handleFilterChange('maxPrice', '')
                }}
                style={styles.pillRemove}
              >x</button>
            </span>
          )}
          <button onClick={clearFilters} style={styles.clearAllBtn}>
            Clear All
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : inventory.length === 0 ? (
        <div style={styles.empty}>No items found</div>
      ) : (
        <div style={styles.grid}>
          {inventory.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={setSelectedItem}
              onWatchlistToggle={handleWatchlistToggle}
              isWatched={isWatched(item.id)}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onWatchlistToggle={handleWatchlistToggle}
          isWatched={isWatched(selectedItem.id)}
        />
      )}

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
        onClose={() => setFilterPanelOpen(false)}
        isOpen={filterPanelOpen}
      />
    </div>
  )
}

const styles = {
  container: {
    padding: '0'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '10px 16px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer'
  },
  filterIcon: {
    fontSize: '14px'
  },
  filterBadge: {
    backgroundColor: '#9b4dff',
    color: '#fff',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '12px',
    marginLeft: '4px'
  },
  sortDisplay: {
    color: '#888',
    fontSize: '14px',
    flex: 1
  },
  refreshBtn: {
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer'
  },
  activePills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
    alignItems: 'center'
  },
  activePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '16px',
    padding: '6px 12px',
    color: '#ccc',
    fontSize: '13px',
    textTransform: 'capitalize'
  },
  pillRemove: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '14px'
  },
  clearAllBtn: {
    background: 'none',
    border: 'none',
    color: '#9b4dff',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '6px 8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  loading: {
    textAlign: 'center',
    color: '#888',
    padding: '40px'
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '40px'
  },
  error: {
    color: '#ff6b6b',
    padding: '20px',
    textAlign: 'center'
  }
}
