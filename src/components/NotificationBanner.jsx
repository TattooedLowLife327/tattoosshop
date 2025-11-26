import { useState, useEffect } from 'react'

export default function NotificationBanner({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null

  return (
    <div style={styles.container}>
      {notifications.map((notif, idx) => (
        <div
          key={notif.id || idx}
          style={{
            ...styles.banner,
            backgroundColor: notif.type === 'error' ? '#ff4d4d' :
                           notif.type === 'success' ? '#4dff88' :
                           notif.type === 'warning' ? '#ffb84d' : '#9b4dff'
          }}
        >
          <span style={styles.message}>{notif.message}</span>
          <button
            style={styles.dismissBtn}
            onClick={() => onDismiss(notif.id || idx)}
          >
            X
          </button>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '500px',
    width: '90%'
  },
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  message: {
    color: '#000',
    fontSize: '14px',
    fontWeight: '500'
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#000',
    fontSize: '14px',
    cursor: 'pointer',
    opacity: 0.7
  }
}
