import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ title, onClose, children, width = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: width }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
          <button className="btn btn-outline btn-icon btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
