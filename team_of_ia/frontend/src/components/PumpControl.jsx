import { useState, useMemo } from 'react';
import { Activity, Power, Wrench, AlertTriangle, MapPin, Gauge, Zap } from 'lucide-react';

// FIX BUG 2: Backend returns debit_max_Lmin (L/min), not capacite_max.
// safeMax guards against NaN / division by zero in the gauge.
const CircularGauge = ({ value, max, color, size = 120 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circum = radius * 2 * Math.PI;
    const safeMax   = max > 0 ? max : 1;
    const safeValue = isFinite(value) && value >= 0 ? value : 0;
    const percent   = Math.min(Math.max(safeValue / safeMax, 0), 1);
    const strokeDashoffset = circum - percent * circum;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
                <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circum} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
                />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '21px', fontWeight: '800', color: '#f1f5f9', lineHeight: '1' }}>{Math.round(safeValue)}</span>
                <span style={{ fontSize: '9px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>L/min</span>
            </div>
        </div>
    );
};

export default function PumpControl({ pompes, zones, onUpdatePompe, userRole }) {
    const [filter, setFilter] = useState('ALL');
    const [sendingPumpId, setSendingPumpId] = useState(null);
    const [localToast, setLocalToast] = useState(null);

    const handleSignalPanne = async (pompe, zoneName, e) => {
        e.stopPropagation();
        setSendingPumpId(pompe.pompe_id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/pompes/${pompe.pompe_id}/signaler`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || 'Erreur API signaler');
            }
            
            const data = await res.json();
            setLocalToast(data.message || 'Alerte envoyée aux techniciens ✓');
            setTimeout(() => setLocalToast(null), 3000);
        } catch (err) {
            console.error(err);
            setLocalToast(err.message || 'Erreur envoi message');
            setTimeout(() => setLocalToast(null), 3000);
        } finally {
            setSendingPumpId(null);
        }
    };

    const canEdit = userRole === 'ADMIN' || userRole === 'OPERATEUR' || userRole === 'TECHNICIEN';

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE':      return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)',   icon: <Activity size={14} />,      label: 'En Service' };
            case 'INACTIVE':    return { color: '#64748b', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)', icon: <Power size={14} />,         label: 'À l\'arrêt' };
            case 'MAINTENANCE': return { color: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.3)',  icon: <Wrench size={14} />,        label: 'Maintenance' };
            case 'PANNE':       return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',   icon: <AlertTriangle size={14} />, label: 'En Panne' };
            default:            return { color: '#94a3b8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', icon: <Activity size={14} />,      label: status };
        }
    };

    const filteredPompes = useMemo(() => filter === 'ALL' ? pompes : pompes.filter(p => p.statut === filter), [pompes, filter]);

    const counts = {
        ALL: pompes.length,
        ACTIVE: pompes.filter(p => p.statut === 'ACTIVE').length,
        INACTIVE: pompes.filter(p => p.statut === 'INACTIVE').length,
        PANNE: pompes.filter(p => p.statut === 'PANNE').length,
        MAINTENANCE: pompes.filter(p => p.statut === 'MAINTENANCE').length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header & Filters */}
            <div style={{ background: 'rgba(12,20,38,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Gauge size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9', margin: 0 }}>Contrôle des Pompes</h2>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Réseau de pompage d'Agadir</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {[
                        { id: 'ALL', label: 'Toutes', color: '#3b82f6' },
                        { id: 'ACTIVE', label: 'Actives', color: '#22c55e' },
                        { id: 'INACTIVE', label: 'Inactives', color: '#64748b' },
                        { id: 'PANNE', label: 'Pannes', color: '#ef4444' }
                    ].map(f => (
                        <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '8px 16px', borderRadius: '10px', background: filter === f.id ? `${f.color}20` : 'transparent', color: filter === f.id ? f.color : '#94a3b8', border: `1px solid ${filter === f.id ? `${f.color}40` : 'transparent'}`, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {f.label}
                            <span style={{ background: filter === f.id ? `${f.color}30` : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', color: filter === f.id ? f.color : '#cbd5e1' }}>{counts[f.id]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid of Pumps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {filteredPompes.map(p => {
                    const st = getStatusConfig(p.statut);
                    const isLocked = p.statut === 'PANNE' || p.statut === 'MAINTENANCE';
                    // FIX: use debit_max_Lmin, not capacite_max (that field doesn't exist in DB)
                    const debitMax = p.debit_max_Lmin ?? 0;
                    const currentDebit = p.statut === 'ACTIVE' ? Math.round(debitMax * 0.72) : 0;
                    const zoneName = p.zone?.quartier || zones.find(z => z.zone_id === p.zone_id)?.quartier || `Zone ${p.zone_id}`;

                    return (
                        <div key={p.pompe_id} style={{ background: 'rgba(12,20,38,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.3s', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}
                            onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${st.color}50`; }}
                            onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
                        >
                            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: `radial-gradient(circle, ${st.color}15 0%, transparent 70%)`, filter: 'blur(20px)', pointerEvents: 'none' }} />

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#f1f5f9' }}>{p.nom_pompe}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                                        <MapPin size={12} color="#64748b" /> {zoneName}
                                    </div>
                                </div>
                                <div style={{ padding: '6px 14px', borderRadius: '99px', background: st.bg, border: `1px solid ${st.border}`, color: st.color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {st.icon} {st.label}
                                </div>
                            </div>

                            {/* Gauge + Stats */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', zIndex: 10 }}>
                                <CircularGauge value={currentDebit} max={debitMax} color={st.color} size={110} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Débit Max</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
                                            {debitMax > 0 ? debitMax.toLocaleString('fr-FR') : '—'} <span style={{ fontSize: '12px', color: '#94a3b8' }}>L/min</span>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Consommation</div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Zap size={13} color="#eab308" /> {p.consommation_kw != null ? `${p.consommation_kw} kW` : '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Mode</div>
                                        <div style={{ fontSize: '13px', color: p.automatique ? '#22c55e' : '#f97316', fontWeight: '600' }}>
                                            {p.automatique ? '⚡ Automatique' : '🖐 Manuel'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions & Toggle */}
                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 30, position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {(() => {
                                        const alertesActives = zones.find(z => z.zone_id === p.zone_id)?.nb_alertes > 0;
                                        const isBlocked = p.statut === 'ACTIVE' && alertesActives && p.automatique;
                                        const fullyDisabled = !canEdit || isLocked || isBlocked;
                                        return (
                                            <>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    Contrôle <span style={{ color: canEdit ? (isBlocked ? '#f97316' : '#cbd5e1') : '#dc2626' }}>{!canEdit ? 'Verrouillé' : isBlocked ? 'Bloqué (Incident)' : 'Autorisé'}</span>
                                                </div>
                                                <button disabled={fullyDisabled} title={isBlocked ? "Alerte en cours : Manuel requis" : ""} onClick={() => onUpdatePompe(p.pompe_id, { statut: p.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} style={{ position: 'relative', width: '56px', height: '30px', borderRadius: '99px', background: p.statut === 'ACTIVE' ? '#22c55e' : 'rgba(255,255,255,0.1)', border: 'none', cursor: fullyDisabled ? 'not-allowed' : 'pointer', opacity: fullyDisabled ? 0.5 : 1, transition: 'all 0.3s', boxShadow: p.statut === 'ACTIVE' ? '0 0 10px rgba(34,197,94,0.4)' : 'none' }}>
                                                    <div style={{ position: 'absolute', top: '3px', left: p.statut === 'ACTIVE' ? '29px' : '3px', width: '24px', height: '24px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', transition: 'all 0.3s' }} />
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                                
                                {p.statut === 'PANNE' && userRole === 'ADMIN' && (
                                    <button
                                        disabled={sendingPumpId === p.pompe_id}
                                        onClick={(e) => handleSignalPanne(p, zoneName, e)}
                                        style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            color: '#ef4444',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: sendingPumpId === p.pompe_id ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            opacity: sendingPumpId === p.pompe_id ? 0.7 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={e => !sendingPumpId && (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                                        onMouseOut={e => !sendingPumpId && (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                                    >
                                        {sendingPumpId === p.pompe_id ? 'Envoi...' : '🔧 Signaler au technicien'}
                                    </button>
                                )}
                            </div>

                            {isLocked && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,20,38,0.3)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'not-allowed' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                                    <div style={{ background: '#0f172a', padding: '8px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertTriangle size={16} color="#ef4444" /> Verrouillé ({p.statut})
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredPompes.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <h3 style={{ fontSize: '18px', color: '#f1f5f9', margin: '0 0 8px 0' }}>Aucune pompe trouvée</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Changez de filtre pour afficher les pompes.</p>
                </div>
            )}
            {/* Toast Local */}
            {localToast && (
                <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 20px', borderRadius: '14px', background: localToast.includes('Erreur') ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)', backdropFilter: 'blur(10px)', color: 'white', fontSize: '14px', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {localToast}
                </div>
            )}
        </div>
    );
}
