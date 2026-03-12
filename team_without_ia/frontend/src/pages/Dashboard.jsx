import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { zonesAPI, capteursAPI, pompesAPI } from '../api'
import StatCard from '../components/ui/StatCard'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  MapPin, Radio, Zap, AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { risqueConfig, pompeStatutConfig } from '../utils/helpers'

const MOCK_READINGS = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(i * 5).padStart(2, '0')}m`,
  nord: +(1.4 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.3).toFixed(2),
  sud: +(2.1 + Math.sin(i * 0.4 + 1) * 0.5 + Math.random() * 0.2).toFixed(2),
  commerce: +(1.8 + Math.sin(i * 0.6) * 0.6 + Math.random() * 0.2).toFixed(2),
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}m</strong>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [zones, setZones] = useState([])
  const [capteurs, setCapteurs] = useState([])
  const [pompes, setPompes] = useState([])
  const [critiques, setCritiques] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [z, c, p, cr] = await Promise.allSettled([
        zonesAPI.getAll(),
        capteursAPI.getAll(),
        pompesAPI.getAll(),
        capteursAPI.getCritiques(),
      ])
      if (z.status === 'fulfilled') setZones(z.value.data.data || [])
      if (c.status === 'fulfilled') setCapteurs(c.value.data.data || [])
      if (p.status === 'fulfilled') setPompes(p.value.data.data || [])
      if (cr.status === 'fulfilled') setCritiques(cr.value.data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Stats
  const pompesActives = pompes.filter(p => p.statut === 'ACTIVE').length
  const pompesPanne = pompes.filter(p => p.statut === 'PANNE').length
  const capteursActifs = capteurs.filter(c => c.statut === 'ACTIF').length
  const capteursDefaillants = capteurs.filter(c => c.statut === 'DEFAILLANT').length
  const zonesRisque = zones.filter(z => ['ELEVE', 'CRITIQUE'].includes(z.niveau_risque)).length

  // Pie data for zones by risk
  const riskData = [
    { name: 'Critique', value: zones.filter(z => z.niveau_risque === 'CRITIQUE').length, color: 'var(--red)' },
    { name: 'Élevé',    value: zones.filter(z => z.niveau_risque === 'ELEVE').length,    color: 'var(--orange)' },
    { name: 'Moyen',    value: zones.filter(z => z.niveau_risque === 'MOYEN').length,    color: 'var(--yellow)' },
    { name: 'Faible',   value: zones.filter(z => z.niveau_risque === 'FAIBLE').length,   color: 'var(--green)' },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {critiques.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="alert-banner alert-banner-red"
          style={{ alignItems: 'center' }}
        >
          <div className="live-dot live-dot-red" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--red)' }}>{critiques.length} capteur{critiques.length > 1 ? 's' : ''} en niveau critique</strong>
            <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
              {critiques.map(c => c.reference).join(', ')}
            </span>
          </div>
          <Link to="/capteurs" className="btn btn-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,61,90,0.25)', textDecoration: 'none' }}>
            Voir capteurs <ArrowRight size={12} />
          </Link>
        </motion.div>
      )}

      <motion.div
        className="grid-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard label="Zones surveillées" value={zones.length} sub={`${zonesRisque} zone${zonesRisque !== 1 ? 's' : ''} à risque élevé/critique`} icon={MapPin} color="var(--cyan)" loading={loading} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard label="Capteurs actifs" value={capteursActifs} sub={`${capteursDefaillants} défaillant${capteursDefaillants !== 1 ? 's' : ''} • ${capteurs.length} total`} icon={Radio} color="var(--blue-bright)" loading={loading} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard label="Pompes en service" value={pompesActives} sub={`${pompesPanne} en panne • ${pompes.length} total`} icon={Zap} color="var(--green)" loading={loading} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard label="Alertes critiques" value={critiques.length} sub="Capteurs dépassant le seuil critique" icon={AlertTriangle} color={critiques.length > 0 ? 'var(--red)' : 'var(--green)'} loading={loading} />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>Niveaux d'eau — Dernière heure</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lecture simulée — connecter l'API pour les données réelles</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
              {[['Zone Nord', 'var(--cyan)'], ['Zone Sud', 'var(--blue-bright)'], ['Commerce', 'var(--yellow)']].map(([n, c]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                  <div style={{ width: 8, height: 2, background: c, borderRadius: 1 }} /> {n}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MOCK_READINGS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gNord" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gSud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a8fe0" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1a8fe0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gCom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--yellow)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--yellow)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="nord" name="Zone Nord" stroke="var(--cyan)" strokeWidth={2} fill="url(#gNord)" dot={false} />
              <Area type="monotone" dataKey="sud" name="Zone Sud" stroke="#1a8fe0" strokeWidth={2} fill="url(#gSud)" dot={false} />
              <Area type="monotone" dataKey="commerce" name="Commerce" stroke="var(--yellow)" strokeWidth={2} fill="url(#gCom)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Répartition risques</div>
          {!loading && riskData.length > 0 ? (
            <>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart width={160} height={160}>
                  <Pie data={riskData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {riskData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {riskData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: d.color, fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }} />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Zones à surveiller</div>
            <Link to="/zones" style={{ fontSize: 11, color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Toutes les zones <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)
              : zones
                  .sort((a, b) => ['CRITIQUE','ELEVE','MOYEN','FAIBLE'].indexOf(a.niveau_risque) - ['CRITIQUE','ELEVE','MOYEN','FAIBLE'].indexOf(b.niveau_risque))
                  .slice(0, 5)
                  .map((z, idx) => {
                    const cfg = risqueConfig[z.niveau_risque] || {}
                    return (
                      <motion.div
                        key={z.id_zone}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'var(--bg-surface)',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`live-dot ${cfg.dot}`} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{z.nom_zone}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {z.population?.toLocaleString('fr-FR')} hab.
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                      </motion.div>
                    )
                  })
            }
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>État des pompes</div>
            <Link to="/pompes" style={{ fontSize: 11, color: 'var(--cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Gérer <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)
              : pompes.slice(0, 5).map((p, idx) => {
                  const cfg = pompeStatutConfig[p.statut] || {}
                  return (
                    <motion.div
                      key={p.id_pompe}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {cfg.dot
                          ? <div className={`live-dot ${cfg.dot}`} />
                          : <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)' }} />
                        }
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.nom}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {p.capacite} m³/h • {p.mode_activation}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    </motion.div>
                  )
                })
            }
          </div>
        </div>
      </motion.div>
    </div>
  )
}
