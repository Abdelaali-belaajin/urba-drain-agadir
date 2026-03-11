export default function Badge({ children, variant = 'cyan', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className={`live-dot live-dot-${variant}`} style={{ width: 5, height: 5 }} />}
      {children}
    </span>
  )
}
