export default function StatusChip({ status }) {
  const getStyle = () => {
    switch (status) {
      case 'available':
        return { backgroundColor: '#666', color: '#fff' }
      case 'pending':
        return { backgroundColor: '#9b4dff', color: '#fff' }
      case 'sold':
        return { backgroundColor: '#22c55e', color: '#fff' }
      default:
        return { backgroundColor: '#666', color: '#fff' }
    }
  }

  return (
    <span className="status-chip" style={getStyle()}>
      {status}
    </span>
  )
}
