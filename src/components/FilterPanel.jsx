import { useState } from 'react'
import { AnimatedCheckbox, FloatingLabelInput } from './ui'

const TYPES = ['barrel', 'flight', 'shaft', 'tip', 'other']
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor']
const STATUSES = ['available', 'pending', 'sold']
const SORT_OPTIONS = [
  { value: 'created_at-false', label: 'Newest First' },
  { value: 'created_at-true', label: 'Oldest First' },
  { value: 'price-true', label: 'Price low to high' },
  { value: 'price-false', label: 'Price high to low' },
  { value: 'brand-true', label: 'Brand A-Z' },
  { value: 'brand-false', label: 'Brand Z-A' }
]

export default function FilterPanel({ filters, onFilterChange, onClear, onClose, isOpen }) {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    type: true,
    condition: true,
    status: true,
    price: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCheckboxChange = (filterKey, value) => {
    const current = filters[filterKey] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onFilterChange(filterKey, updated)
  }

  const handleSortChange = (value) => {
    const [sortBy, sortAsc] = value.split('-')
    onFilterChange('sortBy', sortBy)
    onFilterChange('sortAsc', sortAsc === 'true')
  }

  const getCurrentSortLabel = () => {
    const currentValue = `${filters.sortBy}-${filters.sortAsc}`
    const option = SORT_OPTIONS.find(o => o.value === currentValue)
    return option ? option.label : 'Newest First'
  }

  const getActiveCount = (filterKey) => {
    const current = filters[filterKey] || []
    return current.length > 0 ? current.length : null
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onClose}>&lt;</button>
          <span style={styles.title}>Filter</span>
          <button style={styles.clearBtn} onClick={onClear}>Clear</button>
        </div>

        <div style={styles.content}>
          {/* Sort Section */}
          <div style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => toggleSection('sort')}>
              <div>
                <span style={styles.sectionTitle}>Sort by</span>
                <span style={styles.sectionSubtitle}>{getCurrentSortLabel()}</span>
              </div>
              <span style={styles.expandIcon}>{expandedSections.sort ? '-' : '+'}</span>
            </button>
            {expandedSections.sort && (
              <div style={styles.sectionContent}>
                {SORT_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    style={styles.radioOption}
                    onClick={() => handleSortChange(option.value)}
                  >
                    <div style={{
                      ...styles.radioCircle,
                      ...((`${filters.sortBy}-${filters.sortAsc}` === option.value) ? styles.radioCircleActive : {})
                    }}>
                      {`${filters.sortBy}-${filters.sortAsc}` === option.value && (
                        <div style={styles.radioInner} />
                      )}
                    </div>
                    <span style={styles.radioText}>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type Section */}
          <div style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => toggleSection('type')}>
              <div>
                <span style={styles.sectionTitle}>Type</span>
                {getActiveCount('types') && (
                  <span style={styles.sectionSubtitle}>
                    {(filters.types || []).join(', ')}
                  </span>
                )}
              </div>
              <span style={styles.expandIcon}>{expandedSections.type ? '-' : '+'}</span>
            </button>
            {expandedSections.type && (
              <div style={styles.checkboxGrid}>
                {TYPES.map(type => (
                  <AnimatedCheckbox
                    key={type}
                    checked={(filters.types || []).includes(type)}
                    onChange={() => handleCheckboxChange('types', type)}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Condition Section */}
          <div style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => toggleSection('condition')}>
              <div>
                <span style={styles.sectionTitle}>Condition</span>
                {getActiveCount('conditions') && (
                  <span style={styles.sectionSubtitle}>
                    {(filters.conditions || []).join(', ')}
                  </span>
                )}
              </div>
              <span style={styles.expandIcon}>{expandedSections.condition ? '-' : '+'}</span>
            </button>
            {expandedSections.condition && (
              <div style={styles.checkboxGrid}>
                {CONDITIONS.map(condition => (
                  <AnimatedCheckbox
                    key={condition}
                    checked={(filters.conditions || []).includes(condition)}
                    onChange={() => handleCheckboxChange('conditions', condition)}
                    label={condition.charAt(0).toUpperCase() + condition.slice(1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Section */}
          <div style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => toggleSection('status')}>
              <div>
                <span style={styles.sectionTitle}>Status</span>
                {getActiveCount('statuses') && (
                  <span style={styles.sectionSubtitle}>
                    {(filters.statuses || []).join(', ')}
                  </span>
                )}
              </div>
              <span style={styles.expandIcon}>{expandedSections.status ? '-' : '+'}</span>
            </button>
            {expandedSections.status && (
              <div style={styles.pillContainer}>
                {STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleCheckboxChange('statuses', status)}
                    style={{
                      ...styles.pill,
                      ...(filters.statuses || []).includes(status) ? styles.pillActive : {}
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Section */}
          <div style={styles.section}>
            <button style={styles.sectionHeader} onClick={() => toggleSection('price')}>
              <div>
                <span style={styles.sectionTitle}>Price</span>
                {(filters.minPrice || filters.maxPrice) && (
                  <span style={styles.sectionSubtitle}>
                    ${filters.minPrice || '0'} - ${filters.maxPrice || '...'}
                  </span>
                )}
              </div>
              <span style={styles.expandIcon}>{expandedSections.price ? '-' : '+'}</span>
            </button>
            {expandedSections.price && (
              <div style={styles.priceInputs}>
                <div style={styles.priceField}>
                  <FloatingLabelInput
                    name="minPrice"
                    label="Min $"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                  />
                </div>
                <span style={styles.priceDash}>-</span>
                <div style={styles.priceField}>
                  <FloatingLabelInput
                    name="maxPrice"
                    label="Max $"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.resultsBtn} onClick={onClose}>
            SEE RESULTS
          </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-start'
  },
  panel: {
    width: '320px',
    maxWidth: '90vw',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #333'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  title: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflowY: 'auto'
  },
  section: {
    borderBottom: '1px solid #333'
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    display: 'block'
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: '12px',
    display: 'block',
    marginTop: '2px',
    textTransform: 'capitalize'
  },
  expandIcon: {
    color: '#fff',
    fontSize: '18px'
  },
  sectionContent: {
    padding: '0 20px 16px'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    cursor: 'pointer'
  },
  radioCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  radioCircleActive: {
    borderColor: '#9b4dff'
  },
  radioInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#9b4dff'
  },
  radioText: {
    color: '#ccc',
    fontSize: '14px'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '0 20px 16px'
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 20px 16px'
  },
  pill: {
    padding: '10px 20px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ccc',
    fontSize: '14px',
    cursor: 'pointer',
    textTransform: 'capitalize'
  },
  pillActive: {
    backgroundColor: '#9b4dff',
    borderColor: '#9b4dff',
    color: '#fff'
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 16px'
  },
  priceField: {
    flex: 1
  },
  priceDash: {
    color: '#666'
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #333'
  },
  resultsBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#9b4dff',
    border: 'none',
    borderRadius: '24px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '1px'
  }
}
