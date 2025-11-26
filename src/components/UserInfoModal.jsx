import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { recordUserAgreement, getClientIP } from '../lib/agreements'
import { FloatingLabelInput, AnimatedCheckbox } from './ui'

const DISCLAIMERS = [
  'All items are sold "as is"; no warranties or guarantees are provided beyond posted description/photos.',
  'We use the Facebook name and shipping address exactly as entered and are not responsible for info that is incorrect or incomplete.',
  'If we cannot reach you via Facebook Messenger within 24 hours of claim, your items will be returned to available inventory.',
  'We are not responsible for packages lost, stolen, or damaged in transit after leaving our possession; shipping issues must be resolved with carrier.',
  'Buyer is responsible for covering the cost of shipping; shipping cost will be calculated and added separately.',
  'We will do our best to ship next day, but please allow 1-3 business days for shipment to be taken to the post office.',
  'Descriptions/condition grades are best-effort; minor cosmetic discrepancies may occur.',
  'Payment providers and shipping services (Venmo, PayPal, Chime, postal/courier) operate independently; buyer is responsible for resolving payment/dispute issues directly with them.',
  'All sales are final unless return terms are arranged before completing purchase.',
  'Any force majeure events (postal strikes, disasters, tech outages) may delay or affect fulfillment; we are not liable for such delays.',
  'No resale, cart hoarding, or multi-account claiming allowed; one profile per user.',
  'Spam/abuse/attempted system manipulation results in restriction or removal from the app.',
  'Payment commitment is required; use only listed payment methods and send funds promptly.',
  'Limitation of liability: Our financial responsibility is limited solely to the sale price of the item purchased.'
]

export default function UserInfoModal() {
  const { showUserModal, setShowUserModal, saveUserInfo } = useUser()
  const [facebookName, setFacebookName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [streetAddress2, setStreetAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!showUserModal) return null

  const buildFullAddress = () => {
    let address = streetAddress.trim()
    if (streetAddress2.trim()) {
      address += '\n' + streetAddress2.trim()
    }
    address += '\n' + city.trim() + ', ' + state.trim() + ' ' + zip.trim()
    return address
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!facebookName.trim()) {
      setError('Facebook name is required')
      return
    }
    if (!streetAddress.trim()) {
      setError('Street address is required')
      return
    }
    if (!city.trim()) {
      setError('City is required')
      return
    }
    if (!state.trim()) {
      setError('State is required')
      return
    }
    if (!zip.trim()) {
      setError('ZIP code is required')
      return
    }
    if (!agreed) {
      setError('You must agree to the terms to continue')
      return
    }

    setLoading(true)
    try {
      const ipAddress = await getClientIP()
      const fullAddress = buildFullAddress()

      await recordUserAgreement({
        facebookName: facebookName.trim(),
        shippingAddress: fullAddress,
        ipAddress,
        userAgent: navigator.userAgent
      })

      saveUserInfo({
        facebookName: facebookName.trim(),
        shippingAddress: fullAddress
      })
    } catch (err) {
      console.error('Failed to record agreement:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowUserModal(false)
    setFacebookName('')
    setStreetAddress('')
    setStreetAddress2('')
    setCity('')
    setState('')
    setZip('')
    setAgreed(false)
    setError('')
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={handleClose}>X</button>

        <h2 style={styles.title}>Before You Continue</h2>
        <p style={styles.subtitle}>
          Please read and agree to the following terms, then provide your information.
        </p>

        <div style={styles.disclaimerBox}>
          <h3 style={styles.disclaimerTitle}>Terms, Conditions & Disclaimers</h3>
          <ul style={styles.disclaimerList}>
            {DISCLAIMERS.map((text, i) => (
              <li key={i} style={styles.disclaimerItem}>{text}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <FloatingLabelInput
            name="facebookName"
            label="Facebook Name *"
            value={facebookName}
            onChange={(e) => setFacebookName(e.target.value)}
            placeholder="Your exact Facebook display name"
            required
          />

          <FloatingLabelInput
            name="streetAddress"
            label="Street Address *"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="123 Main St"
            required
          />

          <FloatingLabelInput
            name="streetAddress2"
            label="Street Address Line 2"
            value={streetAddress2}
            onChange={(e) => setStreetAddress2(e.target.value)}
            placeholder="Apt, Suite, Unit, etc. (optional)"
          />

          <div style={styles.addressRow}>
            <div style={styles.cityField}>
              <FloatingLabelInput
                name="city"
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div style={styles.stateField}>
              <FloatingLabelInput
                name="state"
                label="State *"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                required
              />
            </div>

            <div style={styles.zipField}>
              <FloatingLabelInput
                name="zip"
                label="ZIP *"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.checkboxWrapper}>
            <AnimatedCheckbox
              checked={agreed}
              onChange={setAgreed}
              label=""
            />
            <span style={styles.checkboxText}>
              I have read and agree to all terms, conditions, and disclaimers above.
              I confirm my Facebook name and shipping address are accurate and accept
              responsibility for any issues.
            </span>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={!agreed || loading}
            style={{
              ...styles.submitBtn,
              opacity: agreed && !loading ? 1 : 0.5,
              cursor: agreed && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
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
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer'
  },
  title: {
    color: '#fff',
    margin: '0 0 8px 0',
    fontSize: '24px'
  },
  subtitle: {
    color: '#aaa',
    margin: '0 0 20px 0',
    fontSize: '14px'
  },
  disclaimerBox: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '20px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  disclaimerTitle: {
    color: '#9b4dff',
    margin: '0 0 12px 0',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  disclaimerList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#ccc',
    fontSize: '13px',
    lineHeight: '1.6'
  },
  disclaimerItem: {
    marginBottom: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  addressRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  cityField: {
    flex: '2',
    minWidth: '120px'
  },
  stateField: {
    flex: '1',
    minWidth: '70px',
    maxWidth: '100px'
  },
  zipField: {
    flex: '1',
    minWidth: '90px',
    maxWidth: '120px'
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  checkboxText: {
    color: '#ccc',
    fontSize: '13px',
    lineHeight: '1.5',
    flex: 1
  },
  error: {
    color: '#ff4d4d',
    fontSize: '13px',
    margin: 0
  },
  submitBtn: {
    backgroundColor: '#9b4dff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '8px'
  }
}
