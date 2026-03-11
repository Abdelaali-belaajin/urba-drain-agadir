import { useState, useEffect, useCallback } from 'react'
import { zonesAPI } from '../api'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { risqueConfig, fmtNum } from '../utils/helpers'
import { MapPin, Plus, Pencil, Trash2, Users, Maximize2, AlertTriangle } from 'lucide-react'

const NIVEAU_OPTIONS = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE']

const defaultForm = { nom_zone: '', superficie: '', population: '', latitude: '', longitude: '', niveau_risque: 'MOYEN' }

export default function Zones() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await zonesAPI.getAll()
      setZones(res.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setError(''); setShowModal(true) }
  const openEdit = (z) => {
    setEditing(z)
    setForm({
      nom_zone: z.nom_zone || '',
      superficie: z.superficie || '',
      population: z.population || '',
      latitude: z.latitude || '',
      longitude: z.longitude || '',
      niveau_risque: z.niveau_risque || 'MOYEN',
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.nom_zone || !form.superficie || !form.population) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        superficie: parseFloat(form.superficie),
        population: parseInt(form.population),
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      }
      if (editing) {
        await zonesAPI.update(editing.id_zone, payload)
      } else {
        await zonesAPI.create(payload)
      }
      setShowModal(false)
      load()
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await zonesAPI.delete(deleteTarget.id_zone)
      setDeleteTarget(null)
      load()
    } catch (e) {
      alert(e.response?.data?.error || 'Impossible de supprimer cette zone.')
    }
  }

  const filtered = filter === 'ALL' ? zones : zones.filter(z => z.niveau_risque === filter)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['ALL', ...NIVEAU_OPTIONS].map(v => {
              const isAll = v === 'ALL'
              const active = filter === v
              const cfg = !isAll && risqueConfig[v]
              return (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className="btn btn-sm"
                  style={{
                    background: active ? (isAll ? 'var(--cyan-dim)' : cfg ? undefined : '') : 'transparent',
                    color: active ? (isAll ? 'var(--cyan)' : cfg?.cls.includes('red') ? 'var(--red)' : cfg?.cls.includes('orange') ? 'var(--orange)' : cfg?.cls.includes('yellow') ? 'var(--yellow)' : 'var(--green)') : 'var(--text-muted)',
                    borderColor: active ? 'var(--border-active)' : 'var(--border-subtle)',
                    fontSize: 11,
                  }}
                >
                  {isAll ? `Toutes (${zones.length})` : `${risqueConfig[v].label} (${zones.filter(z => z.niveau_risque === v).length})`}
                </button>
              )
            })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={14} /> Nouvelle zone
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Zone</th>
                <th>Superficie</th>
                <th>Population</th>
                <th>Coordonnées</th>
                <th>Niveau de risque</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 80 }} /></td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={MapPin} title="Aucune zone trouvée" sub="Créez une nouvelle zone ou modifiez les filtres" /></td></tr>
                  : filtered.map(z => {
                      const cfg = risqueConfig[z.niveau_risque] || {}
                      return (
                        <tr key={z.id_zone}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className={`live-dot ${cfg.dot}`} />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{z.nom_zone}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID #{z.id_zone}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Maximize2 size={11} color="var(--text-muted)" />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmtNum(z.superficie)} km²</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Users size={11} color="var(--text-muted)" />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmtNum(z.population)}</span>
                            </div>
                          </td>
                          <td>
                            {z.latitude && z.longitude
                              ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                                  {Number(z.latitude).toFixed(4)}, {Number(z.longitude).toFixed(4)}
                                </span>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                            }
                          </td>
                          <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(z)} title="Modifier">
                                <Pencil size={12} />
                              </button>
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(z)} title="Supprimer">
                                <Trash2 size={12} />
                              </button>
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

      {/* Create/Edit modal */}
      {showModal && (
        <Modal title={editing ? `Modifier — ${editing.nom_zone}` : 'Nouvelle zone'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                NOM DE LA ZONE *
              </label>
              <input className="input" placeholder="Zone Nord - Quartier Industriel" value={form.nom_zone}
                onChange={e => setForm(f => ({ ...f, nom_zone: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  SUPERFICIE (km²) *
                </label>
                <input className="input" type="number" step="0.1" min="0" placeholder="145.5" value={form.superficie}
                  onChange={e => setForm(f => ({ ...f, superficie: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  POPULATION *
                </label>
                <input className="input" type="number" min="0" placeholder="12500" value={form.population}
                  onChange={e => setForm(f => ({ ...f, population: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  LATITUDE
                </label>
                <input className="input" type="number" step="0.00000001" placeholder="30.42701234" value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                  LONGITUDE
                </label>
                <input className="input" type="number" step="0.00000001" placeholder="-9.59812345" value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                NIVEAU DE RISQUE
              </label>
              <select className="select" value={form.niveau_risque}
                onChange={e => setForm(f => ({ ...f, niveau_risque: e.target.value }))}>
                {NIVEAU_OPTIONS.map(n => <option key={n} value={n}>{risqueConfig[n].label}</option>)}
              </select>
            </div>

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
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer la zone'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal title="Confirmer la suppression" onClose={() => setDeleteTarget(null)} width={400}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
            Êtes-vous sûr de vouloir supprimer <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.nom_zone}</strong> ?
            Cette action est irréversible. Les zones contenant des capteurs ou pompes ne peuvent pas être supprimées.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Annuler</button>
            <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
