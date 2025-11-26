export default function AnimatedCheckbox({
  checked,
  onChange,
  label,
  color = '#9b4dff'
}) {
  return (
    <label style={styles.container} onClick={() => onChange(!checked)}>
      <div style={styles.checkboxWrapper}>
        <svg width="28" height="28" viewBox="0 0 28 28">
          {/* Border rectangle */}
          <rect
            x="3"
            y="3"
            width="22"
            height="22"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="88"
            strokeDashoffset={checked ? '88' : '0'}
            rx="4"
            style={{
              opacity: checked ? 0 : 1,
              transition: checked
                ? 'stroke-dashoffset 0.3s ease-out, opacity 0.2s ease-out 0.3s'
                : 'opacity 0.2s ease-out 0.2s, stroke-dashoffset 0.3s ease-out 0.2s',
              transformOrigin: '14px 14px'
            }}
          />
          {/* Checkmark */}
          <path
            d="M7 14l4 4 10-8"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="20"
            strokeDashoffset={checked ? '0' : '20'}
            style={{
              transition: 'stroke-dashoffset 0.2s ease-out',
              transitionDelay: checked ? '0.3s' : '0s'
            }}
          />
        </svg>
      </div>
      <span style={styles.label}>{label}</span>
    </label>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkboxWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    marginLeft: '12px',
    color: '#fff',
    fontSize: '14px'
  }
}
