import { useLocation } from 'react-router-dom'
import { Bell, RefreshCw, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const pageTitles = {
  '/':          { title: 'Dashboard',       sub: 'Vue générale du système' },
  '/zones':     { title: 'Zones',           sub: 'Gestion des zones de drainage' },
  '/capteurs':  { title: 'Capteurs IoT',    sub: 'Surveillance des niveaux en temps réel' },
  '/pompes':    { title: 'Pompes',          sub: 'Contrôle et activation des pompes' },
  '/alertes':   { title: 'Alertes',         sub: 'Incidents et notifications système' },
}

export default function Topbar({ onRefresh, loading = false, alertCount = 0 }) {
  const location = useLocation()
  const { theme, toggleTheme, toggleSidebar } = useTheme()
  const page = pageTitles[location.pathname] || { title: 'Page', sub: '' }

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="btn btn-outline btn-icon"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Menu size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {page.title}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
            {page.sub}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          padding: '5px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          {new Date().toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>

        <button
          className="btn btn-outline btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          className="btn btn-outline btn-icon"
          onClick={onRefresh}
          disabled={loading}
          title="Rafraîchir"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-outline btn-icon"
            style={{ borderColor: alertCount > 0 ? 'rgba(255,61,90,0.3)' : 'var(--border-subtle)', color: alertCount > 0 ? 'var(--red)' : undefined }}
          >
            <Bell size={14} />
          </button>
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: 'var(--red)',
              color: '#fff',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 10,
              minWidth: 16,
              textAlign: 'center',
              lineHeight: '14px',
            }}>
              {alertCount}
            </span>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 22, height: 22,
            background: 'var(--cyan-dim)',
            border: '1px solid var(--border-active)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: 'var(--cyan)',
          }}>
            A
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>admin_sys</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </header>
  )
}
