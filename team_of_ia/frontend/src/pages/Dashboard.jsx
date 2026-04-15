import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MapView from '../components/MapView';
import StatsBar from '../components/StatsBar';
import AlertPanel from '../components/AlertPanel';
import AdminPanel from '../components/AdminPanel';
import SimOrage from '../components/SimOrage';
import PumpControl from '../components/PumpControl';
import MessagePanel from '../components/MessagePanel';
import client, { 
    getZones, getAlertes, getPompes, getCapteurs, 
    resolveAlerte as apiResolveAlerte, togglePompe as apiTogglePompe, 
    logout as apiLogout, changePassword, getMessages 
} from '../api/client';
import {
    LayoutDashboard, AlertTriangle, Settings2, ShieldCheck,
    CloudRain, LogOut, Droplets, Menu, Clock, Lock, MessageSquare
} from 'lucide-react';

const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

export default function Dashboard({ user: userProp }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tab, setTab] = useState('carte');
    const [now, setNow] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const [apiStatus, setApiStatus] = useState('connected'); // 'connected' | 'reconnecting' | 'error'
    const [unreadMessages, setUnreadMessages] = useState(0);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    const storedUser = userProp || getStoredUser();
    const role = storedUser.role || 'LECTEUR';
    const isAdmin = role === 'ADMIN';
    const canEdit = role === 'ADMIN' || role === 'OPERATEUR';
    const initials = storedUser.nom ? storedUser.nom.substring(0, 2).toUpperCase() : 'U';

    const [zones, setZones] = useState([]);
    const [alertes, setAlertes] = useState([]);
    const [pompes, setPompes] = useState([]);
    const [capteurs, setCapteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        // Utilisation d'un setter fonctionnel pour éviter la dépendance sur apiStatus
        setApiStatus(prev => prev === 'error' ? 'reconnecting' : prev);

        try {
            const [zRes, aRes, pRes, cRes] = await Promise.all([
                getZones(),
                getAlertes(),
                getPompes(),
                getCapteurs()
            ]);
            if (zRes) setZones(zRes);
            if (aRes) setAlertes(aRes);
            if (pRes) setPompes(pRes);
            if (cRes) setCapteurs(cRes);
            
            setApiStatus('connected');
            setError(null);
        } catch (err) {
            setApiStatus('error');
            setError('Erreur de connexion API. Nouvelle tentative...');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [])

    // Fetch unread messages count using centralized client
    const fetchUnread = useCallback(async () => {
        try {
            const data = await getMessages();
            if (Array.isArray(data)) {
                setUnreadMessages(data.filter(m => !m.lu).length);
            }
        } catch (err) {
            console.error("Erreur lecture messages non lus", err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchUnread();
        
        // Rafraîchir toutes les 5 secondes
        const refreshInterval = setInterval(() => { fetchData(true); fetchUnread(); }, 5000);
        const clockInterval = setInterval(() => setNow(new Date()), 1000);
        const closeMenu = (e) => { if (!e.target.closest('#user-menu-root')) setMenuOpen(false) }
        document.addEventListener('mousedown', closeMenu)
        return () => {
            clearInterval(refreshInterval);
            clearInterval(clockInterval);
            document.removeEventListener('mousedown', closeMenu);
        }
    }, [fetchData, fetchUnread])

    const stats = useMemo(() => ({
        alertesActives: alertes.filter(a => a.resolue === false).length,
        pompesActives: pompes.filter(p => p.statut === 'ACTIVE').length,
        zonesARisque: zones.filter(z => z.niveau_risque !== 'FAIBLE').length,
        pannes: pompes.filter(p => p.statut === 'PANNE').length + capteurs.filter(c => c.statut === 'PANNE').length,
        totalEquipements: pompes.length + capteurs.length
    }), [alertes, pompes, capteurs, zones]);

    const initialStatsRef = useRef(null);

    const trendStats = useMemo(() => {
        if (!initialStatsRef.current && !loading) {
            initialStatsRef.current = stats;
        }
        
        const dict = {
            alertesActives: { trend: 'up', trendValue: 0 },
            pompesActives: { trend: 'up', trendValue: 0 },
            zonesARisque: { trend: 'up', trendValue: 0 },
            pannes: { trend: 'up', trendValue: 0 }
        };

        if (initialStatsRef.current) {
            ['alertesActives', 'pompesActives', 'zonesARisque', 'pannes'].forEach(key => {
                const current = stats[key] || 0;
                
                // BUSINESS RULE: For 'pannes', we want a saturation rate (pannes/total), not an evolution.
                if (key === 'pannes') {
                    const total = stats.totalEquipements || 1;
                    dict[key] = { 
                        trend: current > 0 ? 'up' : 'down', 
                        trendValue: Math.round((current / total) * 100) 
                    };
                    return;
                }

                const init = initialStatsRef.current[key] || 0;
                let trend = current >= init ? 'up' : 'down';
                let trendValue = 0;
                if (init === 0) {
                    trendValue = current > 0 ? 100 : 0;
                } else {
                    trendValue = Math.abs(Math.round(((current - init) / init) * 100));
                }
                dict[key] = { trend, trendValue };
            });
        }
        return dict;
    }, [stats, loading]);


    const zonesWithAlerts = useMemo(() => zones.map(z => ({
        ...z,
        nb_alertes: alertes.filter(a => a.zone_id === z.zone_id && a.resolue === false).length,
        nb_pompes_actives: pompes.filter(p => p.zone_id === z.zone_id && p.statut === 'ACTIVE').length
    })), [zones, alertes, pompes]);

    const resolveAlert = useCallback(async (id) => {
        try {
            await apiResolveAlerte(id);
            setAlertes(prev => prev.map(a => a.alerte_id === id ? { ...a, resolue: true } : a));
            showToast('Alerte résolue avec succès', 'success');
        } catch (err) {
            showToast(err.response?.data?.error || 'Erreur lors de la résolution', 'error');
        }
    }, []);

    const updatePompe = useCallback(async (id, updates) => {
        if (updates.statut) {
            try {
                const data = await apiTogglePompe(id);
                setPompes(prev => prev.map(p => p.pompe_id === id ? data : p));
                showToast(`Pompe ${data.nom_pompe} modifiée`, 'success');
            } catch (err) {
                showToast(err.response?.data?.error || 'Erreur modification pompe', 'error');
            }
        }
    }, []);

    const handleSimulationComplete = useCallback(() => {
        showToast('Simulation terminée, synchronisation en cours...', 'info');
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        try { await apiLogout(); } catch(e) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.reload();
    };

    const handleChangePassword = async () => {
        if (pwdForm.newPwd !== pwdForm.confirm) { setPwdError('Les mots de passe ne correspondent pas'); return; }
        if (pwdForm.newPwd.length < 8) { setPwdError('Minimum 8 caractères'); return; }
        setPwdLoading(true);
        setPwdError('');
        try {
            await changePassword({ current_password: pwdForm.current, new_password: pwdForm.newPwd });
            setShowPasswordModal(false);
            setPwdForm({ current: '', newPwd: '', confirm: '' });
            showToast('Mot de passe mis à jour ✓', 'success');
        } catch (err) {
            setPwdError(err.response?.data?.error || 'Erreur lors de la mise à jour');
        } finally {
            setPwdLoading(false);
        }
    };

    const NAV = [
        { id: 'carte', label: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
        { id: 'alertes', label: 'Alertes', icon: <AlertTriangle size={20} /> },
        { id: 'pompes', label: 'Équipements', icon: <Settings2 size={20} /> },
        { id: 'messages', label: 'Messagerie', icon: <MessageSquare size={20} />, badge: unreadMessages },
        ...(isAdmin ? [{ id: 'admin', label: 'Administration', icon: <ShieldCheck size={20} /> }] : []),
        ...(isAdmin ? [{ id: 'sim', label: 'Simulation', icon: <CloudRain size={20} /> }] : []),
    ];

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#060d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#94a3b8' }}>Initialisation du tableau de bord...</div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#060d1a', color: '#f1f5f9', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(139,92,246,0.05) 0%, transparent 50%)' }} />

            {/* Sidebar */}
            <aside style={{ width: sidebarOpen ? '240px' : '72px', background: 'rgba(12,20,38,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.07)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 40 }}>
                <div style={{ height: '72px', display: 'flex', alignItems: 'center', padding: sidebarOpen ? '0 20px' : '0 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', flexShrink: 0 }}>
                        <Droplets size={24} color="white" />
                    </div>
                    {sidebarOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.02em', color: '#f1f5f9' }}>Urba-Drain</span>
                            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agadir</span>
                        </div>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {NAV.map(n => {
                        const active = tab === n.id;
                        return (
                            <button key={n.id} onClick={() => { setTab(n.id); if (n.id === 'messages') fetchUnread(); }} title={!sidebarOpen ? n.label : ''} style={{ padding: sidebarOpen ? '12px 14px' : '12px', borderRadius: '10px', border: 'none', background: active ? 'rgba(59,130,246,0.1)' : 'transparent', color: active ? '#3b82f6' : '#94a3b8', fontWeight: active ? '600' : '500', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: sidebarOpen ? '14px' : '0', justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'all 0.2s ease', position: 'relative' }}>
                                <span style={{ opacity: active ? 1 : 0.7, position: 'relative' }}>
                                    {n.icon}
                                    {/* Badge non lus sur icône quand sidebar fermée */}
                                    {!sidebarOpen && n.badge > 0 && (
                                        <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', background: '#ef4444', color: 'white', borderRadius: '50%', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.badge}</span>
                                    )}
                                </span>
                                {sidebarOpen && <span>{n.label}</span>}
                                {active && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '20px', background: '#3b82f6', borderRadius: '0 4px 4px 0' }} />}
                                {/* Badges sidebar ouverte */}
                                {sidebarOpen && n.id === 'alertes' && stats.alertesActives > 0 && (
                                    <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '99px', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '700', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>{stats.alertesActives}</span>
                                )}
                                {sidebarOpen && n.id === 'messages' && unreadMessages > 0 && (
                                    <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '99px', background: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: '700', boxShadow: '0 2px 8px rgba(59,130,246,0.4)' }}>{unreadMessages}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{initials}</div>
                        {sidebarOpen && (
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storedUser.nom}</div>
                                <div style={{ display: 'inline-block', marginTop: '3px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '99px', background: isAdmin ? 'rgba(139,92,246,0.15)' : canEdit ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', color: isAdmin ? '#a78bfa' : canEdit ? '#3b82f6' : '#94a3b8', border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.3)' : canEdit ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}` }}>{role}</div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 10 }}>
                <header style={{ height: '72px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(12,20,38,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'sticky', top: 0, zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <Menu size={22} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: '500', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Clock size={14} />
                            {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            fontSize: '12px', 
                            color: apiStatus === 'connected' ? '#22c55e' : apiStatus === 'reconnecting' ? '#f59e0b' : '#ef4444', 
                            fontWeight: '600', 
                            padding: '6px 12px', 
                            background: apiStatus === 'connected' ? 'rgba(34,197,94,0.1)' : apiStatus === 'reconnecting' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', 
                            borderRadius: '99px', 
                            border: `1px solid ${apiStatus === 'connected' ? 'rgba(34,197,94,0.2)' : apiStatus === 'reconnecting' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` 
                        }}>
                            <div style={{ 
                                width: '6px', 
                                height: '6px', 
                                background: apiStatus === 'connected' ? '#22c55e' : apiStatus === 'reconnecting' ? '#f59e0b' : '#ef4444', 
                                borderRadius: '50%', 
                                boxShadow: apiStatus === 'connected' ? '0 0 8px #22c55e' : 'none', 
                                animation: (apiStatus === 'connected' || apiStatus === 'reconnecting') ? 'pulse 2s infinite' : 'none' 
                            }} />
                            {apiStatus === 'connected' ? 'API CONNECTÉE' : apiStatus === 'reconnecting' ? 'RECONNEXION...' : 'API INDISPONIBLE'}
                        </div>

                        <div id="user-menu-root" style={{ position: 'relative' }}>
                            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Settings2 size={22} />
                            </button>
                            {menuOpen && (
                                <div style={{ position: 'absolute', top: '40px', right: 0, width: '220px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '8px', transformOrigin: 'top right', animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                    <button onClick={() => { setMenuOpen(false); setShowPasswordModal(true); setPwdError(''); setPwdForm({ current: '', newPwd: '', confirm: '' }); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#f1f5f9', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <Lock size={16} /> Changer mot de passe
                                    </button>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#ef4444', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <LogOut size={16} /> Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <StatsBar stats={stats} trends={trendStats} />
                        {error && (
                            <div style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertTriangle size={18} /> {error}
                            </div>
                        )}
                        {tab === 'carte' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', height: 'calc(100vh - 240px)', minHeight: '600px' }}>
                                <MapView zones={zonesWithAlerts} selectedZone={selectedZone} onSelectZone={setSelectedZone} />
                            </div>
                        )}
                        {tab === 'alertes' && <AlertPanel alertes={alertes} onResolve={resolveAlert} onRefresh={() => fetchData(true)} />}
                        {tab === 'pompes' && <PumpControl pompes={pompes} zones={zonesWithAlerts} onUpdatePompe={updatePompe} userRole={role} />}
                        {tab === 'messages' && <MessagePanel onUnreadChange={setUnreadMessages} />}
                        {tab === 'admin' && isAdmin && <AdminPanel userRole={role} />}
                        {tab === 'sim' && isAdmin && <SimOrage zones={zonesWithAlerts} stats={stats} onSimulationComplete={handleSimulationComplete} />}
                    </div>
                </main>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 20px', borderRadius: '14px', background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : toast.type === 'info' ? 'rgba(59,130,246,0.95)' : 'rgba(34,197,94,0.95)', backdropFilter: 'blur(10px)', color: 'white', fontSize: '14px', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : toast.type === 'info' ? <Settings2 size={18} /> : <ShieldCheck size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Modal Mot de Passe */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowPasswordModal(false)}>
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', animation: 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Lock size={18} color="#3b82f6" /> Changer mon mot de passe
                            </h3>
                            <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pwdError && <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px', fontWeight: '500' }}>{pwdError}</div>}
                            {[
                                { key: 'current', label: 'Mot de passe actuel', placeholder: '••••••••' },
                                { key: 'newPwd', label: 'Nouveau mot de passe', placeholder: 'Minimum 8 caractères' },
                                { key: 'confirm', label: 'Confirmer le nouveau', placeholder: '••••••••' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                                    <input type="password" value={pwdForm[f.key]} placeholder={f.placeholder}
                                        onChange={e => setPwdForm({ ...pwdForm, [f.key]: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Annuler</button>
                                <button onClick={handleChangePassword} disabled={pwdLoading || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm}
                                    style={{ flex: 2, padding: '12px', borderRadius: '10px', background: (pwdLoading || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: (pwdLoading || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) ? 'not-allowed' : 'pointer' }}>
                                    {pwdLoading ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }
                @keyframes spin { 100% { transform:rotate(360deg); } }
                @keyframes scale-in { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                @keyframes slide-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
}
