import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, Settings2, ShieldAlert } from 'lucide-react';

const MOCK_SPARKLINE = [
    { value: 10 }, { value: 15 }, { value: 8 },
    { value: 20 }, { value: 12 }, { value: 25 }, { value: 18 }
];

const MOCK_PUMP_SPARKLINE = [
    { value: 50 }, { value: 60 }, { value: 55 },
    { value: 80 }, { value: 70 }, { value: 90 }, { value: 85 }
];

function useAnimatedCounter(endValue, duration = 1200) {
    const [count, setCount] = useState(0);
    const animationFrame = useRef(null);

    useEffect(() => {
        if (endValue === 0) { setCount(0); return; }

        let startTime = null;
        const startValue = 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * endValue));
            if (progress < 1) {
                animationFrame.current = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, [endValue, duration]);

    return count;
}

const StatCard = ({ title, value, icon: Icon, color, sparklineData, trend, trendValue }) => {
    const animatedValue = useAnimatedCounter(value);

    return (
        <div style={{
            position: 'relative',
            background: 'rgba(12, 20, 38, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'default',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0,0,0,0.3), 0 0 30px ${color}15, inset 0 1px 0 rgba(255,255,255,0.1)`;
                e.currentTarget.style.borderColor = `${color}40`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', zIndex: 10 }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                    border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color, boxShadow: `0 8px 16px ${color}15`
                }}>
                    <Icon size={22} />
                </div>

                {trend && (
                    <div style={{
                        padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: trend === 'up' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: trend === 'up' ? '#ef4444' : '#22c55e',
                        border: `1px solid ${trend === 'up' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                    }}>
                        {trend === 'up' ? '▲' : '▼'} {trendValue}%
                    </div>
                )}
            </div>

            <div style={{ zIndex: 10 }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: '1' }}>
                    {animatedValue}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8', marginTop: '8px' }}>
                    {title}
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', opacity: 0.3, zIndex: 1, pointerEvents: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <defs>
                            <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${title})`} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{
                position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                filter: 'blur(20px)', zIndex: 0, pointerEvents: 'none'
            }} />
        </div>
    );
};

export default function StatsBar({ stats, trends }) {
    if (!stats || !trends) return null;

    const cards = [
        {
            title: "Alertes Actives",
            value: stats.alertesActives ?? 0,
            icon: AlertTriangle,
            color: "#ef4444",
            trend: trends.alertesActives?.trend || 'up',
            trendValue: trends.alertesActives?.trendValue ?? 0,
            sparkline: MOCK_SPARKLINE
        },
        {
            title: "Pompes en Service",
            value: stats.pompesActives ?? 0,
            icon: Activity,
            color: "#3b82f6",
            trend: trends.pompesActives?.trend || 'up',
            trendValue: trends.pompesActives?.trendValue ?? 0,
            sparkline: MOCK_PUMP_SPARKLINE
        },
        {
            title: "Zones à risque",
            value: stats.zonesARisque ?? 0,
            icon: ShieldAlert,
            color: "#f97316",
            trend: trends.zonesARisque?.trend || 'up',
            trendValue: trends.zonesARisque?.trendValue ?? 0,
            sparkline: MOCK_SPARKLINE
        },
        {
            title: "Équipements en Panne",
            value: stats.pannes ?? 0,
            icon: Settings2,
            color: "#8b5cf6",
            trend: trends.pannes?.trend || 'down',
            trendValue: trends.pannes?.trendValue ?? 0,
            sparkline: MOCK_PUMP_SPARKLINE
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
        }}>
            {cards.map((card) => (
                <StatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                    sparklineData={card.sparkline}
                    trend={card.trend}
                    trendValue={card.trendValue}
                />
            ))}
        </div>
    );
}