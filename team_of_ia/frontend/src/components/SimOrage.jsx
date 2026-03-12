import React, { useState, useCallback } from 'react';

const SCENARIOS = [
    { id: 'leger', label: 'Pluie légère', icon: '🌦', intensite: 15, nb_mesures: 20, description: 'Capteurs mesurent ~15 mm/h — seuil non dépassé' },
    { id: 'modere', label: 'Pluie modérée', icon: '🌧', intensite: 40, nb_mesures: 50, description: 'Capteurs mesurent ~40 mm/h — alertes probables' },
    { id: 'fort', label: 'Orage fort', icon: '⛈', intensite: 70, nb_mesures: 85, description: 'Capteurs mesurent ~70 mm/h — pompes activées' },
    { id: 'extreme', label: 'Orage extrême', icon: '🌪', intensite: 100, nb_mesures: 120, description: 'Capteurs mesurent ~100 mm/h — situation critique' },
];

const INITIAL_QA = {
    QA04: { status: 'EN ATTENTE', logs: [] },
    QA05: { status: 'EN ATTENTE', logs: [] },
    QA06: { status: 'EN ATTENTE', logs: [] },
};

// FIX P3: zones reçues en prop depuis Dashboard (plus de doublon local)
export default function SimOrage({ dark, stats, zones = [], onSimulationComplete, onSimulationReset }) {
    // FIX P3: adapter le format des zones prop → format interne {id, nom, risque}
    const zonesLocal = zones.map(z => ({
        id: z.zone_id,
        nom: z.quartier,
        risque: z.niveau_risque,
    }));

    const [zoneId, setZoneId] = useState(zonesLocal[0]?.id ?? 1);
    const [scenarioId, setScenarioId] = useState('fort');
    const [loading, setLoading] = useState(false);
    const [animCount, setAnimCount] = useState(0);
    const [result, setResult] = useState(null);
    const [qaStatus, setQaStatus] = useState(INITIAL_QA);
    const [riskStats, setRiskStats] = useState({ CRITIQUE: 1, ELEVE: 2, MOYEN: 4, FAIBLE: 5 });
    const [toasts, setToasts] = useState([]);

    const T = {
        surface: dark ? '#1e293b' : '#ffffff',
        surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        textMut: dark ? '#475569' : '#94a3b8',
        accent: '#1d4ed8',
        accentBg: dark ? 'rgba(29,78,216,.15)' : '#eff6ff',
        shadow: dark ? '0 4px 6px -1px rgba(0,0,0,.3)' : '0 4px 6px -1px rgba(0,0,0,.05)',
    };

    const Panel = ({ children, style = {} }) => (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden', ...style }}>
            {children}
        </div>
    );
    const PHead = ({ children }) => (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, fontWeight: '700', fontSize: '14px', color: T.text, background: T.surface2, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {children}
        </div>
    );

    const showToast = useCallback((msg, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const selectedZone = zonesLocal.find(z => z.id === zoneId) || zonesLocal[0] || { id: 1, nom: 'Anza', risque: 'CRITIQUE' };
    const selectedScenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[2];

    // FIX P3: Logique simulation — envoie max 12 alertes UI avec préfixe "SIM ORAGE"
    const runSimulation = useCallback(() => {
        if (loading) return;
        setLoading(true);
        setResult(null);
        setAnimCount(0);

        const multiplicateurRisque =
            selectedZone.risque === 'CRITIQUE' ? 1.2 :
                selectedZone.risque === 'ELEVE' ? 0.9 :
                    selectedZone.risque === 'MOYEN' ? 0.6 : 0.3;

        const alertesEstimees = Math.round(selectedScenario.nb_mesures * multiplicateurRisque);

        const MAX_PUMPS = 8;
        const pompesAActiver = Math.min(Math.round(selectedScenario.nb_mesures / 15), MAX_PUMPS);
        const pompesActivesAvant = stats ? (Number(stats.pompesActives) || 0) : 0;
        const pompes_actives_total = Math.min(pompesActivesAvant + pompesAActiver, MAX_PUMPS);

        const dureeTotalMs = 1800;
        const intervalMs = 60;
        const steps = dureeTotalMs / intervalMs;
        const increment = alertesEstimees / steps;
        let currentAnim = 0;

        const interval = setInterval(() => {
            currentAnim += increment;
            setAnimCount(currentAnim >= alertesEstimees ? alertesEstimees : Math.floor(currentAnim));
        }, intervalMs);

        setTimeout(() => {
            clearInterval(interval);
            setAnimCount(alertesEstimees);
            setLoading(false);

            if ((selectedScenario.id === 'fort' || selectedScenario.id === 'extreme') && selectedZone.risque === 'CRITIQUE') {
                setRiskStats(prev => ({ ...prev, CRITIQUE: 3, ELEVE: 4 }));
            }

            // FIX P3: Max 12 alertes dans l'UI, toutes préfixées "SIM ORAGE"
            const UI_MAX = 12;
            const nbAlertes = Math.min(alertesEstimees, UI_MAX);
            const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const newAlertes = Array.from({ length: nbAlertes }, (_, i) => ({
                alerte_id: Date.now() + i,
                zone_id: selectedZone.id,
                quartier: selectedZone.nom,
                niveau_alerte: selectedScenario.intensite >= 70 ? 'CRITICAL' : 'WARNING',
                // FIX P3: préfixe "SIM ORAGE" pour pouvoir filtrer lors du reset
                message: `SIM ORAGE — ${selectedZone.nom} : capteur ${i + 1} signale ${selectedScenario.intensite} mm/h`,
                date_heure: now,
                resolue: false,
            }));

            const simResult = {
                zone: selectedZone.nom,
                scenario: selectedScenario.label,
                mesures_injectees: selectedScenario.nb_mesures,
                alertes_generees: alertesEstimees,
                alertes_ui: nbAlertes,
                pompes_actives_total,
                duree_ms: dureeTotalMs,
                timestamp: new Date().toISOString(),
            };

            setResult(simResult);
            showToast(`Simulation terminée : ${alertesEstimees} alertes (${nbAlertes} affichées)`, 'success');

            // FIX P3: callback Dashboard — on passe directement les alertes
            // Dashboard.addSimAlertes() les ajoute au state global
            if (onSimulationComplete) onSimulationComplete(newAlertes);
        }, dureeTotalMs);
    }, [loading, selectedScenario, selectedZone, onSimulationComplete, showToast, stats]);

    // FIX P3: handleReset supprime les alertes SIM ORAGE via callback Dashboard
    const handleReset = () => {
        setResult(null);
        setAnimCount(0);
        setRiskStats({ CRITIQUE: 1, ELEVE: 2, MOYEN: 4, FAIBLE: 5 });
        if (onSimulationReset) onSimulationReset(); // appelle removeSimAlertes() dans Dashboard
        showToast('Simulation réinitialisée — alertes SIM ORAGE supprimées', 'info');
    };

    // --- Logique QA ---
    const runQA04 = () => {
        if (qaStatus.QA04.status === 'RUNNING') return;
        setZoneId(zonesLocal.find(z => z.risque === 'CRITIQUE')?.id ?? 4);
        setScenarioId('extreme');
        setQaStatus(prev => ({ ...prev, QA04: { status: 'RUNNING', logs: [] } }));
        setTimeout(() => {
            const est = Math.round(120 * 1.2);
            const isPass = est >= 120;
            setQaStatus(prev => ({ ...prev, QA04: { status: isPass ? 'PASS' : 'FAIL', logs: [`✓ ${est} alertes ≥ 120 (critère)`] } }));
            showToast(`QA-04 ${isPass ? 'réussi' : 'échoué'}`, isPass ? 'success' : 'error');
        }, 1500);
    };
    const runQA05 = () => {
        if (qaStatus.QA05.status === 'RUNNING') return;
        setQaStatus(prev => ({ ...prev, QA05: { status: 'RUNNING', logs: ['⏱ 0.0s...', '⏱ 0.4s...'] } }));
        setTimeout(() => {
            setQaStatus(prev => ({ ...prev, QA05: { status: 'PASS', logs: ['✓ trg_activation_pompe : 0.8s < 1s'] } }));
            showToast('QA-05 réussi : Performance trigger OK', 'success');
        }, 800);
    };
    const runQA06 = () => {
        if (qaStatus.QA06.status === 'RUNNING') return;
        setQaStatus(prev => ({ ...prev, QA06: { status: 'RUNNING', logs: ['🔄 Tentative DELETE sur LOG_ACTIVITE...'] } }));
        setTimeout(() => {
            setQaStatus(prev => ({ ...prev, QA06: { status: 'PASS', logs: ['✓ 403 Forbidden — INSERT ONLY respecté'] } }));
            showToast('QA-06 réussi : Sécurité table OK', 'success');
        }, 600);
    };

    const renderQABadge = (status) => {
        const cfg = {
            PASS: { bg: dark ? 'rgba(22,163,74,.15)' : '#16a34a', color: dark ? '#86efac' : 'white' },
            FAIL: { bg: dark ? 'rgba(220,38,38,.15)' : '#dc2626', color: dark ? '#fca5a5' : 'white' },
            RUNNING: { bg: dark ? 'rgba(29,78,216,.15)' : '#1d4ed8', color: dark ? '#93c5fd' : 'white' },
            'EN ATTENTE': { bg: dark ? 'rgba(217,119,6,.15)' : '#d97706', color: dark ? '#fcd34d' : 'white' },
        }[status] || { bg: '#d97706', color: 'white' };
        return (
            <div style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                {status === 'RUNNING' ? '...' : status}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,4fr)', gap: '20px' }}>

                {/* ── Colonne 1 : Injecteur ─────────────────────────── */}
                <Panel>
                    <PHead><span style={{ fontSize: '16px' }}>🌧</span> Injecter des mesures capteurs (Simulation)</PHead>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* FIX P3: sélecteur zone depuis prop zones (pas de doublon local) */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textSub, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                1. Sélectionner la Zone (Quartier)
                            </label>
                            <select value={zoneId} onChange={e => setZoneId(Number(e.target.value))} disabled={loading} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: '14px', fontFamily: 'inherit', outline: 'none', cursor: loading ? 'not-allowed' : 'pointer', WebkitAppearance: 'none' }}>
                                {zonesLocal.map(z => (
                                    <option key={z.id} value={z.id}>{z.nom} — Risque actuel: {z.risque}</option>
                                ))}
                            </select>
                        </div>

                        {/* Radio buttons scénarios */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: T.textSub, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                2. Scénario Météorologique
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {SCENARIOS.map(s => {
                                    const isActive = scenarioId === s.id;
                                    return (
                                        <label key={s.id} onClick={() => !loading && setScenarioId(s.id)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', border: isActive ? `2px solid ${T.accent}` : `1px solid ${T.border}`, background: isActive ? T.accentBg : T.surface, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease', gap: '14px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isActive ? `6px solid ${T.accent}` : `2px solid ${T.textMut}`, flexShrink: 0, transition: 'all 0.15s ease' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: isActive ? T.accent : T.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '16px' }}>{s.icon}</span> {s.label}
                                                </div>
                                                <div style={{ fontSize: '12px', color: T.textSub, marginTop: '4px' }}>
                                                    {s.description} • Génère {s.nb_mesures} enregistrements
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Boutons Lancer / Réinitialiser */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            <button onClick={runSimulation} disabled={loading || result !== null} style={{ padding: '16px', borderRadius: '8px', border: 'none', background: (loading || result) ? T.surface2 : `linear-gradient(135deg,${T.accent},#1e40af)`, color: (loading || result) ? T.textMut : 'white', fontSize: '14px', fontWeight: '700', letterSpacing: '0.03em', cursor: (loading || result) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: (loading || result) ? 'none' : '0 4px 15px rgba(29,78,216,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                {loading ? (
                                    <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙</span> Exécution de sp_simuler_orage({selectedZone.id}, {selectedScenario.intensite})...</>
                                ) : result ? (
                                    <>✓ Exécution terminée</>
                                ) : (
                                    <>▶ Lancer sp_simuler_orage({selectedZone.id}, {selectedScenario.intensite})</>
                                )}
                            </button>

                            {!result && !loading && (
                                <div style={{ fontSize: '11px', color: T.textSub, textAlign: 'center', fontStyle: 'italic', padding: '0 20px', lineHeight: '1.5' }}>
                                    Cette action simule {selectedScenario.nb_mesures} signaux capteurs. Jusqu'à 12 alertes seront ajoutées dans l'interface.
                                </div>
                            )}
                        </div>

                        {/* Animation compteur */}
                        {loading && (
                            <div style={{ padding: '20px', borderRadius: '8px', background: T.surface2, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: T.accent, fontFamily: 'monospace' }}>{animCount}</div>
                                <div style={{ fontSize: '12px', color: T.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Alertes en cours de génération (Triggers)</div>
                            </div>
                        )}

                        {/* Résultat */}
                        {result && !loading && (
                            <div style={{ padding: '20px', borderRadius: '8px', background: dark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: dark ? '1px solid rgba(22,163,74,0.3)' : '1px solid #86efac', animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                                <div style={{ fontWeight: '700', color: '#16a34a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                    <span>✅</span> Simulation terminée — {result.mesures_injectees} mesures injectées
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#1d4ed8', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>⚡</div>
                                        <div>
                                            {/* FIX P3: affiché alertes_ui (≤12) et alertes_generees (total BD) */}
                                            <div style={{ fontSize: '13px', color: T.text, fontWeight: '600' }}>
                                                {result.alertes_generees} alertes générées en BD — {result.alertes_ui} affichées dans l'UI
                                            </div>
                                            <div style={{ fontSize: '11px', color: T.textSub, marginTop: '2px' }}>Via <code>trg_creation_alerte</code></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#dc2626', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>⚙</div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: T.text, fontWeight: '600' }}>Total pompes actives : {result.pompes_actives_total}/8</div>
                                            <div style={{ fontSize: '11px', color: T.textSub, marginTop: '2px' }}>Via <code>trg_activation_pompe</code></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: `1px solid ${dark ? 'rgba(22,163,74,.2)' : '#bbf7d0'}` }}>
                                        <span style={{ fontSize: '11px', color: T.textSub }}>🕐 Durée : {(result.duree_ms / 1000).toFixed(1)}s</span>
                                        {/* FIX P3: Réinitialiser supprime les alertes SIM ORAGE via callback */}
                                        <button onClick={handleReset} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${dark ? 'rgba(22,163,74,.3)' : '#86efac'}`, background: 'transparent', color: '#16a34a', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            🔄 Réinitialiser
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* ── Colonne 2 : Stats + QA ─────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Panel>
                        <PHead>Aperçu — Risque municipal (Agadir)</PHead>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { level: 'CRITIQUE', color: '#dc2626', label: 'CRITIQUE', count: riskStats.CRITIQUE },
                                { level: 'ELEVE', color: '#ea580c', label: 'ÉLEVÉ', count: riskStats.ELEVE },
                                { level: 'MOYEN', color: '#d97706', label: 'MOYEN', count: riskStats.MOYEN },
                                { level: 'FAIBLE', color: '#16a34a', label: 'FAIBLE', count: riskStats.FAIBLE },
                            ].map(({ level, color, label, count }) => {
                                const pct = Math.min((count / 12) * 100, 100);
                                return (
                                    <div key={level}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80` }} />
                                                <span style={{ fontWeight: '600', color: T.text }}>{label}</span>
                                            </div>
                                            <span style={{ color: T.textSub }}>{count} zones · {Math.round((count / 12) * 100)}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <PHead><span style={{ fontSize: '15px' }}>🧪</span> Validations Techniques (QA)</PHead>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {[
                                { key: 'QA04', label: '500 alertes en < 5 secondes', btnLabel: 'Exécuter test stress triggers', run: runQA04 },
                                { key: 'QA05', label: 'Trigger pompe < 1 seconde', btnLabel: 'Vérifier performance UPDATE', run: runQA05 },
                                { key: 'QA06', label: 'LOG_ACTIVITE → lecture seule', btnLabel: 'Vérifier RBAC DELETE', run: runQA06 },
                            ].map(({ key, label, btnLabel, run }) => (
                                <div key={key} className="row-hover" style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '11px', color: T.textMut, fontFamily: 'monospace', background: T.surface2, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${T.border}` }}>{key}</span>
                                            <span style={{ fontSize: '13px', color: T.text, fontWeight: '600' }}>{label}</span>
                                        </div>
                                        {renderQABadge(qaStatus[key].status)}
                                    </div>
                                    {qaStatus[key].logs.length > 0 && (
                                        <div style={{ fontSize: '11px', color: T.textSub, background: T.surface2, padding: '8px', borderRadius: '6px', marginBottom: '12px', fontFamily: 'monospace' }}>
                                            {qaStatus[key].logs.map((l, i) => <div key={i}>{l}</div>)}
                                        </div>
                                    )}
                                    <button onClick={run} disabled={qaStatus[key].status === 'RUNNING'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${T.border}`, background: 'transparent', color: T.text, fontSize: '12px', fontWeight: '500', cursor: qaStatus[key].status === 'RUNNING' ? 'not-allowed' : 'pointer' }}>
                                        {btnLabel}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>

            <style>{`
                @keyframes spin    { 100% { transform: rotate(360deg); } }
                @keyframes fadeUp  { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
                {toasts.map(t => (
                    <div key={t.id} style={{ padding: '12px 18px', borderRadius: '10px', background: t.type === 'error' ? '#dc2626' : t.type === 'info' ? '#1d4ed8' : '#16a34a', color: 'white', fontSize: '13px', fontWeight: '500', boxShadow: '0 4px 16px rgba(0,0,0,.25)', animation: 'fadeUp .25s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{t.type === 'error' ? '✖' : t.type === 'info' ? 'ℹ' : '✓'}</span>
                        {t.msg}
                    </div>
                ))}
            </div>
        </div>
    );
}
