import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Download, Volume2, VolumeX, CheckCircle, AlertTriangle, Info, Bell, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AlertPanel({ alertes, onResolve, onRefresh }) {
    const [search, setSearch]         = useState('');
    // BUG 2 FIX: initialize from localStorage
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('alertSound') !== 'false');
    const [page, setPage]             = useState(1);
    const [refreshing, setRefreshing] = useState(false);   // BUG 1
    const [refreshed, setRefreshed]   = useState(false);   // BUG 1
    const itemsPerPage = 10;
    
    // ── Audio ────────────────────────────────────────────────────────────────
    const playBeep = useCallback((freq = 440, duration = 0.2) => {
        try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Web Audio API non supportée', e);
        }
    }, []);

    // BUG 2 FIX: toggle sound with localStorage persistence + confirmation beep
    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => {
            const next = !prev;
            localStorage.setItem('alertSound', String(next));
            if (next) playBeep(660, 0.15);   // confirmation beep when enabling
            return next;
        });
    }, [playBeep]);

    // BUG 2 FIX: play beep when new alerts arrive (only if sound is enabled)
    const prevAlertsCount = useRef(alertes.length);
    useEffect(() => {
        if (soundEnabled && alertes.length > prevAlertsCount.current) {
            playBeep(800, 0.4);
        }
        prevAlertsCount.current = alertes.length;
    }, [alertes.length, soundEnabled, playBeep]);

    // BUG 1 FIX: refresh handler with spinner + "Actualisé ✓" feedback
    const handleRefresh = useCallback(async () => {
        if (refreshing) return;
        setRefreshing(true);
        setRefreshed(false);
        try {
            await onRefresh();
        } finally {
            setRefreshing(false);
            setRefreshed(true);
            setTimeout(() => setRefreshed(false), 2000);
        }
    }, [refreshing, onRefresh]);

    // Filtering
    const filteredAlertes = useMemo(() => {
        if (!search) return alertes;
        const lowSearch = search.toLowerCase();
        return alertes.filter(a => {
            const currentLevel = a.display_level || a.niveau_alerte || '';
            const label = (LEVEL_LABELS[currentLevel] || currentLevel || '').toLowerCase();
            return (a.message && a.message.toLowerCase().includes(lowSearch)) ||
                   (a.zone && a.zone.quartier && a.zone.quartier.toLowerCase().includes(lowSearch)) ||
                   (currentLevel.toLowerCase().includes(lowSearch)) ||
                   label.includes(lowSearch);
        });
    }, [alertes, search]);

    // Pagination
    const totalPages = Math.ceil(filteredAlertes.length / itemsPerPage);
    const paginatedAlertes = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredAlertes.slice(start, start + itemsPerPage);
    }, [filteredAlertes, page]);

    // Reset page if search changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    // Export CSV
    const exportCSV = () => {
        if (filteredAlertes.length === 0) return;
        
        const headers = ['ID', 'Date', 'Niveau', 'Message', 'Valeur', 'Résolue', 'Quartier'];
        const rows = filteredAlertes.map(a => [
            a.alerte_id,
            new Date(a.date_heure).toLocaleString('fr-FR'),
            LEVEL_LABELS[a.display_level] || a.display_level || a.niveau_alerte,
            `"${a.message.replace(/"/g, '""')}"`,
            a.valeur_declenchante,
            a.resolue ? 'OUI' : 'NON',
            `"${a.zone?.quartier || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `alertes_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const LEVEL_LABELS = {
        'CRITIQUE':  'CRITIQUE',
        'CRITICAL':  'CRITIQUE',
        'EMERGENCY': 'URGENCE',
        'ÉLEVÉ':     'ÉLEVÉ',
        'ELEVE':     'ÉLEVÉ',
        'WARNING':   'ÉLEVÉ',
        'MOYEN':     'MOYEN',
        'FAIBLE':    'FAIBLE',
        'INFO':      'INFO',
        'RESOLUE':   'RÉSOLUE',
        'RESOLVED':  'RÉSOLUE',
    };

    const getLevelStyle = (level) => {
        switch(level) {
            case 'EMERGENCY':
            case 'CRITICAL':
            case 'CRITIQUE':
                return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
            case 'WARNING':
            case 'ÉLEVÉ':
            case 'ELEVE':
                return { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' };
            case 'MOYEN':
                return { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)' };
            case 'FAIBLE':
                return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' };
            case 'INFO':
                return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' };
            case 'RESOLUE':
            case 'RESOLVED':
                return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
            default: 
                return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
        }
    };

    return (
        <div style={{
            background: 'rgba(12, 20, 38, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', height: '100%'
        }}>
            
            {/* Header & Toolbar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Centre d'Alertes</h2>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{filteredAlertes.length} alertes trouvées</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                            type="text" 
                            placeholder="Rechercher (message, quartier...)" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '260px', padding: '10px 12px 10px 36px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', color: '#f1f5f9', fontSize: '13px', outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
                        )}
                    </div>

                    <button disabled={filteredAlertes.length===0} onClick={exportCSV} style={{
                        padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)', color: filteredAlertes.length ? '#f1f5f9' : '#475569',
                        fontSize: '13px', fontWeight: '500', cursor: filteredAlertes.length ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }} onMouseOver={e => filteredAlertes.length && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                        <Download size={16} /> <span className="hide-mobile">Exporter</span>
                    </button>

                    {/* BUG 2 FIX: sound button calls toggleSound, persists in localStorage */}
                    <button onClick={toggleSound} title={soundEnabled ? 'Désactiver le son' : 'Activer le son'} style={{
                        padding: '10px', borderRadius: '10px',
                        border: `1px solid ${soundEnabled ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        background: soundEnabled ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                        color: soundEnabled ? '#3b82f6' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    
                    {/* BUG 1 FIX: spinner animation + "Actualisé ✓" feedback */}
                    <button onClick={handleRefresh} disabled={refreshing} title="Actualiser les alertes" style={{
                        padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        background: refreshed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        color: refreshed ? '#22c55e' : '#f1f5f9', cursor: refreshing ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600',
                        transition: 'all 0.3s', minWidth: '42px', justifyContent: 'center',
                        border: refreshed ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {refreshed ? (
                            <><CheckCircle size={15} /> Actualisé</>
                        ) : (
                            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                        )}
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div style={{ flex: 1, overflowX: 'auto' }}>
                {paginatedAlertes.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#64748b' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <CheckCircle size={40} color="#22c55e" style={{ opacity: 0.5 }} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '18px' }}>Aucune alerte</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Tout est sous contrôle. Aucune alerte ne correspond à vos critères.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Niveau</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Heure</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zone / Localisation</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAlertes.map((a, i) => {
                                const activeLevel = a.display_level || a.niveau_alerte;
                                const st = getLevelStyle(activeLevel);
                                const isNew = new Date(a.date_heure) > new Date(Date.now() - 60000); // Created in last minute
                                
                                return (
                                    <tr key={a.alerte_id} style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        transition: 'background 0.2s',
                                        animation: isNew ? 'highlight-row 2s ease-out' : 'none',
                                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {st.color === '#ef4444' ? <AlertTriangle size={16} color={st.color} /> : 
                                                 a.display_level === 'RESOLUE' ? <CheckCircle size={16} color={st.color} /> :
                                                 <Info size={16} color={st.color} />}
                                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: '11px', fontWeight: '700', letterSpacing: '0.03em' }}>
                                                    {LEVEL_LABELS[a.display_level] || a.display_level || LEVEL_LABELS[a.niveau_alerte] || a.niveau_alerte || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td style={{ padding: '16px 24px', color: '#cbd5e1', fontSize: '13px' }}>
                                            {new Date(a.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{a.zone?.quartier || `Zone ${a.zone_id}`}</div>
                                            {(a.capteur_id || a.bouche_id) && (
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                    {a.capteur_id ? `Capteur #${a.capteur_id}` : ''} {a.bouche_id ? `Bouche #${a.bouche_id}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.message}>
                                                {a.message}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                Valeur: <strong style={{color: st.color}}>{a.valeur_declenchante}</strong>
                                            </div>
                                        </td>
                                        
                                        <td style={{ padding: '16px 24px' }}>
                                            {a.resolue ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#22c55e' }}>
                                                    <CheckCircle size={14} /> Résolue
                                                </span>
                                            ) : (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#eab308' }}>
                                                    <div style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%', boxShadow: '0 0 8px rgba(234,179,8,0.6)' }} />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            {!a.resolue && (
                                                <button 
                                                    onClick={() => !a.zone || a.zone.niveau_risque !== 'CRITIQUE' ? onResolve(a.alerte_id) : null} 
                                                    disabled={a.zone?.niveau_risque === 'CRITIQUE'}
                                                    title={a.zone?.niveau_risque === 'CRITIQUE' ? "Niveau d'eau toujours critique" : "Valider la résolution"}
                                                    style={{
                                                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                                                    background: a.zone?.niveau_risque === 'CRITIQUE' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                                                    color: a.zone?.niveau_risque === 'CRITIQUE' ? '#94a3b8' : 'white',
                                                    fontSize: '12px', fontWeight: '600', cursor: a.zone?.niveau_risque === 'CRITIQUE' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                                    boxShadow: a.zone?.niveau_risque === 'CRITIQUE' ? 'none' : '0 4px 12px rgba(59,130,246,0.3)', transition: 'all 0.2s', opacity: a.zone?.niveau_risque === 'CRITIQUE' ? 0.6 : 1
                                                }} onMouseOver={e => { if(a.zone?.niveau_risque !== 'CRITIQUE') e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                    Résoudre
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Page {page} sur {totalPages} ({filteredAlertes.length} total)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{
                            padding: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                            color: page === 1 ? '#475569' : '#f1f5f9', cursor: page === 1 ? 'not-allowed' : 'pointer',
                            borderRadius: '8px', display: 'flex', alignItems: 'center'
                        }}>
                            <ArrowLeft size={16} />
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{
                            padding: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                            color: page === totalPages ? '#475569' : '#f1f5f9', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            borderRadius: '8px', display: 'flex', alignItems: 'center'
                        }}>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes highlight-row {
                    0% { background: rgba(239, 68, 68, 0.2); }
                    100% { background: transparent; }
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                }
            `}</style>
        </div>
    );
}
