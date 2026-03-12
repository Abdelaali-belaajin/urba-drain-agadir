import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const RISK = {
  CRITIQUE: { color: '#dc2626', lightBg: '#fef2f2', border: '#fca5a5', label: 'CRITIQUE' },
  ELEVE: { color: '#ea580c', lightBg: '#fff7ed', border: '#fdba74', label: 'ÉLEVÉ' },
  MOYEN: { color: '#d97706', lightBg: '#fffbeb', border: '#fcd34d', label: 'MOYEN' },
  FAIBLE: { color: '#16a34a', lightBg: '#f0fdf4', border: '#86efac', label: 'FAIBLE' },
}

export default function MapView({ zones, selectedZone, onSelectZone, dark }) {
  const MAP_ID = 'leaflet-map-agadir'

  // FIX P7: useRef pour l'instance de carte et la position — persiste entre les re-renders
  const mapRef = useRef(null)
  const posRef = useRef({ center: [30.415, -9.595], zoom: 13 })

  useEffect(() => {
    // FIX P7: Nettoyer UNIQUEMENT les couches, pas la carte entière
    // Si la carte existe déjà, on supprime les markers/cercles et on ajoute les nouveaux
    if (mapRef.current) {
      mapRef.current.eachLayer(layer => {
        // Garder le tile layer, supprimer markers/cercles/légende
        if (!(layer instanceof L.TileLayer)) {
          mapRef.current.removeLayer(layer)
        }
      })
      addMarkers(mapRef.current)
      return
    }

    const container = document.getElementById(MAP_ID)
    if (!container) return

    // FIX P7: initialiser avec la position mémorisée (pas de reset au changement d'onglet)
    const map = L.map(MAP_ID, {
      center: posRef.current.center,
      zoom: posRef.current.zoom,
      zoomControl: true,
    })
    mapRef.current = map

    // FIX P7: sauvegarder position à chaque mouvement
    map.on('moveend', () => {
      posRef.current = { center: map.getCenter(), zoom: map.getZoom() }
    })
    map.on('zoomend', () => {
      posRef.current = { center: map.getCenter(), zoom: map.getZoom() }
    })

    const tileUrl = dark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    L.tileLayer(tileUrl, {
      attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    addMarkers(map)

    return () => {
      // FIX P7: sauvegarder position avant démontage, mais NE PAS détruire la carte
      // La carte sera réutilisée si le composant est remonté
      if (mapRef.current) {
        posRef.current = {
          center: mapRef.current.getCenter(),
          zoom: mapRef.current.getZoom(),
        }
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, zones])

  function addMarkers(map) {
    const radii = { CRITIQUE: 650, ELEVE: 530, MOYEN: 430, FAIBLE: 350 }
    const opacities = { CRITIQUE: 0.32, ELEVE: 0.25, MOYEN: 0.20, FAIBLE: 0.15 }

    // Supprimer anciens markers si la carte existait déjà
    map.eachLayer(layer => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer)
    })

    zones.forEach(zone => {
      const cfg = RISK[zone.niveau_risque] || RISK.FAIBLE
      // FIX P2: nb_alertes vient des props (calculé dans Dashboard)
      const nb = zone.nb_alertes ?? 0

      const circle = L.circle([zone.coord_lat, zone.coord_lng], {
        radius: radii[zone.niveau_risque] || 380,
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: opacities[zone.niveau_risque] || 0.18,
        weight: 2,
        opacity: 0.75,
      }).addTo(map)

      const alertBadge = nb > 0
        ? `<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;
                   background:#dc2626;color:white;border-radius:50%;font-size:9px;font-weight:700;
                   display:flex;align-items:center;justify-content:center;border:2px solid white;">
                   ${nb}</div>`
        : ''

      const pinIcon = L.divIcon({
        html: `
                  <div style="position:relative;width:28px;height:34px;">
                    <div style="width:28px;height:28px;background:${cfg.color};border-radius:50% 50% 50% 0;
                      transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.25);">
                    </div>
                    <div style="position:absolute;top:5px;left:5px;width:14px;height:14px;
                      background:white;border-radius:50%;transform:rotate(45deg);
                      display:flex;align-items:center;justify-content:center;
                      font-size:8px;font-weight:700;color:${cfg.color};">
                      ${nb > 0 ? '!' : '●'}
                    </div>
                    ${alertBadge}
                  </div>`,
        className: '',
        iconSize: [28, 34],
        iconAnchor: [14, 34],
        popupAnchor: [0, -36],
      })

      const marker = L.marker([zone.coord_lat, zone.coord_lng], { icon: pinIcon }).addTo(map)

      const popupHtml = `
              <div style="font-family:'Inter',sans-serif;padding:4px 2px;min-width:175px;">
                <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#0f172a;">${zone.quartier}</div>
                <span style="padding:2px 9px;border-radius:99px;background:${cfg.lightBg};color:${cfg.color};
                  border:1px solid ${cfg.border};font-size:11px;font-weight:600;">${cfg.label}</span>
                <div style="margin-top:10px;font-size:12px;color:#475569;line-height:2.1;">
                  <div>👥 ${zone.population.toLocaleString()} habitants</div>
                  <div>📐 ${zone.superficie} km²</div>
                  <div>🚨 <strong style="color:${nb > 0 ? '#dc2626' : '#16a34a'}">
                    ${nb} alerte${nb !== 1 ? 's' : ''}
                  </strong></div>
                  <div>⚙️ ${zone.nb_pompes_actives} pompe${zone.nb_pompes_actives !== 1 ? 's' : ''} active${zone.nb_pompes_actives !== 1 ? 's' : ''}</div>
                  <div style="font-size:10px;color:#94a3b8;margin-top:2px;">
                    📍 ${zone.coord_lat.toFixed(4)}, ${zone.coord_lng.toFixed(4)}
                  </div>
                </div>
              </div>`

      marker.bindPopup(popupHtml, { maxWidth: 230 })
      marker.on('click', () => onSelectZone(zone))
      circle.on('click', () => { onSelectZone(zone); marker.openPopup() })
    })

    // Légende
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div')
      div.style.cssText = `
              background:${dark ? '#1e293b' : 'white'};
              border:1px solid ${dark ? '#334155' : '#e2e8f0'};
              border-radius:8px;padding:12px 14px;
              font-family:'Inter',sans-serif;
              box-shadow:0 2px 10px rgba(0,0,0,.15);`
      div.innerHTML = `
              <p style="font-size:10px;font-weight:700;color:${dark ? '#94a3b8' : '#64748b'};
                margin-bottom:8px;letter-spacing:.06em;text-transform:uppercase;">Niveau de risque</p>
              ${Object.entries(RISK).map(([, v]) => `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                  <div style="width:10px;height:10px;border-radius:50%;background:${v.color};"></div>
                  <span style="font-size:11px;color:${dark ? '#cbd5e1' : '#475569'};">${v.label}</span>
                </div>`).join('')}`
      return div
    }
    legend.addTo(map)
  }

  return (
    <div id={MAP_ID} style={{ width: '100%', height: '100%' }} />
  )
}
