import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, Minimize, MapPin, Activity, AlertTriangle, Users, Maximize2 } from 'lucide-react';

const RISK = {
    CRITIQUE: { color: '#ef4444', label: 'CRITIQUE' },
    'ÉLEVÉ':   { color: '#f97316', label: 'ÉLEVÉ' },
    ELEVE:    { color: '#f97316', label: 'ÉLEVÉ' }, // Rétro-compatibilité
    MOYEN:    { color: '#eab308', label: 'MOYEN' },
    FAIBLE:   { color: '#22c55e', label: 'FAIBLE' },
};

const getDisplayRisk = (zone) => {
    if (!zone) return 'FAIBLE';
    if ((zone.nb_alertes || 0) > 0 && (zone.niveau_risque === 'FAIBLE' || zone.niveau_risque === 'MOYEN')) {
        return 'ÉLEVÉ';
    }
    return zone.niveau_risque || 'FAIBLE';
};

export default function MapView({ zones, selectedZone, onSelectZone }) {
    const MAP_ID = 'leaflet-map-agadir';
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Persistent leaflet references
    const mapRef = useRef(null);
    const posRef = useRef({ center: [30.415, -9.595], zoom: 13 });
    const markersLayerRef = useRef(null);

    // Fullscreen handling
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        setTimeout(() => mapRef.current?.invalidateSize(), 300);
    };

    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map(MAP_ID, {
                center: posRef.current.center,
                zoom: posRef.current.zoom,
                zoomControl: false, // We'll use custom or hide it
            });

            L.control.zoom({ position: 'topleft' }).addTo(map);

            const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            L.tileLayer(tileUrl, {
                attribution: '© CARTO © OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            markersLayerRef.current = L.featureGroup().addTo(map);
            mapRef.current = map;

            map.on('moveend', () => posRef.current = { center: map.getCenter(), zoom: map.getZoom() });
            map.on('zoomend', () => posRef.current = { center: map.getCenter(), zoom: map.getZoom() });
        }

        const map = mapRef.current;
        const markersGroup = markersLayerRef.current;
        markersGroup.clearLayers();

        const radii = { CRITIQUE: 650, ELEVE: 530, MOYEN: 430, FAIBLE: 350 };
        const opacities = { CRITIQUE: 0.35, ELEVE: 0.25, MOYEN: 0.20, FAIBLE: 0.15 };

        zones.forEach(zone => {
            const displayRisk = getDisplayRisk(zone);
            const cfg = RISK[displayRisk] || RISK.FAIBLE;
            const nb = zone.nb_alertes || 0;
            const isSelected = selectedZone?.zone_id === zone.zone_id;

            // Pulse animation for CRITIQUE built in CSS
            const pulseClass = displayRisk === 'CRITIQUE' ? 'marker-pulse' : '';

            const circle = L.circle([zone.coord_lat, zone.coord_lng], {
                radius: radii[displayRisk] || 380,
                color: isSelected ? '#ffffff' : cfg.color,
                fillColor: cfg.color,
                fillOpacity: isSelected ? 0.4 : opacities[displayRisk] || 0.18,
                weight: isSelected ? 3 : 2,
                dashArray: isSelected ? '5, 5' : '',
            }).addTo(markersGroup);

            const pinIcon = L.divIcon({
                html: `
                  <div style="position:relative;width:32px;height:38px;display:flex;justify-content:center;" class="${pulseClass}">
                    <div style="width:28px;height:28px;background:${cfg.color};border-radius:50% 50% 50% 0;
                      transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
                    </div>
                    ${nb > 0 ? `
                    <div style="position:absolute;top:-6px;right:-10px;width:20px;height:20px;
                      background:#ef4444;color:white;border-radius:50%;font-size:11px;font-weight:800;
                      display:flex;align-items:center;justify-content:center;border:2px solid #0f172a;
                      box-shadow:0 0 10px rgba(239,68,68,0.8);">
                      ${nb}
                    </div>` : ''}
                  </div>`,
                className: '',
                iconSize: [32, 38],
                iconAnchor: [16, 38],
            });

            const marker = L.marker([zone.coord_lat, zone.coord_lng], { icon: pinIcon }).addTo(markersGroup);

            const handleClick = () => {
                onSelectZone(zone);
                map.flyTo([zone.coord_lat, zone.coord_lng], map.getZoom() < 14 ? 14 : map.getZoom(), { duration: 0.5 });
            };

            marker.on('click', handleClick);
            circle.on('click', handleClick);
        });

        // Cleanup function (doesn't destroy map, just clears layers to avoid memory leaks)
        return () => {};
    }, [zones, selectedZone, onSelectZone]);

    // Cleanup totally on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const containerStyle = isFullscreen ? {
        position: 'fixed', inset: 0, zIndex: 9999, background: '#060d1a', padding: '24px', display: 'flex', gap: '24px'
    } : {
        display: 'flex', height: '100%', gap: '24px', position: 'relative'
    };

    return (
        <div style={containerStyle}>
            <style>{`
                .marker-pulse { animation: map-pulse 2s infinite; }
                @keyframes map-pulse {
                    0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239,68,68,0.7)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(239,68,68,0)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239,68,68,0)); }
                }
                .leaflet-container { background: #060d1a !important; font-family: 'Inter', sans-serif; }
                .leaflet-control-zoom a { background: rgba(12,20,38,0.8) !important; color: #f1f5f9 !important; border-color: rgba(255,255,255,0.1) !important; backdrop-filter: blur(10px); }
                .leaflet-control-zoom a:hover { background: rgba(59,130,246,0.3) !important; color: white !important; }
            `}</style>

            {/* Left side: MAP */}
            <div style={{
                flex: 1, position: 'relative', borderRadius: '24px', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div id={MAP_ID} style={{ width: '100%', height: '100%', zIndex: 1 }} />
                
                <button onClick={toggleFullscreen} style={{
                    position: 'absolute', top: '20px', right: '20px', zIndex: 400,
                    width: '40px', height: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(12,20,38,0.8)', backdropFilter: 'blur(10px)', color: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.3)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(12,20,38,0.8)'}>
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

                {/* Legend Overlay */}
                <div style={{
                    position: 'absolute', bottom: '20px', left: '20px', zIndex: 400,
                    background: 'rgba(12,20,38,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.07)',
                    padding: '12px 16px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Risque</div>
                    {Object.entries(RISK).map(([, v]) => (
                        <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.color, boxShadow: `0 0 8px ${v.color}80` }} />
                            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>{v.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side: DETAILS PANEL & ZONE LIST */}
            <div style={{
                width: '340px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10
            }}>
                {/* Zone Details */}
                <div style={{
                    background: 'rgba(12, 20, 38, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', height: '50%', display: 'flex', flexDirection: 'column'
                }}>
                    {selectedZone ? (
                        <div style={{ animation: 'slide-up 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>{selectedZone.quartier}</h3>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {selectedZone.coord_lat.toFixed(4)}, {selectedZone.coord_lng.toFixed(4)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(() => {
                                        const displayRisk = getDisplayRisk(selectedZone);
                                        return (
                                            <>
                                                {(displayRisk === 'CRITIQUE' && selectedZone.nb_pompes_actives > 0) && (
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(59,130,246,0.5)',
                                                        background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', animation: 'map-pulse 2s infinite'
                                                    }}>
                                                        <Activity size={12} /> POMPAGE ACTIF
                                                    </span>
                                                )}
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', border: `1px solid ${RISK[displayRisk].color}50`,
                                                    background: `${RISK[displayRisk].color}15`, color: RISK[displayRisk].color
                                                }}>
                                                    {RISK[displayRisk].label}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                                {/* Taux Remplissage Bar (Dynamically injected by sync API) */}
                                {(() => {
                                    const rate = Math.round(selectedZone.taux_remplissage || 0);
                                    const col = rate > 80 ? '#ef4444' : rate > 50 ? '#f97316' : '#22c55e';
                                    return (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                                                <span>Taux de remplissage réseau</span>
                                                <span style={{ color: col }}>{rate}%</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${rate}%`, background: col, borderRadius: '4px', boxShadow: `0 0 10px ${col}`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center' }}>
                                        <AlertTriangle size={18} color="#ef4444" style={{ margin: '0 auto 8px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9' }}>{selectedZone.nb_alertes || 0}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Alertes Actives</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center' }}>
                                        <Activity size={18} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9' }}>{selectedZone.nb_pompes_actives || 0}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Pompes en Serv.</div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>Population & Surface</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1' }}>{selectedZone.population.toLocaleString()} hab. / <span style={{color: '#f1f5f9'}}>{selectedZone.superficie || selectedZone.superficie_km2 || 'N/A'} km²</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <Maximize2 size={32} color="#475569" />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '16px', textAlign: 'center' }}>Sélectionnez une zone</h3>
                            <p style={{ margin: 0, fontSize: '13px', textAlign: 'center', padding: '0 20px' }}>Cliquez sur une zone de la carte pour afficher le détail de ses infrastructures et alertes.</p>
                        </div>
                    )}
                </div>

                {/* Zone List */}
                <div style={{
                    background: 'rgba(12, 20, 38, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', height: '50%', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', fontWeight: '700', color: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Toutes les zones
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>{zones.length}</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {zones.map(z => {
                            const displayRisk = getDisplayRisk(z);
                            const cfg = RISK[displayRisk] || RISK.FAIBLE;
                            const isSelected = selectedZone?.zone_id === z.zone_id;
                            
                            return (
                                <div key={z.zone_id} onClick={() => onSelectZone(z)} style={{
                                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                                    background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                                    border: `1px solid ${isSelected ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s', marginBottom: '4px'
                                }} onMouseOver={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseOut={e => !isSelected && (e.currentTarget.style.background = 'transparent')}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}80` }} />
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '600', color: isSelected ? '#3b82f6' : '#f1f5f9' }}>{z.quartier}</div>
                                        </div>
                                    </div>
                                    {z.nb_alertes > 0 && (
                                        <div style={{ padding: '2px 8px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            {z.nb_alertes} alerte{z.nb_alertes > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
