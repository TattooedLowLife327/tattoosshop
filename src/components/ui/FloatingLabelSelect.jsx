import { useState } from 'react'

export default function FloatingLabelSelect({
  name,
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  children
}) {
  const [isFocused, setIsFocused] = useState(false)
  const shouldFloat = isFocused || (value && value !== '')

  return (
    <div style={styles.container}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        required={required}
        style={{
          ...styles.select,
          borderColor: isFocused ? '#9b4dff' : '#333',
          boxShadow: isFocused ? '0 0 0 2px rgba(155, 77, 255, 0.2)' : 'none'
        }}
      >
        {children}
      </select>
      {label && (
        <label
          htmlFor={name}
          style={{
            ...styles.label,
            ...(shouldFloat ? styles.labelFloating : styles.labelResting)
          }}
        >
          {label}
        </label>
      )}
      <div style={styles.arrow}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%'
  },
  select: {
    width: '100%',
    height: '48px',
    padding: '12px',
    paddingRight: '36px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  label: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#1a1a1a',
    padding: '0 4px'
  },
  labelResting: {
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: '#666'
  },
  labelFloating: {
    top: '-8px',
    transform: 'translateY(0)',
    fontSize: '12px',
    color: '#9b4dff'
  },
  arrow: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    pointerEvents: 'none'
  }
}
