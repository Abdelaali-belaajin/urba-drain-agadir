import React, { useState, useEffect } from 'react';

export default function PumpControl({ pompes, onUpdatePompe, zones = [], userRole = 'LECTEUR', dark }) {
    const T = {
        surface: dark ? '#1e293b' : '#ffffff',
        surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        textMut: dark ? '#475569' : '#94a3b8',
        shadow: dark ? '0 4px 6px -1px rgba(0,0,0,.3), 0 2px 4px -1px rgba(0,0,0,.15)' : '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03)',
    }

    const STATUS = {
        ACTIVE: { c: '#16a34a', bg: dark ? 'rgba(22,163,74,.07)' : '#f0fdf4', lbl: 'Actif' },
        INACTIVE: { c: '#64748b', bg: dark ? 'rgba(100,116,139,.07)' : '#f8fafc', lbl: 'Inactif' },
        PANNE: { c: '#dc2626', bg: dark ? 'rgba(220,38,38,.07)' : '#fef2f2', lbl: 'En panne' },
        MAINTENANCE: { c: '#d97706', bg: dark ? 'rgba(217,119,6,.07)' : '#fffbeb', lbl: 'Maintenance' },
    }

    // --- Toasts locaux ---
    const [toasts, setToasts] = useState([]);
    const showToast = (msg, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // --- Auto-activation si zone CRITIQUE ---
    useEffect(() => {
        let needsUpdate = false;
        pompes.forEach(p => {
            const zone = zones.find(z => z.quartier === p.quartier);
            if (zone && zone.niveau_risque === 'CRITIQUE') {
                if (p.automatique && p.statut === 'INACTIVE') {
                    if (onUpdatePompe) onUpdatePompe(p.pompe_id, { statut: 'ACTIVE', debit_actuel: p.debit_max_Lmin });
                    needsUpdate = true;
                }
            }
        });
        if (needsUpdate) showToast('⚠️ Pompes activées automatiquement (Zone CRITIQUE)', 'error');
    }, [zones, pompes, onUpdatePompe]);

    // --- Actions ---
    const handleToggleState = (p) => {
        if (p.statut === 'PANNE' || p.statut === 'MAINTENANCE') return;
        if (p.automatique) { showToast(`Désactivez d'abord le mode automatique pour ${p.nom_pompe}`, 'error'); return; }
        const newStatut = p.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const newDebit = newStatut === 'ACTIVE' ? Math.round(p.debit_max_Lmin * 0.72) : 0;
        if (onUpdatePompe) onUpdatePompe(p.pompe_id, { statut: newStatut, debit_actuel: newDebit });
        showToast(`${p.nom_pompe} ${newStatut === 'ACTIVE' ? 'activée' : 'arrêtée'} avec succès`);
    };

    const handleReportMaintenance = (p) => {
        if (!['ADMIN', 'TECHNICIEN', 'OPERATEUR'].includes(userRole)) {
            showToast('Accès refusé : Droits insuffisants', 'error'); return;
        }
        if (onUpdatePompe) onUpdatePompe(p.pompe_id, { statut: 'MAINTENANCE', debit_actuel: 0 });
        showToast(`${p.nom_pompe} passée en MAINTENANCE.`);
    };

    // FIX P6: Sortir de MAINTENANCE → INACTIVE (remettre en service)
    const handleRetourService = (p) => {
        if (!['ADMIN', 'TECHNICIEN', 'OPERATEUR'].includes(userRole)) {
            showToast('Accès refusé : Droits insuffisants', 'error'); return;
        }
        if (onUpdatePompe) onUpdatePompe(p.pompe_id, { statut: 'INACTIVE', debit_actuel: 0 });
        showToast(`${p.nom_pompe} remise en service — statut INACTIVE.`, 'success');
    };

    const handleToggleMode = (p) => {
        if (p.statut === 'PANNE') { showToast("Impossible de changer le mode d'une pompe en panne", 'error'); return; }
        if (!['ADMIN', 'OPERATEUR'].includes(userRole)) { showToast('Accès refusé : Seuls ADMIN et OPERATEUR peuvent changer le mode', 'error'); return; }
        const newMode = !p.automatique;
        if (onUpdatePompe) onUpdatePompe(p.pompe_id, { automatique: newMode });
        showToast(`${p.nom_pompe} → Mode ${newMode ? 'Automatique' : 'Manuel'}`, 'info');
    };

    const handleManualDebit = (p, val) => {
        const debit = Number(val);
        const statut = debit > 0 ? 'ACTIVE' : 'INACTIVE';
        if (onUpdatePompe) onUpdatePompe(p.pompe_id, { debit_actuel: debit, statut });
    };

    const actives = pompes.filter(p => p.statut === 'ACTIVE').length;

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface2 }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: T.text, letterSpacing: '0.02em' }}>⚙️ Gestion des équipements</span>
                    <span style={{ fontSize: '12px', color: T.textSub, fontWeight: '500' }}>{actives}/{pompes.length} pompes actives</span>
                </div>

                {/* Grille 2 colonnes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: T.border }}>
                    {pompes.map(p => {
                        const pct = p.debit_max_Lmin > 0 ? Math.round(p.debit_actuel / p.debit_max_Lmin * 100) : 0
                        const sc = STATUS[p.statut] || STATUS.INACTIVE
                        const barColor = pct > 85 ? '#dc2626' : pct > 60 ? '#d97706' : '#16a34a'
                        const isCritique = zones.find(z => z.quartier === p.quartier)?.niveau_risque === 'CRITIQUE'

                        return (
                            <div key={p.pompe_id} className="row-hover" style={{
                                background: isCritique && p.statut === 'ACTIVE' ? (dark ? 'rgba(220,38,38,.12)' : '#fef2f2') : sc.bg,
                                padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                border: isCritique && p.statut === 'ACTIVE' ? '1px solid #fca5a5' : '1px solid transparent',
                                transition: 'all 0.2s ease', position: 'relative'
                            }}>
                                {/* Titre + statut */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: T.text, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {p.nom_pompe}
                                            {isCritique && p.statut === 'ACTIVE' && (
                                                <span style={{ fontSize: '9px', background: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '99px', fontWeight: '700', letterSpacing: '0.05em' }}>URGENCE ZONE</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', color: T.textSub }}>{p.quartier}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '99px', border: `1px solid ${sc.c}40` }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.c, boxShadow: `0 0 8px ${sc.c}80` }} />
                                        <span style={{ fontSize: '12px', color: sc.c, fontWeight: '600', letterSpacing: '0.03em' }}>{sc.lbl}</span>
                                    </div>
                                </div>

                                {/* Barre de débit / Slider */}
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: T.textSub, marginBottom: '5px' }}>
                                        <span>{p.debit_actuel.toLocaleString()} / {p.debit_max_Lmin.toLocaleString()} L/min</span>
                                        <span style={{ fontWeight: '600', color: barColor }}>{pct}%</span>
                                    </div>
                                    {!p.automatique && p.statut !== 'PANNE' && p.statut !== 'MAINTENANCE' ? (
                                        <input type="range" min="0" max={p.debit_max_Lmin} value={p.debit_actuel}
                                            onChange={e => handleManualDebit(p, e.target.value)}
                                            style={{ width: '100%', cursor: 'ew-resize', margin: '4px 0' }} />
                                    ) : (
                                        <div style={{ height: '6px', background: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '99px', transition: 'width .5s cubic-bezier(0.4,0,0.2,1)' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Footer (Mode + Action) */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px' }}>

                                    {/* Bouton Mode Auto/Manuel */}
                                    <button onClick={() => handleToggleMode(p)} className="action-btn" style={{
                                        background: p.automatique ? (dark ? 'rgba(29,78,216,0.15)' : '#eff6ff') : (dark ? 'rgba(217,119,6,0.15)' : '#fffbeb'),
                                        border: p.automatique ? `1px solid ${dark ? 'rgba(29,78,216,0.3)' : '#bfdbfe'}` : `1px solid ${dark ? 'rgba(217,119,6,0.3)' : '#fcd34d'}`,
                                        fontSize: '11px', color: p.automatique ? '#1d4ed8' : '#d97706',
                                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600',
                                        padding: '5px 10px', borderRadius: '6px'
                                    }}>
                                        <span style={{ fontSize: '13px' }}>{p.automatique ? '🤖' : '🖐️'}</span>
                                        {p.automatique ? 'Mode Auto' : 'Mode Manuel'}
                                    </button>

                                    {/* ── Bouton action principal selon statut ──────── */}
                                    {p.statut === 'PANNE' ? (
                                        // FIX P6: PANNE → "Signaler réparation" → passe MAINTENANCE
                                        <button className="action-btn fade" onClick={() => handleReportMaintenance(p)} style={{
                                            padding: '7px 14px', borderRadius: '99px', border: 'none',
                                            background: '#d97706', color: 'white',
                                            fontSize: '11px', fontWeight: '700', letterSpacing: '0.02em',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            boxShadow: '0 4px 10px rgba(217,119,6,0.25)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <span>🔧</span> Signaler réparation
                                        </button>
                                    ) : p.statut === 'MAINTENANCE' ? (
                                        // FIX P6: MAINTENANCE → "Remettre en service" → passe INACTIVE
                                        <button className="action-btn fade" onClick={() => handleRetourService(p)} title="Réparation terminée — remettre en service" style={{
                                            padding: '7px 14px', borderRadius: '99px', border: 'none',
                                            background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white',
                                            fontSize: '11px', fontWeight: '700', letterSpacing: '0.02em',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            boxShadow: '0 4px 10px rgba(22,163,74,0.3)',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <span>✅</span> Remettre en service
                                        </button>
                                    ) : (
                                        // ACTIVE / INACTIVE → toggle normal
                                        <button
                                            className={p.automatique ? '' : 'action-btn fade'}
                                            disabled={p.automatique}
                                            onClick={() => handleToggleState(p)}
                                            title={p.automatique ? 'Désactivez le mode auto pour contrôler manuellement' : ''}
                                            style={{
                                                padding: '7px 16px', borderRadius: '99px', border: 'none',
                                                background: p.automatique
                                                    ? T.border
                                                    : p.statut === 'ACTIVE'
                                                        ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                                                        : 'linear-gradient(135deg,#16a34a,#15803d)',
                                                color: p.automatique ? T.textMut : 'white',
                                                fontSize: '11px', fontWeight: '700', letterSpacing: '0.03em',
                                                cursor: p.automatique ? 'not-allowed' : 'pointer',
                                                fontFamily: 'inherit', opacity: p.automatique ? 0.6 : 1,
                                                boxShadow: p.automatique ? 'none' : p.statut === 'ACTIVE'
                                                    ? '0 4px 12px rgba(220,38,38,0.3)'
                                                    : '0 4px 12px rgba(22,163,74,0.3)',
                                            }}>
                                            {p.statut === 'ACTIVE' ? 'Arrêter la pompe' : 'Activer la pompe'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Toasts */}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        padding: '12px 18px', borderRadius: '10px',
                        background: t.type === 'error' ? '#dc2626' : t.type === 'info' ? '#1d4ed8' : '#16a34a',
                        color: 'white', fontSize: '13px', fontWeight: '500',
                        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
                        animation: 'fadeUp .25s cubic-bezier(0.4,0,0.2,1)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span style={{ fontSize: '14px' }}>{t.type === 'error' ? '✖' : t.type === 'info' ? 'ℹ' : '✓'}</span>
                        {t.msg}
                    </div>
                ))}
            </div>
        </div>
    )
}
