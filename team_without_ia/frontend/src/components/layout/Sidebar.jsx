import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Radio, Zap, Bell } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/zones',     icon: MapPin,          label: 'Zones'      },
  { to: '/capteurs',  icon: Radio,           label: 'Capteurs'   },
  { to: '/pompes',    icon: Zap,             label: 'Pompes'     },
  { to: '/alertes',   icon: Bell,            label: 'Alertes'    },
]

export default function Sidebar({ alertCount = 0 }) {
  const { sidebarCollapsed } = useTheme()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      <div style={{
        padding: sidebarCollapsed ? '24px 10px' : '24px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'padding 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--cyan)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--cyan-glow)',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="var(--text-inverse)" opacity="0.3"/>
              <path d="M12 4C7.58 4 4 7.58 4 12c0 2.84 1.36 5.37 3.47 6.96L12 14l4.53 4.96C18.64 17.37 20 14.84 20 12c0-4.42-3.58-8-8-8z" fill="var(--text-inverse)"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                Urba Drain
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                AGADIR
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: sidebarCollapsed ? '16px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, transition: 'padding 0.3s ease' }}>
        {!sidebarCollapsed && (
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '4px 8px', marginBottom: 6, whiteSpace: 'nowrap' }}>
            NAVIGATION
          </div>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? '12px' : '9px 12px',
              borderRadius: 'var(--r-md)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              background: isActive ? 'var(--cyan-dim)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,200,232,0.2)' : 'transparent'}`,
              transition: 'all 0.15s',
              position: 'relative',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            })}
            title={sidebarCollapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                {!sidebarCollapsed && (
                  <>
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
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
                {sidebarCollapsed && label === 'Alertes' && alertCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: 8,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 4px',
                    borderRadius: 8,
                    minWidth: 14,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}>
                    {alertCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{
        padding: sidebarCollapsed ? '16px 10px' : '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'padding 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div className="live-dot live-dot-green" />
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Système opérationnel</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
