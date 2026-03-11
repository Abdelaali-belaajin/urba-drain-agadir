import { useState, useEffect, useCallback, useMemo } from 'react'
import MapView from '../components/MapView'
import StatsBar from '../components/StatsBar'
import AlertPanel from '../components/AlertPanel'
import AdminPanel from '../components/AdminPanel'
import PumpControl from '../components/PumpControl'
import SimOrage from '../components/SimOrage'

// FIX P4: Lire rôle depuis localStorage au lieu d'un state hardcodé
const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
}

// ─── DONNÉES MOCK ─────────────────────────────────────────────────────────
const ZONES_INIT = [
    // FIX P2: nb_alertes SUPPRIMÉ de chaque zone — calculé dynamiquement depuis alertes
    { zone_id: 1, quartier: 'Hay Mohammadi', coord_lat: 30.4350, coord_lng: -9.5650, niveau_risque: 'ELEVE', nb_pompes_actives: 1, population: 42000, superficie: 3.8 },
    { zone_id: 2, quartier: 'Talborjt', coord_lat: 30.4250, coord_lng: -9.5950, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 35000, superficie: 2.5 },
    { zone_id: 3, quartier: 'Bensergao', coord_lat: 30.3950, coord_lng: -9.5750, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 22000, superficie: 8.2 },
    { zone_id: 4, quartier: 'Anza', coord_lat: 30.4650, coord_lng: -9.6450, niveau_risque: 'CRITIQUE', nb_pompes_actives: 2, population: 30000, superficie: 6.5 },
    { zone_id: 5, quartier: 'Al Massira', coord_lat: 30.4150, coord_lng: -9.5650, niveau_risque: 'MOYEN', nb_pompes_actives: 1, population: 48000, superficie: 4.1 },
    { zone_id: 6, quartier: 'Tilila', coord_lat: 30.4120, coord_lng: -9.5350, niveau_risque: 'ELEVE', nb_pompes_actives: 1, population: 28000, superficie: 2.8 },
    { zone_id: 7, quartier: 'Adrar', coord_lat: 30.4150, coord_lng: -9.5150, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 18000, superficie: 3.2 },
    { zone_id: 8, quartier: 'Tikiouine', coord_lat: 30.3850, coord_lng: -9.5300, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 25000, superficie: 12.0 },
    { zone_id: 9, quartier: 'Bensergao Sud', coord_lat: 30.3800, coord_lng: -9.5700, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 15000, superficie: 5.5 },
    { zone_id: 10, quartier: 'Al Houda', coord_lat: 30.4050, coord_lng: -9.5450, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 20000, superficie: 2.2 },
    { zone_id: 11, quartier: 'Founty', coord_lat: 30.4000, coord_lng: -9.6000, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 12000, superficie: 3.6 },
    { zone_id: 12, quartier: 'Quartier Suisse', coord_lat: 30.4350, coord_lng: -9.6050, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 8000, superficie: 1.8 },
    { zone_id: 13, quartier: 'Dakhla', coord_lat: 30.4150, coord_lng: -9.5700, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 15000, superficie: 2.1 },
    { zone_id: 14, quartier: 'Les Amicales', coord_lat: 30.4250, coord_lng: -9.5850, niveau_risque: 'ELEVE', nb_pompes_actives: 0, population: 12000, superficie: 1.5 },
    { zone_id: 15, quartier: 'Charaf', coord_lat: 30.4350, coord_lng: -9.5750, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 18000, superficie: 2.2 },
    { zone_id: 16, quartier: 'Riad Salam', coord_lat: 30.4050, coord_lng: -9.5550, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 30000, superficie: 3.5 },
    { zone_id: 17, quartier: 'Illigh', coord_lat: 30.4450, coord_lng: -9.5700, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 8000, superficie: 4.0 },
    { zone_id: 18, quartier: 'Taddart', coord_lat: 30.4400, coord_lng: -9.6100, niveau_risque: 'CRITIQUE', nb_pompes_actives: 1, population: 22000, superficie: 2.8 },
    { zone_id: 19, quartier: 'Sonaba', coord_lat: 30.3950, coord_lng: -9.5800, niveau_risque: 'FAIBLE', nb_pompes_actives: 0, population: 10000, superficie: 3.0 },
    { zone_id: 20, quartier: 'El Khiam', coord_lat: 30.4180, coord_lng: -9.5820, niveau_risque: 'ELEVE', nb_pompes_actives: 0, population: 25000, superficie: 1.8 },
    { zone_id: 21, quartier: 'Quartier Industriel', coord_lat: 30.4220, coord_lng: -9.5720, niveau_risque: 'CRITIQUE', nb_pompes_actives: 2, population: 5000, superficie: 5.5 },
    { zone_id: 22, quartier: 'Najah', coord_lat: 30.4020, coord_lng: -9.5650, niveau_risque: 'MOYEN', nb_pompes_actives: 0, population: 20000, superficie: 2.6 },
]

// FIX P2: zone_id ajouté dans chaque alerte pour lier carte ↔ alertes
const ALERTES_INIT = [
    { alerte_id: 1, zone_id: 4, quartier: 'Anza', niveau_alerte: 'EMERGENCY', message: "Débit critique — Avenue du Port dépasse 2000 L/min", date_heure: '2026-03-10 14:23', resolue: false },
    { alerte_id: 2, zone_id: 4, quartier: 'Anza', niveau_alerte: 'CRITICAL', message: "Taux remplissage 94% — Bouche Zone Industrielle", date_heure: '2026-03-10 14:21', resolue: false },
    { alerte_id: 3, zone_id: 6, quartier: 'Tilila', niveau_alerte: 'WARNING', message: "Niveau eau 78cm — seuil alerte dépassé capteur C14", date_heure: '2026-03-10 14:18', resolue: false },
    { alerte_id: 4, zone_id: 1, quartier: 'Hay Mohammadi', niveau_alerte: 'WARNING', message: "Débit élevé — Rue Tildi 890 L/min", date_heure: '2026-03-10 14:15', resolue: false },
    { alerte_id: 5, zone_id: 5, quartier: 'Al Massira', niveau_alerte: 'WARNING', message: "Pression anormale 3.2 bar sur segment amont", date_heure: '2026-03-10 14:10', resolue: false },
    { alerte_id: 6, zone_id: 4, quartier: 'Anza', niveau_alerte: 'CRITICAL', message: "Pompe P-Anza-02 — surchauffe détectée", date_heure: '2026-03-10 13:58', resolue: false },
    { alerte_id: 7, zone_id: 10, quartier: 'Al Houda', niveau_alerte: 'INFO', message: "Inspection programmée bouche 14 — dans 3 jours", date_heure: '2026-03-10 13:45', resolue: true },
    { alerte_id: 8, zone_id: 2, quartier: 'Talborjt', niveau_alerte: 'INFO', message: "Capteur C04 — qualité signal MOYENNE", date_heure: '2026-03-10 13:30', resolue: true },
]

const POMPES_INIT = [
    { pompe_id: 1, nom_pompe: 'P-HayMohammadi-01', quartier: 'Hay Mohammadi', statut: 'ACTIVE', debit_max_Lmin: 1800, debit_actuel: 1200, automatique: true },
    { pompe_id: 2, nom_pompe: 'P-HayMohammadi-02', quartier: 'Hay Mohammadi', statut: 'INACTIVE', debit_max_Lmin: 1500, debit_actuel: 0, automatique: true },
    { pompe_id: 3, nom_pompe: 'P-Talborjt-01', quartier: 'Talborjt', statut: 'INACTIVE', debit_max_Lmin: 1200, debit_actuel: 0, automatique: true },
    { pompe_id: 4, nom_pompe: 'P-Bensergao-01', quartier: 'Bensergao', statut: 'INACTIVE', debit_max_Lmin: 900, debit_actuel: 0, automatique: true },
    { pompe_id: 5, nom_pompe: 'P-Anza-01', quartier: 'Anza', statut: 'ACTIVE', debit_max_Lmin: 2500, debit_actuel: 2300, automatique: true },
    { pompe_id: 6, nom_pompe: 'P-Anza-02', quartier: 'Anza', statut: 'PANNE', debit_max_Lmin: 2000, debit_actuel: 0, automatique: false },
    { pompe_id: 7, nom_pompe: 'P-AlMassira-01', quartier: 'Al Massira', statut: 'ACTIVE', debit_max_Lmin: 1300, debit_actuel: 870, automatique: true },
    { pompe_id: 8, nom_pompe: 'P-Tilila-01', quartier: 'Tilila', statut: 'ACTIVE', debit_max_Lmin: 1600, debit_actuel: 1100, automatique: true },
]

const RISK = {
    CRITIQUE: { color: '#dc2626', lightBg: '#fef2f2', border: '#fca5a5', label: 'CRITIQUE' },
    ELEVE: { color: '#ea580c', lightBg: '#fff7ed', border: '#fdba74', label: 'ÉLEVÉ' },
    MOYEN: { color: '#d97706', lightBg: '#fffbeb', border: '#fcd34d', label: 'MOYEN' },
    FAIBLE: { color: '#16a34a', lightBg: '#f0fdf4', border: '#86efac', label: 'FAIBLE' },
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────
export default function Dashboard() {
    const [dark, setDark] = useState(false)
    const [zones] = useState(ZONES_INIT)
    const [alertes, setAlertes] = useState(ALERTES_INIT)
    const [pompes, setPompes] = useState(POMPES_INIT)
    const [selectedZone, setSelectedZone] = useState(null)
    const [tab, setTab] = useState('carte')
    const [now, setNow] = useState(new Date())
    const [menuOpen, setMenuOpen] = useState(false)
    const [modal, setModal] = useState(null)
    const [editNom, setEditNom] = useState('BELAAJIN Abdelaali')
    const [editEmail, setEditEmail] = useState('admin@urba-drain.ma')
    const [editRole] = useState('ADMIN')
    const [pwOld, setPwOld] = useState('')
    const [pwNew, setPwNew] = useState('')
    const [pwConfirm, setPwConfirm] = useState('')
    const [toast, setToast] = useState(null)

    // FIX P4: rôle lu depuis localStorage
    const storedUser = getStoredUser()
    const role = storedUser.role || 'ADMIN' // fallback ADMIN pour démo sans auth

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        const close = (e) => { if (!e.target.closest('#user-menu-root')) setMenuOpen(false) }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000)
        return () => clearInterval(t)
    }, [])

    // FIX P1: KPIs CALCULÉS, jamais stockés dans un useState
    const stats = useMemo(() => ({
        alertesActives: alertes.filter(a => !a.resolue).length,
        pompesActives: pompes.filter(p => p.statut === 'ACTIVE').length,
        zonesCritiques: zones.filter(z => ['CRITIQUE', 'ELEVE'].includes(z.niveau_risque)).length,
        pannes: pompes.filter(p => p.statut === 'PANNE').length,
    }), [alertes, pompes, zones])

    // FIX P2: nb_alertes calculé dynamiquement par zone_id
    const nbAlertesZone = useCallback((zoneId) =>
        alertes.filter(a => a.zone_id === zoneId && !a.resolue).length
        , [alertes])

    // FIX P2: zones enrichies avec nb_alertes calculé (passées aux enfants)
    const zonesWithAlerts = useMemo(() =>
        zones.map(z => ({ ...z, nb_alertes: nbAlertesZone(z.zone_id) }))
        , [zones, nbAlertesZone])

    // ── Actions ─────────────────────────────────────────────────────────
    const updatePompe = useCallback((id, updates) => {
        setPompes(prev => prev.map(p => p.pompe_id !== id ? p : { ...p, ...updates }))
    }, [])

    const resolveAlert = useCallback((id) => {
        setAlertes(prev => prev.map(a => a.alerte_id !== id ? a : { ...a, resolue: true }))
    }, [])

    const handleRefreshAlerts = useCallback(() => {
        showToast('Données rafraîchies avec succès', 'success')
    }, [])

    // FIX P3: callback pour ajouter les alertes de simulation (max 12 dans l'UI)
    const addSimAlertes = useCallback((newAlertes) => {
        setAlertes(prev => [...newAlertes.slice(0, 12), ...prev])
    }, [])

    // FIX P3: callback pour réinitialiser — supprime toutes les alertes "SIM ORAGE"
    const removeSimAlertes = useCallback(() => {
        setAlertes(prev => prev.filter(a => !a.message?.startsWith('SIM ORAGE')))
    }, [])

    // ── THÈME ─────────────────────────────────────────────────────────────
    const T = {
        bg: dark ? '#0f172a' : '#f1f5f9',
        surface: dark ? '#1e293b' : '#ffffff',
        surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        textMut: dark ? '#475569' : '#94a3b8',
        accent: '#1d4ed8',
        accentBg: dark ? 'rgba(29,78,216,.15)' : '#eff6ff',
        accentBd: dark ? 'rgba(29,78,216,.35)' : '#bfdbfe',
        shadow: dark ? '0 1px 3px rgba(0,0,0,.5)' : '0 1px 3px rgba(0,0,0,.08)',
    }

    // FIX P4: onglet Administration masqué si rôle ≠ ADMIN
    const NAV = [
        { id: 'carte', label: 'Tableau de bord', icon: '⊞' },
        { id: 'alertes', label: 'Alertes', icon: '⚠' },
        { id: 'pompes', label: 'Équipements', icon: '⚙' },
        ...(role === 'ADMIN' ? [{ id: 'admin', label: 'Administration', icon: '👥' }] : []),
        { id: 'sim', label: 'Simulation', icon: '🌧' },
    ]

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: ${T.bg}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
        .row-hover { transition: all 0.2s ease; }
        .row-hover:hover { background: ${dark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.02)'} !important; }
        .row-hover:active { transform: scale(0.995); }
        .nav-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
        .nav-btn:hover { background: ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'} !important; transform: translateY(-1px); }
        .nav-btn:active { transform: translateY(1px) scale(0.96); }
        .action-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); filter: brightness(1.05); }
        .action-btn:active { transform: translateY(1px) scale(0.97); box-shadow: none; filter: brightness(0.95); }
        .menu-item { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
        .menu-item:hover { background: ${dark ? 'rgba(255,255,255,.1)' : '#f1f5f9'} !important; padding-left: 14px !important; }
        .menu-item:active { transform: scale(0.98); }
        .menu-item-danger { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
        .menu-item-danger:hover { background: ${dark ? 'rgba(220,38,38,.15)' : '#fef2f2'} !important; padding-left: 14px !important; }
        .menu-item-danger:active { transform: scale(0.98); }
        .avatar-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .avatar-btn:hover { transform: scale(1.05); box-shadow: 0 4px 14px rgba(29,78,216,.5); }
        .avatar-btn:active { transform: scale(0.95); box-shadow: 0 2px 8px rgba(29,78,216,.4); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes spin   { to { transform:rotate(360deg) } }
        .fade { animation: fadeUp .25s ease; }
      `}</style>

            <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", fontSize: '14px', display: 'flex', flexDirection: 'column' }}>

                {/* ══ HEADER ════════════════════════════════════════════════ */}
                <header style={{
                    background: T.surface, borderBottom: `1px solid ${T.border}`,
                    padding: '0 24px', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 300, boxShadow: T.shadow,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 2px 10px rgba(29,78,216,.3)', flexShrink: 0 }}>🌊</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-.01em', color: T.text }}>Urba-Drain</span>
                            <span style={{ fontSize: '13px', color: T.textSub, letterSpacing: '.02em', fontWeight: '500' }}>Agadir · Gestion réseau pluvial</span>
                        </div>
                    </div>

                    <nav style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center', overflowX: 'auto', padding: '0 16px' }}>
                        {NAV.map(n => (
                            <button key={n.id} className="nav-btn" onClick={() => setTab(n.id)} style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none', fontFamily: 'inherit',
                                background: tab === n.id ? T.accentBg : 'transparent',
                                color: tab === n.id ? T.accent : T.textSub,
                                fontWeight: tab === n.id ? '600' : '500',
                                fontSize: '14px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all .2s ease', whiteSpace: 'nowrap', flexShrink: 0
                            }}>
                                <span style={{ fontSize: '16px', opacity: tab === n.id ? 1 : 0.8 }}>{n.icon}</span>
                                {n.label}
                                {n.id === 'alertes' && stats.alertesActives > 0 && (
                                    <span style={{ padding: '2px 8px', borderRadius: '99px', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', marginLeft: '4px', boxShadow: '0 2px 6px rgba(239,68,68,0.3)' }}>
                                        {stats.alertesActives}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            <div style={{ width: '7px', height: '7px', background: '#16a34a', borderRadius: '50%', animation: 'blink 2s ease-in-out infinite' }} />
                            EN LIGNE
                        </div>

                        {stats.alertesActives > 0 && (
                            <div style={{ padding: '4px 10px', background: dark ? 'rgba(220,38,38,.15)' : '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                                ⚠ {stats.alertesActives} alerte{stats.alertesActives > 1 ? 's' : ''}
                            </div>
                        )}

                        <button className="nav-btn" onClick={() => setDark(!dark)} style={{ padding: '6px 13px', borderRadius: '6px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {dark ? '☀ Mode clair' : '☾ Mode sombre'}
                        </button>

                        <div id="user-menu-root" style={{ position: 'relative' }}>
                            <div className="avatar-btn" onClick={() => setMenuOpen(o => !o)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer', border: menuOpen ? '2px solid #60a5fa' : '2px solid transparent', boxShadow: '0 2px 8px rgba(29,78,216,.4)' }}>A</div>

                            {menuOpen && (
                                <div style={{ position: 'absolute', top: '44px', right: 0, width: '240px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,.2)', zIndex: 500, overflow: 'hidden', animation: 'fadeUp .18s ease' }}>
                                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, background: T.surface2 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>A</div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editNom}</div>
                                                <div style={{ fontSize: '11px', color: T.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editEmail}</div>
                                                <span style={{ display: 'inline-block', marginTop: '3px', padding: '1px 7px', borderRadius: '99px', fontSize: '10px', fontWeight: '600', background: dark ? 'rgba(124,58,237,.15)' : '#f5f3ff', color: '#7c3aed', border: '1px solid rgba(124,58,237,.25)' }}>{editRole}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px' }}>
                                        {[
                                            { icon: '👤', label: 'Mon profil', action: () => { setModal('profil'); setMenuOpen(false) } },
                                            { icon: '🔑', label: 'Changer mot de passe', action: () => { setModal('password'); setMenuOpen(false) } },
                                            ...(role === 'ADMIN' ? [{ icon: '⚙', label: 'Administration', action: () => { setTab('admin'); setMenuOpen(false) } }] : []),
                                        ].map(item => (
                                            <button key={item.label} className="menu-item" onClick={item.action} style={{ width: '100%', padding: '9px 10px', borderRadius: '7px', border: 'none', background: 'transparent', color: T.text, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                                <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                                                {item.label}
                                            </button>
                                        ))}
                                        <div style={{ height: '1px', background: T.border, margin: '6px 4px' }} />
                                        <button className="menu-item-danger" onClick={() => { setModal('delete'); setMenuOpen(false) }} style={{ width: '100%', padding: '9px 10px', borderRadius: '7px', border: 'none', background: 'transparent', color: '#dc2626', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>🗑</span>
                                            Supprimer le compte
                                        </button>
                                        <div style={{ height: '1px', background: T.border, margin: '6px 4px' }} />
                                        {/* FIX P5: Déconnexion correcte — vide localStorage et redirige */}
                                        <button className="menu-item" onClick={() => {
                                            localStorage.removeItem('token')
                                            localStorage.removeItem('user')
                                            showToast('Déconnexion…', 'info')
                                            setTimeout(() => { window.location.href = '/login' }, 800)
                                        }} style={{ width: '100%', padding: '9px 10px', borderRadius: '7px', border: 'none', background: 'transparent', color: T.textSub, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                            <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>↩</span>
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ══ MODALS ════════════════════════════════════════════════ */}
                {modal && (
                    <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', width: '100%', maxWidth: '420px', boxShadow: '0 16px 48px rgba(0,0,0,.25)', animation: 'fadeUp .2s ease' }}>

                            {modal === 'profil' && (
                                <>
                                    <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', fontSize: '15px', color: T.text }}>👤 Mon profil</span>
                                        <button className="action-btn" onClick={() => setModal(null)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', fontSize: '20px' }}>×</button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '24px', boxShadow: '0 4px 14px rgba(29,78,216,.4)' }}>A</div>
                                        </div>
                                        {[{ label: 'Nom complet', val: editNom, set: setEditNom, type: 'text' }, { label: 'Email', val: editEmail, set: setEditEmail, type: 'email' }].map(f => (
                                            <div key={f.label}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>{f.label}</label>
                                                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = T.border} />
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <button className="action-btn" onClick={() => setModal(null)} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
                                            <button className="action-btn" onClick={() => { setModal(null); showToast('Profil mis à jour ✓') }} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Enregistrer</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {modal === 'password' && (
                                <>
                                    <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', fontSize: '15px', color: T.text }}>🔑 Changer le mot de passe</span>
                                        <button className="action-btn" onClick={() => setModal(null)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', fontSize: '20px' }}>×</button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {[{ label: 'Mot de passe actuel', val: pwOld, set: setPwOld }, { label: 'Nouveau mot de passe', val: pwNew, set: setPwNew }, { label: 'Confirmer le nouveau', val: pwConfirm, set: setPwConfirm }].map(f => (
                                            <div key={f.label}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>{f.label}</label>
                                                <input type="password" value={f.val} onChange={e => f.set(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#1d4ed8'} onBlur={e => e.target.style.borderColor = T.border} />
                                            </div>
                                        ))}
                                        {pwNew && pwConfirm && pwNew !== pwConfirm && (
                                            <div style={{ padding: '8px 12px', borderRadius: '7px', background: dark ? 'rgba(220,38,38,.1)' : '#fef2f2', border: '1px solid #fca5a5', fontSize: '12px', color: '#dc2626' }}>⚠ Les mots de passe ne correspondent pas</div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <button className="action-btn" onClick={() => setModal(null)} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
                                            <button disabled={!pwOld || !pwNew || pwNew !== pwConfirm} onClick={() => { setPwOld(''); setPwNew(''); setPwConfirm(''); setModal(null); showToast('Mot de passe modifié ✓') }} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: (!pwOld || !pwNew || pwNew !== pwConfirm) ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: (!pwOld || !pwNew || pwNew !== pwConfirm) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Confirmer</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {modal === 'delete' && (
                                <>
                                    <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#dc2626' }}>🗑 Supprimer le compte</span>
                                        <button className="action-btn" onClick={() => setModal(null)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', fontSize: '20px' }}>×</button>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ padding: '14px', borderRadius: '8px', background: dark ? 'rgba(220,38,38,.1)' : '#fef2f2', border: '1px solid #fca5a5' }}>
                                            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '6px' }}>⚠ Action irréversible</div>
                                            <div style={{ fontSize: '13px', color: T.textSub, lineHeight: '1.6' }}>La suppression de ce compte effacera définitivement toutes vos données. Cette action ne peut pas être annulée.</div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: T.textSub, marginBottom: '5px' }}>Tapez <strong style={{ color: '#dc2626' }}>SUPPRIMER</strong> pour confirmer</label>
                                            <input type="text" placeholder="SUPPRIMER" id="delete-confirm-input" style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #fca5a5', background: T.surface, color: T.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="action-btn" onClick={() => setModal(null)} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: `1px solid ${T.border}`, background: 'transparent', color: T.textSub, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
                                            <button className="action-btn" onClick={() => { const val = document.getElementById('delete-confirm-input')?.value; if (val === 'SUPPRIMER') { setModal(null); showToast('Compte supprimé', 'error') } else showToast('Tapez exactement SUPPRIMER', 'error') }} style={{ flex: 1, padding: '9px', borderRadius: '7px', border: 'none', background: '#dc2626', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer définitivement</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ TOAST ════════════════════════════════════════════════ */}
                {toast && (
                    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000, padding: '12px 18px', borderRadius: '10px', background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#1d4ed8' : '#16a34a', color: 'white', fontSize: '13px', fontWeight: '500', boxShadow: '0 4px 16px rgba(0,0,0,.25)', animation: 'fadeUp .2s ease' }}>
                        {toast.type === 'error' ? '⚠ ' : toast.type === 'info' ? 'ℹ ' : '✓ '}{toast.msg}
                    </div>
                )}

                {/* ══ CONTENU PRINCIPAL ════════════════════════════════════ */}
                <main style={{ flex: 1, padding: '20px 24px', maxWidth: '1560px', margin: '0 auto', width: '100%' }}>

                    {/* FIX P1: stats calculés passés à StatsBar */}
                    <StatsBar stats={stats} dark={dark} />

                    {/* ── Tableau de bord ───────────────────────────────── */}
                    {tab === 'carte' && (
                        <div className="fade" style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '16px' }}>
                            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden' }}>
                                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '13px' }}>🗺 Carte réseau pluvial — Agadir</span>
                                    <span style={{ fontSize: '11px', color: T.textMut }}>MAJ {now.toLocaleTimeString('fr-FR')}</span>
                                </div>
                                <div style={{ height: '490px' }}>
                                    {/* FIX P2: zonesWithAlerts (nb_alertes calculé) passé à MapView */}
                                    <MapView zones={zonesWithAlerts} selectedZone={selectedZone} onSelectZone={setSelectedZone} dark={dark} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {selectedZone ? (
                                    <div className="fade" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden' }}>
                                        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>📍 {selectedZone.quartier}</span>
                                            <button className="action-btn" onClick={() => setSelectedZone(null)} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                                        </div>
                                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {(() => { const cfg = RISK[selectedZone.niveau_risque]; return (<span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', background: dark ? `${cfg.color}20` : cfg.lightBg, color: cfg.color, border: `1px solid ${dark ? `${cfg.color}40` : cfg.border}`, fontSize: '11px', fontWeight: '600' }}>{cfg.label}</span>) })()}
                                            {[
                                                ['👥 Population', selectedZone.population.toLocaleString() + ' hab.', null],
                                                ['📐 Superficie', selectedZone.superficie + ' km²', null],
                                                // FIX P2: nb_alertes calculé dynamiquement
                                                ['🚨 Alertes', nbAlertesZone(selectedZone.zone_id), nbAlertesZone(selectedZone.zone_id) > 0 ? '#dc2626' : '#16a34a'],
                                                ['⚙️ Pompes act.', selectedZone.nb_pompes_actives, '#1d4ed8'],
                                                ['📍 GPS', `${selectedZone.coord_lat.toFixed(4)}, ${selectedZone.coord_lng.toFixed(4)}`, null],
                                            ].map(([k, v, c]) => (
                                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${T.border}` }}>
                                                    <span style={{ fontSize: '12px', color: T.textSub }}>{k}</span>
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: c || T.text }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: T.surface, border: `1px dashed ${T.border}`, borderRadius: '10px', padding: '30px 16px', textAlign: 'center', color: T.textMut, fontSize: '13px' }}>
                                        <div style={{ fontSize: '30px', marginBottom: '8px' }}>🗺</div>
                                        Cliquez sur une zone<br />pour voir les détails
                                    </div>
                                )}

                                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, flex: 1, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontWeight: '600', fontSize: '13px', color: T.text }}>
                                        Toutes les zones ({zones.length})
                                    </div>
                                    <div style={{ maxHeight: '270px', overflowY: 'auto' }}>
                                        {zonesWithAlerts.map(z => {
                                            const cfg = RISK[z.niveau_risque]
                                            const sel = selectedZone?.zone_id === z.zone_id
                                            return (
                                                <div key={z.zone_id} className="row-hover" onClick={() => setSelectedZone(z)} style={{ padding: '9px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: sel ? T.accentBg : 'transparent' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                                                        <span style={{ fontSize: '12px', fontWeight: sel ? '600' : '400', color: T.text }}>{z.quartier}</span>
                                                    </div>
                                                    {/* FIX P2: badge calculé dynamiquement */}
                                                    {z.nb_alertes > 0 && (
                                                        <span style={{ padding: '1px 7px', borderRadius: '99px', background: dark ? 'rgba(220,38,38,.15)' : '#fef2f2', color: '#dc2626', fontSize: '10px', fontWeight: '600', border: '1px solid #fca5a5' }}>⚠ {z.nb_alertes}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'alertes' && (
                        <div className="fade">
                            <AlertPanel alertes={alertes} onResolve={resolveAlert} onRefresh={handleRefreshAlerts} dark={dark} />
                        </div>
                    )}

                    {tab === 'pompes' && (
                        <div className="fade">
                            <PumpControl pompes={pompes} onUpdatePompe={updatePompe} zones={zonesWithAlerts} userRole={role} dark={dark} />
                        </div>
                    )}

                    {/* FIX P4: onglet admin conditionnel */}
                    {tab === 'admin' && role === 'ADMIN' && (
                        <div className="fade">
                            <AdminPanel dark={dark} />
                        </div>
                    )}

                    {tab === 'sim' && (
                        <div className="fade">
                            {/* FIX P3: nouveaux callbacks addSimAlertes / removeSimAlertes */}
                            <SimOrage
                                zones={zonesWithAlerts}
                                stats={stats}
                                onSimulationComplete={addSimAlertes}
                                onSimulationReset={removeSimAlertes}
                                dark={dark}
                            />
                        </div>
                    )}
                </main>

                <footer style={{ borderTop: `1px solid ${T.border}`, padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: T.textMut, background: T.surface }}>
                    <span>Urba-Drain Agadir · Équipe Augmenteds · ENSIASD Taroudant · SIBD 2025-2026</span>
                    <span>Stack : React + Flask + MySQL · IA : Claude (Anthropic) + GitHub Copilot</span>
                </footer>
            </div>
        </>
    )
}
