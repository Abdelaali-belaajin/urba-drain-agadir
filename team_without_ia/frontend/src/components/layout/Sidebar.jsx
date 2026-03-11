import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Radio, Zap, Bell, Settings } from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/zones',     icon: MapPin,          label: 'Zones'      },
  { to: '/capteurs',  icon: Radio,           label: 'Capteurs'   },
  { to: '/pompes',    icon: Zap,             label: 'Pompes'     },
  { to: '/alertes',   icon: Bell,            label: 'Alertes'    },
]

export default function Sidebar({ alertCount = 0 }) {
  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--cyan)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--cyan-glow)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="var(--text-inverse)" opacity="0.3"/>
              <path d="M12 4C7.58 4 4 7.58 4 12c0 2.84 1.36 5.37 3.47 6.96L12 14l4.53 4.96C18.64 17.37 20 14.84 20 12c0-4.42-3.58-8-8-8z" fill="var(--text-inverse)"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Urba Drain
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              AGADIR
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '4px 8px', marginBottom: 6 }}>
          NAVIGATION
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--r-md)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              background: isActive ? 'var(--cyan-dim)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,200,232,0.2)' : 'transparent'}`,
              transition: 'all 0.15s',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Alertes' && alertCount > 0 && (
                  <span style={{
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: 'center',
                  }}>
                    {alertCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot live-dot-green" />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Système opérationnel</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
