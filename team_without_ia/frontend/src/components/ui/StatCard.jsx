export default function StatCard({ label, value, sub, icon: Icon, color = 'var(--cyan)', trend, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ minHeight: 100 }}>
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '70%' }} />
      </div>
    )
  }

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: color,
        opacity: 0.04,
        borderRadius: '50%',
        filter: 'blur(20px)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 28, height: 28,
            background: `${color}18`,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}25`,
          }}>
            <Icon size={13} color={color} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
        {value ?? '—'}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {sub}
        </div>
      )}

      {trend && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 8,
          fontSize: 10,
          color: trend > 0 ? 'var(--red)' : 'var(--green)',
          fontFamily: 'var(--font-mono)',
        }}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
