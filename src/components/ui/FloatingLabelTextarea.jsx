import { useState, useEffect, useRef } from 'react'

export default function FloatingLabelTextarea({
  name,
  value,
  onChange,
  label,
  required = false,
  placeholder,
  minLength,
  maxLength,
  disabled = false,
  rows = 3
}) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)
  const shouldFloat = isFocused || (value && value.trim().length > 0)

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div style={styles.container}>
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        placeholder={isFocused ? placeholder : ' '}
        style={{
          ...styles.textarea,
          minHeight: `${rows * 24 + 24}px`,
          borderColor: isFocused ? '#9b4dff' : '#333',
          boxShadow: isFocused ? '0 0 0 2px rgba(155, 77, 255, 0.2)' : 'none'
        }}
      />
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
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%'
  },
  textarea: {
    width: '100%',
    padding: '16px 12px 12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
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
    top: '16px',
    fontSize: '14px',
    color: '#666'
  },
  labelFloating: {
    top: '-8px',
    fontSize: '12px',
    color: '#9b4dff'
  }
}
