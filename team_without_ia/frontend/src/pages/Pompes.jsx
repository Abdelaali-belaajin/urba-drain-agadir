import { useState, useEffect, useCallback } from 'react'
import { pompesAPI } from '../api'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { pompeStatutConfig, fmtDate, fmtDatetime, fmtNum } from '../utils/helpers'
import { Zap, Play, Square, AlertTriangle, Clock, Settings, Activity } from 'lucide-react'

const STATUT_OPTIONS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'PANNE']

export default function Pompes() {
  const [pompes, setPompes] = useState([])
  const [loading, setLoading] = useState(true)
  const [statutFilter, setStatutFilter] = useState('')
  const [actionModal, setActionModal] = useState(null) // { pompe, action: 'activer' | 'desactiver' }
  const [utilisateur, setUtilisateur] = useState('operateur1')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await pompesAPI.getAll(statutFilter || undefined)
      setPompes(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statutFilter])

  useEffect(() => { load() }, [load])

  const doAction = async () => {
    if (!actionModal) return
    setActionError('')
    setActionLoading(true)
    try {
      if (actionModal.action === 'activer') {
        await pompesAPI.activer(actionModal.pompe.id_pompe, utilisateur || undefined)
      } else {
        await pompesAPI.desactiver(actionModal.pompe.id_pompe, utilisateur || undefined)
      }
      setSuccessMsg(`Pompe ${actionModal.action === 'activer' ? 'activée' : 'désactivée'} avec succès.`)
      setActionModal(null)
      load()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e) {
      setActionError(e.response?.data?.error || 'Erreur lors de l\'opération.')
    } finally {
      setActionLoading(false)
    }
  }

  const grouped = {
    ACTIVE:      pompes.filter(p => p.statut === 'ACTIVE'),
    INACTIVE:    pompes.filter(p => p.statut === 'INACTIVE'),
    MAINTENANCE: pompes.filter(p => p.statut === 'MAINTENANCE'),
    PANNE:       pompes.filter(p => p.statut === 'PANNE'),
  }

  return (
    <div className="fade-in">
      {/* Success message */}
      {successMsg && (
        <div className="alert-banner alert-banner-green" style={{ marginBottom: 16 }}>
          <div className="live-dot live-dot-green" />
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Filter + stats header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', ...STATUT_OPTIONS].map(s => {
            const active = statutFilter === s
            const cfg = s ? pompeStatutConfig[s] : null
            return (
              <button
                key={s}
                className="btn btn-sm"
                onClick={() => setStatutFilter(s)}
                style={{
                  background: active ? 'var(--cyan-dim)' : 'transparent',
                  borderColor: active ? 'var(--border-active)' : 'var(--border-subtle)',
                  color: active ? 'var(--cyan)' : 'var(--text-muted)',
                  fontSize: 11,
                }}
              >
                {!s ? `Toutes (${pompes.length})` : `${cfg.label} (${grouped[s]?.length || 0})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4 fade-in-2" style={{ marginBottom: 24 }}>
        {[
          { label: 'Actives',     val: grouped.ACTIVE.length,      color: 'var(--green)',  cls: 'badge-green'  },
          { label: 'Inactives',   val: grouped.INACTIVE.length,    color: 'var(--text-muted)', cls: 'badge-muted' },
          { label: 'Maintenance', val: grouped.MAINTENANCE.length, color: 'var(--yellow)', cls: 'badge-yellow' },
          { label: 'En panne',    val: grouped.PANNE.length,       color: 'var(--red)',    cls: 'badge-red'    },
        ].map(({ label, val, color, cls }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{val}</div>
            <span className={`badge ${cls}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Pump cards grid */}
      {loading
        ? <div className="grid-3">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}</div>
        : pompes.length === 0
          ? <EmptyState icon={Zap} title="Aucune pompe trouvée" sub="Modifiez les filtres" />
          : (
            <div className="grid-3">
              {pompes.map(p => {
                const cfg = pompeStatutConfig[p.statut] || {}
                const isActive = p.statut === 'ACTIVE'
                const canActivate = ['INACTIVE'].includes(p.statut)
                const canDeactivate = ['ACTIVE'].includes(p.statut)
                const isPanne = p.statut === 'PANNE'
                const isMaint = p.statut === 'MAINTENANCE'

                return (
                  <div key={p.id_pompe} className="card" style={{
                    border: `1px solid ${isActive ? 'rgba(0,229,160,0.2)' : isPanne ? 'rgba(255,61,90,0.15)' : 'var(--border-subtle)'}`,
                    background: isActive ? 'rgba(0,229,160,0.02)' : isPanne ? 'rgba(255,61,90,0.02)' : undefined,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Animated glow for active */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 60, height: 60,
                        background: 'var(--green)',
                        opacity: 0.04, borderRadius: '50%',
                        filter: 'blur(20px)',
                        animation: 'glow-pulse 3s ease-in-out infinite',
                      }} />
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cfg.dot
                          ? <div className={`live-dot ${cfg.dot}`} style={{ flexShrink: 0 }} />
                          : <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                        }
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{p.nom}</div>
                          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.reference}</div>
                        </div>
                      </div>
                      <span className={`badge ${cfg.cls}`} style={{ fontSize: 10 }}>{cfg.label}</span>
                    </div>

                    {/* Zone */}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
                      {p.nom_zone || `Zone #${p.id_zone}`}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      {[
                        { label: 'Capacité', val: `${fmtNum(p.capacite)} m³/h`, icon: Activity },
                        { label: 'Mode', val: p.mode_activation, icon: Settings },
                        { label: 'Heures moto', val: `${fmtNum(p.heures_fonctionnement)}h`, icon: Clock },
                        { label: 'Installation', val: fmtDate(p.date_installation), icon: Clock },
                      ].map(({ label, val, icon: Icon }) => (
                        <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 6, padding: '7px 9px' }}>
                          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 2, letterSpacing: '0.08em' }}>{label.toUpperCase()}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Last activation */}
                    {p.derniere_activation && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                        Dernière activation: {fmtDatetime(p.derniere_activation)}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canActivate && (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => { setActionModal({ pompe: p, action: 'activer' }); setActionError(''); }}
                        >
                          <Play size={12} /> Activer
                        </button>
                      )}
                      {canDeactivate && (
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => { setActionModal({ pompe: p, action: 'desactiver' }); setActionError(''); }}
                        >
                          <Square size={12} /> Désactiver
                        </button>
                      )}
                      {(isPanne || isMaint) && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: isPanne ? 'var(--red)' : 'var(--yellow)' }}>
                          <AlertTriangle size={12} />
                          {isPanne ? 'En panne — intervention requise' : 'En maintenance'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
      }

      {/* Action modal */}
      {actionModal && (
        <Modal
          title={actionModal.action === 'activer' ? `Activer — ${actionModal.pompe.nom}` : `Désactiver — ${actionModal.pompe.nom}`}
          onClose={() => setActionModal(null)}
          width={400}
        >
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            {actionModal.action === 'activer'
              ? <p>Confirmer l'activation de la pompe <strong style={{ color: 'var(--text-primary)' }}>{actionModal.pompe.nom}</strong> ?</p>
              : <p>Confirmer la désactivation de la pompe <strong style={{ color: 'var(--text-primary)' }}>{actionModal.pompe.nom}</strong> ?</p>
            }
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
              OPÉRATEUR (laisser vide pour automatique)
            </label>
            <input
              className="input"
              placeholder="operateur1"
              value={utilisateur}
              onChange={e => setUtilisateur(e.target.value)}
            />
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
            <strong>Déclencheur:</strong> {utilisateur ? 'MANUEL' : 'AUTOMATIQUE'}
          </div>

          {actionError && (
            <div className="alert-banner alert-banner-red" style={{ marginBottom: 12 }}>
              <AlertTriangle size={13} color="var(--red)" />
              <span style={{ fontSize: 12, color: 'var(--red)' }}>{actionError}</span>
            </div>
          )}

          <div className="divider" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setActionModal(null)}>Annuler</button>
            <button
              className={`btn ${actionModal.action === 'activer' ? 'btn-success' : 'btn-danger'}`}
              onClick={doAction}
              disabled={actionLoading}
            >
              {actionLoading ? 'En cours...' : actionModal.action === 'activer' ? '▶ Activer' : '■ Désactiver'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
