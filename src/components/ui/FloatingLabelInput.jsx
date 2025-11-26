import { useState } from 'react'

export default function FloatingLabelInput({
  id,
  name,
  value,
  onChange,
  label,
  type = 'text',
  inputMode,
  step,
  pattern,
  maxLength,
  autoComplete = 'off',
  placeholder,
  required,
  disabled,
  prefix
}) {
  const [isFocused, setIsFocused] = useState(false)
  const shouldFloat = isFocused || (value && value !== '')

  return (
    <div style={styles.container}>
      {prefix && (
        <span style={styles.prefix}>{prefix}</span>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        required={required}
        inputMode={inputMode}
        step={step}
        pattern={pattern}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={isFocused ? placeholder : ' '}
        style={{
          ...styles.input,
          paddingLeft: prefix ? '32px' : '12px',
          borderColor: isFocused ? '#9b4dff' : '#333',
          boxShadow: isFocused ? '0 0 0 2px rgba(155, 77, 255, 0.2)' : 'none'
        }}
      />
      <label
        htmlFor={id || name}
        style={{
          ...styles.label,
          ...(shouldFloat ? styles.labelFloating : styles.labelResting),
          left: prefix ? '32px' : '12px'
        }}
      >
        {label}
      </label>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%'
  },
  input: {
    width: '100%',
    height: '48px',
    padding: '12px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  prefix: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9b4dff',
    pointerEvents: 'none'
  },
  label: {
    position: 'absolute',
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
  }
}
