import React, { useState } from 'react';

export default function AlertPanel({ alertes, onResolve, onRefresh, dark }) {
    const [filter, setFilter] = useState('TOUTES');
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onRefresh) onRefresh();
        }, 1000);
    };

    const countAll = alertes.length;
    const countActives = alertes.filter(a => !a.resolue).length;
    const countResolues = alertes.filter(a => a.resolue).length;

    const filteredAlertes = alertes.filter(a => {
        if (filter === 'ACTIVES') return !a.resolue;
        if (filter === 'RESOLUES') return a.resolue;
        return true;
    });
    const T = {
        surface: dark ? '#1e293b' : '#ffffff',
        surface2: dark ? '#273449' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        text: dark ? '#f1f5f9' : '#0f172a',
        textSub: dark ? '#94a3b8' : '#64748b',
        textMut: dark ? '#475569' : '#94a3b8',
        shadow: dark ? '0 1px 3px rgba(0,0,0,.5)' : '0 1px 3px rgba(0,0,0,.08)',
    }

    const Panel = ({ children, style = {} }) => (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', boxShadow: T.shadow, overflow: 'hidden', ...style }}>
            {children}
        </div>
    )

    const LVL_CFG = {
        EMERGENCY: { color: '#dc2626', bg: dark ? 'rgba(220,38,38,.15)' : '#fef2f2', border: '#fca5a5', icon: '🚨', label: 'URGENCE' },
        CRITICAL: { color: '#ea580c', bg: dark ? 'rgba(234,88,12,.15)' : '#fff7ed', border: '#fdba74', icon: '🔥', label: 'CRITIQUE' },
        WARNING: { color: '#d97706', bg: dark ? 'rgba(217,119,6,.15)' : '#fffbeb', border: '#fcd34d', icon: '⚠', label: 'ATTENTION' },
        INFO: { color: '#1d4ed8', bg: dark ? 'rgba(29,78,216,.15)' : '#eff6ff', border: '#bfdbfe', icon: 'ℹ', label: 'INFO' },
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Panel>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: T.text }}>
                            📍 Liste des Alertes
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['TOUTES', 'ACTIVES', 'RESOLUES'].map(f => {
                                const active = filter === f;
                                const count = f === 'TOUTES' ? countAll : f === 'ACTIVES' ? countActives : countResolues;
                                const label = f === 'TOUTES' ? 'Toutes' : f === 'ACTIVES' ? 'Actives' : 'Résolues';
                                return (
                                    <button key={f} onClick={() => setFilter(f)} style={{
                                        padding: '4px 10px', borderRadius: '6px', border: active ? `1px solid ${dark ? '#3b82f6' : '#2563eb'}` : `1px solid ${T.border}`,
                                        background: active ? (dark ? 'rgba(59,130,246,0.1)' : '#eff6ff') : 'transparent',
                                        color: active ? (dark ? '#60a5fa' : '#1d4ed8') : T.textSub,
                                        fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {label} <span style={{ opacity: 0.8 }}>({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button className="action-btn" onClick={handleRefresh} disabled={loading} style={{
                        padding: '6px 14px', borderRadius: '6px', border: 'none',
                        background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
                        color: 'white', fontSize: '12px', fontWeight: '600',
                        cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.8 : 1
                    }}>
                        <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none', lineHeight: 1 }}>↻</span>
                        {loading ? 'Rechargement...' : 'Rafraîchir'}
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: T.surface2 }}>
                                {['Date / Heure', 'Niveau', 'Quartier', 'Message', 'Statut', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '600', color: T.textSub,
                                        letterSpacing: '.04em', textTransform: 'uppercase',
                                        borderBottom: `1px solid ${T.border}`,
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlertes.map((a, i) => {
                                const cfg = LVL_CFG[a.niveau_alerte] || LVL_CFG.INFO
                                return (
                                    <tr key={a.alerte_id} className="row-hover" style={{ borderBottom: i < alertes.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                        <td style={{ padding: '12px 16px', fontSize: '12px', color: T.textSub, whiteSpace: 'nowrap' }}>{a.date_heure}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '99px',
                                                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                                fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                whiteSpace: 'nowrap'
                                            }}><span style={{ fontSize: '12px' }}>{cfg.icon}</span> {cfg.label}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: T.text, whiteSpace: 'nowrap' }}>{a.quartier}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: T.text }}>{a.message}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '2px 9px', borderRadius: '99px',
                                                background: a.resolue ? (dark ? 'rgba(22,163,74,.1)' : '#f0fdf4') : (dark ? 'rgba(220,38,38,.1)' : '#fef2f2'),
                                                color: a.resolue ? '#16a34a' : '#dc2626',
                                                border: `1px solid ${a.resolue ? (dark ? 'rgba(22,163,74,.25)' : '#86efac') : '#fca5a5'}`,
                                                fontSize: '11px', fontWeight: '600',
                                            }}>{a.resolue ? 'Résolue' : 'Active'}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            {!a.resolue ? (
                                                <button className="action-btn" onClick={() => onResolve(a.alerte_id)} style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${T.border}`, background: 'transparent', color: T.text, fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    ✔ Marquer résolue
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: T.textMut }}>Aucune action</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredAlertes.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: T.textMut, fontSize: '13px' }}>
                                        Aucune alerte enregistrée pour ce filtre.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </div>
    )
}
