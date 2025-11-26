import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { FloatingLabelInput } from './ui'

export default function PincodeEntry({ onSuccess }) {
  const [pincode, setPincode] = useState('')
  const [error, setError] = useState('')
  const { login } = useAdmin()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(pincode)) {
      onSuccess?.()
    } else {
      setError('Invalid pincode')
      setPincode('')
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Admin Access</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <FloatingLabelInput
            name="pincode"
            label="Enter Pincode"
            type="password"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            autoComplete="off"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Enter</button>
        </form>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '32px',
    width: '100%',
    maxWidth: '320px'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '24px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  error: {
    color: '#ff4d4d',
    fontSize: '13px',
    margin: 0,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  }
}
