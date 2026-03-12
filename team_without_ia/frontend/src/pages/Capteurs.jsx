import { useState, useEffect, useCallback } from 'react'
import { capteursAPI, zonesAPI } from '../api'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { capteurStatutConfig, typeCapteurConfig, fmtDate, fmtDatetime } from '../utils/helpers'
import { Radio, Plus, Pencil, PowerOff, AlertTriangle, Gauge, Droplets, Wind, Filter, Search } from 'lucide-react'

const TYPE_OPTIONS = ['NIVEAU', 'DEBIT', 'PRESSION']
const STATUT_OPTIONS = ['ACTIF', 'INACTIF', 'MAINTENANCE', 'DEFAILLANT']

const defaultForm = {
  reference: '', type_capteur: 'NIVEAU', localisation: '', id_zone: '',
  seuil_alerte: '', seuil_critique: '', date_installation: '',
  latitude: '', longitude: '',
}

const typeIcon = { NIVEAU: Droplets, DEBIT: Gauge, PRESSION: Wind }

export default function Capteurs() {
  const [capteurs, setCapteurs] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [critiquesOnly, setCritiquesOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter) params.type = typeFilter
      if (statutFilter) params.statut = statutFilter
      if (critiquesOnly) params.critique = 'true'
      const [cRes, zRes] = await Promise.all([capteursAPI.getAll(params), zonesAPI.getAll()])
      setCapteurs(cRes.data.data || [])
      setZones(zRes.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statutFilter, critiquesOnly])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setError(''); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      reference: c.reference || '',
      type_capteur: c.type_capteur || 'NIVEAU',
      localisation: c.localisation || '',
      id_zone: c.id_zone || '',
      seuil_alerte: c.seuil_alerte || '',
      seuil_critique: c.seuil_critique || '',
      date_installation: c.date_installation || '',
      statut: c.statut || 'ACTIF',
      latitude: c.latitude || '',
      longitude: c.longitude || '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.reference || !form.localisation || !form.id_zone || !form.seuil_alerte || !form.seuil_critique || !form.date_installation) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (parseFloat(form.seuil_critique) <= parseFloat(form.seuil_alerte)) {
      setError('Le seuil critique doit être supérieur au seuil alerte.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        seuil_alerte: parseFloat(form.seuil_alerte),
        seuil_critique: parseFloat(form.seuil_critique),
        id_zone: parseInt(form.id_zone),
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      }
      if (editing) {
        await capteursAPI.update(editing.id_capteur, payload)
      } else {
        await capteursAPI.create(payload)
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (c) => {
    if (!confirm(`Désactiver le capteur ${c.reference} ?`)) return
    try {
      await capteursAPI.deactivate(c.id_capteur)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur')
    }
  }

  const filtered = capteurs.filter(c =>
    !search || c.reference?.toLowerCase().includes(search.toLowerCase()) || c.localisation?.toLowerCase().includes(search.toLowerCase())
  )

  const isCritical = (c) => c.derniere_lecture !== null && c.derniere_lecture !== undefined && c.seuil_critique && parseFloat(c.derniere_lecture) > parseFloat(c.seuil_critique)

  return (
    <div className="fade-in">
      {/* Filters bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Rechercher par référence ou localisation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="select" style={{ width: 150 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Tous types</option>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{typeCapteurConfig[t]?.label}</option>)}
        </select>

        <select className="select" style={{ width: 160 }} value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="">Tous statuts</option>
          {STATUT_OPTIONS.map(s => <option key={s} value={s}>{capteurStatutConfig[s]?.label}</option>)}
        </select>

        <button
          className={`btn btn-sm ${critiquesOnly ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => setCritiquesOnly(v => !v)}
        >
          <AlertTriangle size={12} /> Critiques seulement
        </button>

        <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ marginLeft: 'auto' }}>
          <Plus size={13} /> Nouveau capteur
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: capteurs.length, cls: 'badge-cyan' },
          { label: 'Actifs', val: capteurs.filter(c => c.statut === 'ACTIF').length, cls: 'badge-green' },
          { label: 'Défaillants', val: capteurs.filter(c => c.statut === 'DEFAILLANT').length, cls: 'badge-red' },
          { label: 'Maintenance', val: capteurs.filter(c => c.statut === 'MAINTENANCE').length, cls: 'badge-yellow' },
          { label: 'Critiques', val: capteurs.filter(isCritical).length, cls: 'badge-orange' },
        ].map(({ label, val, cls }) => (
          <span key={label} className={`badge ${cls}`} style={{ fontSize: 11 }}>{label}: {val}</span>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Type</th>
                <th>Localisation</th>
                <th>Zone</th>
                <th>Dernière lecture</th>
                <th>Seuils</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 13, width: j === 2 ? 180 : 80 }} /></td>)}</tr>
                  ))
                : filtered.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon={Radio} title="Aucun capteur trouvé" sub="Modifiez les filtres ou créez un nouveau capteur" /></td></tr>
                  : filtered.map(c => {
                      const TypeIcon = typeIcon[c.type_capteur] || Radio
                      const cfg = capteurStatutConfig[c.statut] || {}
                      const typeCfg = typeCapteurConfig[c.type_capteur] || {}
                      const critical = isCritical(c)
                      return (
                        <tr key={c.id_capteur} style={{ background: critical ? 'rgba(255,61,90,0.02)' : undefined }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {critical && <div className="live-dot live-dot-red" />}
                              <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: critical ? 'var(--red)' : 'var(--text-primary)' }}>
                                  {c.reference}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{c.id_capteur}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <TypeIcon size={12} color={typeCfg.color} />
                              <span style={{ fontSize: 12, color: typeCfg.color, fontWeight: 600 }}>{typeCfg.label}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.localisation}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {c.nom_zone || `Zone #${c.id_zone}`}
                            </span>
                          </td>
                          <td>
                            {c.derniere_lecture !== null && c.derniere_lecture !== undefined
                              ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: critical ? 'var(--red)' : 'var(--cyan)' }}>
                                  {c.derniere_lecture} {typeCfg.unit}
                                </span>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                            }
                          </td>
                          <td>
                            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                              <span style={{ color: 'var(--yellow)' }}>⚠ {c.seuil_alerte}</span>
                              <span style={{ margin: '0 4px' }}>/</span>
                              <span style={{ color: 'var(--red)' }}>🔴 {c.seuil_critique}</span>
                            </div>
                          </td>
                          <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(c)} title="Modifier">
                                <Pencil size={12} />
                              </button>
                              {c.statut !== 'INACTIF' && (
                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeactivate(c)} title="Désactiver">
                                  <PowerOff size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? `Modifier — ${editing.reference}` : 'Nouveau capteur'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>RÉFÉRENCE *</label>
                <input className="input" placeholder="CAP-NIV-016" value={form.reference} disabled={!!editing}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>TYPE *</label>
                <select className="select" value={form.type_capteur} onChange={e => setForm(f => ({ ...f, type_capteur: e.target.value }))}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{typeCapteurConfig[t]?.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>LOCALISATION *</label>
              <input className="input" placeholder="Collecteur principal Nord, rue Ibn Batouta" value={form.localisation}
                onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>ZONE *</label>
                <select className="select" value={form.id_zone} onChange={e => setForm(f => ({ ...f, id_zone: e.target.value }))}>
                  <option value="">Sélectionner…</option>
                  {zones.map(z => <option key={z.id_zone} value={z.id_zone}>{z.nom_zone}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>DATE INSTALLATION *</label>
                <input className="input" type="date" value={form.date_installation}
                  onChange={e => setForm(f => ({ ...f, date_installation: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  SEUIL ALERTE ({typeCapteurConfig[form.type_capteur]?.unit}) *
                </label>
                <input className="input" type="number" step="0.01" min="0" placeholder="2.50" value={form.seuil_alerte}
                  onChange={e => setForm(f => ({ ...f, seuil_alerte: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  SEUIL CRITIQUE ({typeCapteurConfig[form.type_capteur]?.unit}) *
                </label>
                <input className="input" type="number" step="0.01" min="0" placeholder="4.00" value={form.seuil_critique}
                  onChange={e => setForm(f => ({ ...f, seuil_critique: e.target.value }))} />
              </div>
            </div>

            {editing && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>STATUT</label>
                <select className="select" value={form.statut || 'ACTIF'} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                  {STATUT_OPTIONS.map(s => <option key={s} value={s}>{capteurStatutConfig[s]?.label}</option>)}
                </select>
              </div>
            )}

            {error && (
              <div className="alert-banner alert-banner-red">
                <AlertTriangle size={14} color="var(--red)" />
                <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>
              </div>
            )}

            <div className="divider" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le capteur'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
