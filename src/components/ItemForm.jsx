import { useState, useEffect } from 'react'
import { createInventoryItem, updateInventoryItem, uploadPhotos } from '../lib/supabase'
import { FloatingLabelInput, FloatingLabelSelect, FloatingLabelTextarea } from './ui'

const TYPES = ['barrel', 'flight', 'shaft', 'tip', 'Other']
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor']
const BRANDS = ['One80', 'Red Dragon', 'Unicorn', 'Harrow', 'Target', 'Winmau', 'Viper', 'Cuesoul', 'Other']
const PLAYERS = ['Phil Taylor', 'MVG', 'RvB', 'Peter Wright', 'Gerwyn Price', 'Simon Whitlock', 'Rob Cross', 'Mikuru Suzuki', 'Other']
const WEIGHTS = ['16g', '17g', '18g', '19g', '20g', '20.5g', '21g', '22g', 'Other']

export default function ItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'barrel',
    brand: '',
    player: '',
    weight: '',
    condition: 'new',
    price: '',
    retail_price: '',
    quantity: '1',
    notes: ''
  })
  const [photos, setPhotos] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (item) {
      const weightStr = item.weight ? `${item.weight}g` : ''
      const weightInList = WEIGHTS.includes(weightStr)

      setFormData({
        type: item.type || 'barrel',
        brand: item.brand || '',
        player: item.player || '',
        weight: weightInList ? weightStr : '',
        condition: item.condition || 'new',
        price: item.price?.toString() || '',
        retail_price: item.retail_price?.toString() || '',
        quantity: item.quantity?.toString() || '1',
        notes: item.notes || ''
      })
      setExistingPhotos(item.photo_urls || [])
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let actualWeight = 0
      if (formData.weight && formData.weight !== 'Other') {
        actualWeight = parseFloat(formData.weight.replace('g', '')) || 0
      }

      if (!formData.type) {
        throw new Error('Type is required')
      }
      if (!formData.brand) {
        throw new Error('Brand is required')
      }
      if (!formData.player) {
        throw new Error('Player is required')
      }

      let photoUrls = existingPhotos
      if (photos.length > 0) {
        const newUrls = await uploadPhotos(photos, formData.type)
        photoUrls = [...existingPhotos, ...newUrls]
      }

      const data = {
        type: formData.type,
        brand: formData.brand,
        player: formData.player,
        weight: actualWeight,
        condition: formData.condition,
        price: parseFloat(formData.price) || 0,
        retail_price: formData.retail_price ? parseFloat(formData.retail_price) : null,
        quantity: parseInt(formData.quantity) || 1,
        notes: formData.notes || null,
        photo_urls: photoUrls
      }

      if (item) {
        await updateInventoryItem(item.id, data)
      } else {
        await createInventoryItem(data)
      }

      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeExistingPhoto = (index) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h2 style={styles.title}>{item ? 'Edit Item' : 'Add New Item'}</h2>

      <div style={styles.row}>
        <div style={styles.field}>
          <FloatingLabelSelect
            name="type"
            label="Type *"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            {TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </FloatingLabelSelect>
        </div>

        <div style={styles.field}>
          <FloatingLabelSelect
            name="condition"
            label="Condition *"
            value={formData.condition}
            onChange={handleChange}
            required
          >
            {CONDITIONS.map(cond => (
              <option key={cond} value={cond}>
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </option>
            ))}
          </FloatingLabelSelect>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <FloatingLabelSelect
            name="brand"
            label="Brand *"
            value={formData.brand}
            onChange={handleChange}
            required
          >
            <option value="">Select Brand</option>
            {BRANDS.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </FloatingLabelSelect>
        </div>

        <div style={styles.field}>
          <FloatingLabelSelect
            name="player"
            label="Player *"
            value={formData.player}
            onChange={handleChange}
            required
          >
            <option value="">Select Player</option>
            {PLAYERS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FloatingLabelSelect>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <FloatingLabelSelect
            name="weight"
            label="Weight"
            value={formData.weight}
            onChange={handleChange}
          >
            <option value="">Select Weight</option>
            {WEIGHTS.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </FloatingLabelSelect>
        </div>

        <div style={styles.field}>
          <FloatingLabelInput
            name="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            inputMode="numeric"
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <FloatingLabelInput
            name="retail_price"
            label="Retail Price ($)"
            type="number"
            value={formData.retail_price}
            onChange={handleChange}
            step="0.01"
            placeholder="Original retail value"
            prefix="$"
          />
        </div>

        <div style={styles.field}>
          <FloatingLabelInput
            name="price"
            label="Current Price ($) *"
            type="number"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
            prefix="$"
          />
        </div>
      </div>

      <FloatingLabelTextarea
        name="notes"
        label="Notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any additional details..."
        rows={3}
      />

      <div style={styles.field}>
        <label style={styles.label}>Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          style={styles.fileInput}
        />
        {existingPhotos.length > 0 && (
          <div style={styles.photoPreview}>
            {existingPhotos.map((url, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img src={url} alt={`Photo ${index + 1}`} style={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(index)}
                  style={styles.removePhotoBtn}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length > 0 && (
          <div style={{ marginTop: '10px', color: '#aaa', fontSize: '14px' }}>
            {photos.length} new photo(s) selected
          </div>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.buttonRow}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
          disabled={loading}
        >
          {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#fff'
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  field: {
    flex: '1',
    minWidth: '150px'
  },
  label: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '8px',
    display: 'block'
  },
  fileInput: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px dashed #333',
    backgroundColor: '#222',
    color: '#fff',
    fontSize: '14px',
    width: '100%'
  },
  photoPreview: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  previewImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #333'
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#ff4d4d',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '20px',
    padding: 0
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#9b4dff',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  cancelButton: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  error: {
    color: '#ff4d4d',
    fontSize: '14px'
  }
}
