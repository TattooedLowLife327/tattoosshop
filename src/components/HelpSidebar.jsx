import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'How do I purchase items?',
    a: 'Browse items, add them to your cart, then click "Proceed to Checkout" to reserve them. TattooedLowLife will contact you via Facebook with your final total including shipping.'
  },
  {
    q: 'What is the wishlist for?',
    a: 'Use the star icon to save items you\'re interested in. You\'ll be notified if the price changes or if a pending item becomes available again.'
  },
  {
    q: 'How long are items reserved?',
    a: 'Items are reserved for 24 hours pending payment. If payment is not received, items will be returned to available inventory.'
  },
  {
    q: 'How is shipping calculated?',
    a: 'Shipping costs are calculated based on your location and will be provided when TattooedLowLife contacts you after you reserve items.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Venmo, PayPal, Chime, and Facebook Pay. However, you can speak with Tattoo if other arrangements need to be made.'
  },
  {
    q: 'What do the condition ratings mean?',
    a: '- New: Never used\n- Like New: Used 1-2 times, no visible wear\n- Good: Light use, minor wear\n- Fair: Moderate use, visible wear\n- Poor: Heavy use, significant wear'
  },
  {
    q: 'Can I return items?',
    a: 'All sales are final unless return terms are arranged before completing purchase. Items are sold "as is" per the posted description and photos.'
  },
  {
    q: 'Who pays for shipping?',
    a: 'Buyer is responsible for shipping costs. Please allow 1-3 business days for shipment to be taken to the post office.'
  }
]

const TERMS_CONTENT = `
All items are sold "as is" with no warranties or guarantees beyond posted descriptions and photos.

The Facebook name and shipping address you provide will be used exactly as entered. We are not responsible for incorrect or incomplete information.

If we cannot reach you via Facebook Messenger within 24 hours of claiming items, your items will be returned to available inventory.

We are not responsible for packages lost, stolen, or damaged in transit after leaving our possession. Shipping issues must be resolved with the carrier.

Buyer is responsible for shipping costs. We will do our best to ship next day, but please allow 1-3 business days for shipment.

Payment providers and shipping services operate independently. Buyer is responsible for resolving payment/dispute issues directly with them.

All sales are final unless return terms are arranged before completing purchase.

Force majeure events (postal strikes, disasters, tech outages) may delay or affect fulfillment. We are not liable for such delays.

No resale, cart hoarding, or multi-account claiming allowed. One profile per user.

Spam, abuse, or attempted system manipulation results in restriction or removal from the app.

Our financial liability is limited solely to the sale price of the item purchased.
`.trim()

const PRIVACY_CONTENT = `
Information We Collect:
- Facebook display name (for communication)
- Shipping address (for order fulfillment)
- IP address (for fraud prevention)
- Browser/device info (for fraud prevention)
- Wishlist and cart activity

How We Use Your Information:
- To process and fulfill your orders
- To communicate about your purchases via Facebook
- To send notifications about wishlisted items
- To prevent fraud and abuse

Data Retention:
- Order information is retained for record-keeping
- You can clear your local data by clearing browser storage

We do not sell your information to third parties.

Contact: Reach out via Facebook to TattooedLowLife for any privacy concerns.
`.trim()

export default function HelpSidebar({ isOpen, onClose, initialTab = 'faq' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [expandedFaq, setExpandedFaq] = useState(null)

  // Update activeTab when initialTab changes
  if (isOpen && activeTab !== initialTab) {
    setActiveTab(initialTab)
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Help & Info</h2>
          <button onClick={onClose} style={styles.closeBtn}>X</button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'faq' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'terms' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('terms')}
          >
            Terms
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'privacy' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'faq' && (
            <div style={styles.faqList}>
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} style={styles.faqItem}>
                  <button
                    style={styles.faqQuestion}
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span>{item.q}</span>
                    <span style={styles.faqArrow}>
                      {expandedFaq === index ? '-' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <p style={styles.faqAnswer}>{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'terms' && (
            <div style={styles.textContent}>
              <h3 style={styles.contentTitle}>Terms of Service</h3>
              <p style={styles.textBlock}>{TERMS_CONTENT}</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={styles.textContent}>
              <h3 style={styles.contentTitle}>Privacy Policy</h3>
              <p style={styles.textBlock}>{PRIVACY_CONTENT}</p>
            </div>
          )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  sidebar: {
    width: '100%',
    maxWidth: '450px',
    height: '100%',
    backgroundColor: '#111',
    borderLeft: '1px solid #333',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#fff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #333'
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    color: '#9b4dff',
    borderBottomColor: '#9b4dff'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  faqQuestion: {
    width: '100%',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqArrow: {
    color: '#9b4dff',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  faqAnswer: {
    padding: '0 16px 14px',
    margin: 0,
    color: '#aaa',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-line'
  },
  textContent: {
    color: '#fff'
  },
  contentTitle: {
    color: '#9b4dff',
    fontSize: '18px',
    marginBottom: '16px'
  },
  textBlock: {
    color: '#ccc',
    fontSize: '14px',
    lineHeight: '1.8',
    whiteSpace: 'pre-line',
    margin: 0
  }
}
