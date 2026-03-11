import { useState } from 'react'
import { Bell, AlertTriangle, Wrench, Zap, Radio, CheckCircle, Clock, Filter } from 'lucide-react'
import { severiteConfig, typeAlerteLabels, fmtDatetime } from '../utils/helpers'
import EmptyState from '../components/ui/EmptyState'

// Static alerts data (from DB seed) since there's no /api/alertes endpoint
const ALERTES_STATIC = [
  { id_alerte: 1, type_alerte: 'NIVEAU_ELEVE', niveau_severite: 'CRITIQUE', statut: 'ACTIVE', titre: 'Niveau critique Zone Centre', message: 'Capteur CAP-NIV-007 : valeur 2.60m > seuil 2.50m', timestamp_creation: '2025-03-02T05:30:00', id_capteur: 11, id_pompe: 9, id_zone: 5, nom_zone: 'Zone Centre - Commerce' },
  { id_alerte: 2, type_alerte: 'NIVEAU_ELEVE', niveau_severite: 'URGENCE', statut: 'ACTIVE', titre: 'Inondation imminente Zone Sud', message: 'Capteur CAP-NIV-003 : valeur 2.95m > seuil 3.00m', timestamp_creation: '2025-03-02T04:00:00', id_capteur: 4, id_pompe: 4, id_zone: 2, nom_zone: 'Zone Sud - Centre Ville' },
  { id_alerte: 3, type_alerte: 'PANNE_CAPTEUR', niveau_severite: 'AVERTISSEMENT', statut: 'ACTIVE', titre: 'Capteur CAP-NIV-004 défaillant', message: 'Capteur hors ligne depuis 18 jours', timestamp_creation: '2025-02-13T10:00:00', id_capteur: 5, id_pompe: null, id_zone: 2, nom_zone: 'Zone Sud - Centre Ville' },
  { id_alerte: 4, type_alerte: 'PANNE_POMPE', niveau_severite: 'CRITIQUE', statut: 'ACTIVE', titre: 'Pompe PMP-010 en panne', message: 'Défaillance moteur détectée, pompe arrêtée', timestamp_creation: '2025-02-15T12:30:00', id_capteur: null, id_pompe: 10, id_zone: 5, nom_zone: 'Zone Centre - Commerce' },
  { id_alerte: 5, type_alerte: 'MAINTENANCE', niveau_severite: 'INFO', statut: 'RESOLUE', titre: 'Maintenance programmée PMP-003', message: 'Maintenance préventive effectuée avec succès', timestamp_creation: '2025-02-28T07:00:00', timestamp_resolution: '2025-03-01T12:00:00', utilisateur_acquittement: 'technicien1', actions_prises: 'Remplacement joint hydraulique, vérification moteur, test OK', id_capteur: null, id_pompe: 3, id_zone: 1, nom_zone: 'Zone Nord - Quartier Industriel' },
  { id_alerte: 6, type_alerte: 'NIVEAU_ELEVE', niveau_severite: 'AVERTISSEMENT', statut: 'RESOLUE', titre: 'Niveau élevé Zone Nord après pluies', message: 'Niveau remonté à 3.80m, pompes activées', timestamp_creation: '2025-02-20T18:00:00', timestamp_resolution: '2025-02-21T06:00:00', utilisateur_acquittement: 'operateur1', actions_prises: 'Activation pompes P1 et P2, surveillance renforcée 6h', id_capteur: 1, id_pompe: 1, id_zone: 1, nom_zone: 'Zone Nord - Quartier Industriel' },
  { id_alerte: 7, type_alerte: 'PANNE_POMPE', niveau_severite: 'AVERTISSEMENT', statut: 'ACQUITTEE', titre: 'Pompe PMP-007 en mode secours', message: "Pompe planifiée non démarrée à l'heure prévue", timestamp_creation: '2025-02-25T19:30:00', utilisateur_acquittement: 'operateur2', id_capteur: null, id_pompe: 7, id_zone: 3, nom_zone: 'Zone Est - Résidentiel' },
  { id_alerte: 8, type_alerte: 'MAINTENANCE', niveau_severite: 'INFO', statut: 'ACTIVE', titre: 'Maintenance capteur CAP-DEB-002', message: 'Capteur en maintenance, données indisponibles', timestamp_creation: '2025-03-01T08:00:00', id_capteur: 8, id_pompe: null, id_zone: 3, nom_zone: 'Zone Est - Résidentiel' },
]

const typeIcon = {
  NIVEAU_ELEVE: AlertTriangle,
  PANNE_CAPTEUR: Radio,
  PANNE_POMPE: Zap,
  MAINTENANCE: Wrench,
}

const statutConfig = {
  ACTIVE:    { label: 'Active',     cls: 'badge-red',    border: 'rgba(255,61,90,0.15)' },
  ACQUITTEE: { label: 'Acquittée',  cls: 'badge-yellow', border: 'rgba(245,200,66,0.12)' },
  RESOLUE:   { label: 'Résolue',    cls: 'badge-green',  border: 'rgba(0,229,160,0.1)' },
  IGNOREE:   { label: 'Ignorée',    cls: 'badge-muted',  border: 'var(--border-subtle)' },
}

export default function Alertes() {
  const [statutFilter, setStatutFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const filtered = ALERTES_STATIC.filter(a => {
    if (statutFilter !== 'ALL' && a.statut !== statutFilter) return false
    if (typeFilter !== 'ALL' && a.type_alerte !== typeFilter) return false
    return true
  }).sort((a, b) => new Date(b.timestamp_creation) - new Date(a.timestamp_creation))

  const activeCount = ALERTES_STATIC.filter(a => a.statut === 'ACTIVE').length

  return (
    <div className="fade-in">
      {/* Active banner */}
      {activeCount > 0 && (
        <div className="alert-banner alert-banner-red" style={{ marginBottom: 20, alignItems: 'center' }}>
          <div className="live-dot live-dot-red" />
          <strong style={{ color: 'var(--red)' }}>{activeCount} alerte{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 4 }}>— Intervention requise</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'ACTIVE', 'ACQUITTEE', 'RESOLUE'].map(s => (
            <button
              key={s}
              className="btn btn-sm"
              onClick={() => setStatutFilter(s)}
              style={{
                background: statutFilter === s ? 'var(--cyan-dim)' : 'transparent',
                borderColor: statutFilter === s ? 'var(--border-active)' : 'var(--border-subtle)',
                color: statutFilter === s ? 'var(--cyan)' : 'var(--text-muted)',
                fontSize: 11,
              }}
            >
              {s === 'ALL' ? 'Toutes' : statutConfig[s]?.label}
              {s !== 'ALL' && (
                <span style={{ marginLeft: 4, fontFamily: 'var(--font-mono)' }}>
                  ({ALERTES_STATIC.filter(a => a.statut === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

        <select
          className="select" style={{ width: 180 }}
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="ALL">Tous types</option>
          {Object.entries(typeAlerteLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Alert list */}
      {filtered.length === 0
        ? <EmptyState icon={Bell} title="Aucune alerte" sub="Aucune alerte correspondant aux filtres sélectionnés" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(a => {
              const Icon = typeIcon[a.type_alerte] || Bell
              const sevCfg = severiteConfig[a.niveau_severite] || {}
              const stCfg = statutConfig[a.statut] || {}
              const isActive = a.statut === 'ACTIVE'

              return (
                <div key={a.id_alerte} className="card" style={{
                  border: `1px solid ${stCfg.border}`,
                  background: isActive && a.niveau_severite === 'URGENCE' ? 'rgba(255,61,90,0.03)' : undefined,
                  animation: isActive ? 'fade-in-up 0.3s ease' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, flexShrink: 0,
                      background: isActive ? 'rgba(255,61,90,0.1)' : 'var(--bg-surface)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${isActive ? 'rgba(255,61,90,0.2)' : 'var(--border-subtle)'}`,
                    }}>
                      <Icon size={15} color={isActive ? 'var(--red)' : 'var(--text-muted)'} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 13 }}>{a.titre}</span>
                        {isActive && <div className="live-dot live-dot-red" />}
                        <span className={`badge ${sevCfg.cls}`} style={{ fontSize: 10 }}>{sevCfg.label}</span>
                        <span className={`badge ${stCfg.cls}`} style={{ fontSize: 10 }}>{stCfg.label}</span>
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>{typeAlerteLabels[a.type_alerte]}</span>
                      </div>

                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.message}</p>

                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        <span>📍 {a.nom_zone}</span>
                        {a.id_capteur && <span>📡 Capteur #{a.id_capteur}</span>}
                        {a.id_pompe && <span>⚡ Pompe #{a.id_pompe}</span>}
                        <span>🕐 {fmtDatetime(a.timestamp_creation)}</span>
                        {a.timestamp_resolution && <span>✅ Résolu: {fmtDatetime(a.timestamp_resolution)}</span>}
                      </div>

                      {a.utilisateur_acquittement && (
                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>Acquitté par:</strong> {a.utilisateur_acquittement}
                        </div>
                      )}

                      {a.actions_prises && (
                        <div style={{
                          marginTop: 8, padding: '6px 10px',
                          background: 'var(--bg-surface)',
                          borderRadius: 6, border: '1px solid var(--border-subtle)',
                          fontSize: 11, color: 'var(--text-secondary)',
                        }}>
                          <strong style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em' }}>ACTIONS PRISES — </strong>
                          {a.actions_prises}
                        </div>
                      )}
                    </div>

                    {/* Right: alerte ID */}
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>
                      #{String(a.id_alerte).padStart(4, '0')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      {/* Note about API */}
      <div style={{ marginTop: 24, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> Les alertes sont affichées depuis les données statiques. Pour les alertes en temps réel, ajoutez l'endpoint <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>GET /api/alertes</code> dans le backend Flask.
      </div>
    </div>
  )
}
