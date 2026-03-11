export default function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', color: 'var(--text-muted)', gap: 12, textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 48, height: 48, background: 'var(--bg-elevated)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
        }}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      )}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</div>
        {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
      </div>
    </div>
  )
}
