export default function StatsBar({ stats, dark }) {
    const T = {
        surface: dark ? '#1e293b' : '#ffffff',
        border: dark ? '#334155' : '#e2e8f0',
        textSub: dark ? '#94a3b8' : '#64748b',
        shadow: dark ? '0 1px 3px rgba(0,0,0,.5)' : '0 1px 3px rgba(0,0,0,.08)',
    }

    const cards = [
        { label: 'Alertes actives', val: stats.alertesActives, icon: '⚠', c1: '220,38,38', c2: '253,242,242' },
        { label: 'Pompes actives', val: stats.pompesActives, icon: '⚙', c1: '22,163,74', c2: '240,253,244' },
        { label: 'Zones à risque', val: stats.zonesCritiques, icon: '⚡', c1: '217,119,6', c2: '255,251,235' },
        { label: 'Pannes équipement', val: stats.pannes, icon: '🔧', c1: '124,58,237', c2: '245,243,255' },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
            {cards.map(s => (
                <div key={s.label} style={{
                    background: dark ? `rgba(${s.c1},.08)` : s.c2,
                    border: `1px solid rgba(${s.c1},${dark ? .25 : .2})`,
                    borderRadius: '10px', padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: T.shadow, transition: 'all .2s ease',
                }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: dark ? `rgba(${s.c1},.15)` : `rgba(${s.c1},.1)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', flexShrink: 0,
                    }}>{s.icon}</div>
                    <div>
                        <div style={{ fontSize: '30px', fontWeight: '700', color: `rgb(${s.c1})`, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                            {s.val}
                        </div>
                        <div style={{ fontSize: '11px', color: T.textSub, marginTop: '3px', fontWeight: '500' }}>
                            {s.label}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
