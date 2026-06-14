'use client'

import { useEffect, useRef, useCallback } from 'react'
import { MAP_MEMBERS, MAP_GEOFENCES, MAP_TILES, HOME_COORDS, MapMember, MapStyle } from '@/lib/mapData'

/* ── Status colors ────────────────────────────────────────────── */
const STATUS_COLOR: Record<string, string> = {
  safe: '#10B981', alert: '#F59E0B', sos: '#EF4444', offline: '#6B7280',
}

/* ── Vehicle emoji ───────────────────────────────────────────── */
const V_EMOJI: Record<string, string> = {
  car: '🚗', bus: '🚌', walk: '🚶', bike: '🚲',
  auto: '🛺', tempo: '🚛', train: '🚆', metro: '🚇',
}

/* ── Speed to color (for route segments) ────────────────────── */
function speedColor(speed: number): string {
  if (speed < 10) return '#10B981'   // walking — green
  if (speed < 40) return '#3B82F6'   // city speed — blue
  if (speed < 80) return '#F59E0B'   // fast — amber
  return '#EF4444'                    // very fast — red
}

/* ── Inject all CSS ──────────────────────────────────────────── */
function injectStyles(isDark: boolean) {
  const id = 'gv-map-styles'
  const el = document.getElementById(id)
  if (el) el.remove()
  const s = document.createElement('style')
  s.id = id
  s.textContent = `
    /* ── Leaflet overrides ─────────────────────────────────────── */
    .leaflet-container { background: #06090F !important; font-family: Inter, sans-serif; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    .leaflet-tile-pane { filter: ${isDark ? 'brightness(0.95) saturate(1.1)' : 'brightness(1)'} }

    /* ── Marker pin base ───────────────────────────────────────── */
    .gv-pin { background: transparent !important; border: none !important; }

    /* ── Pulse ring animations ─────────────────────────────────── */
    @keyframes gv-pulse {
      0%   { transform: scale(0.5); opacity: 0.85; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes gv-sos-pulse {
      0%   { transform: scale(0.5); opacity: 0.95; }
      100% { transform: scale(3.5); opacity: 0; }
    }
    @keyframes gv-float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes gv-dash-flow {
      to { stroke-dashoffset: -24; }
    }
    @keyframes gv-route-flow {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -40; }
    }
    @keyframes gv-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes gv-breath {
      0%,100% { opacity:0.7; transform: scale(1); }
      50%      { opacity:1;   transform: scale(1.05); }
    }

    /* ── Custom controls ───────────────────────────────────────── */
    .gv-ctrl-panel {
      background: rgba(6,9,15,0.88);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .gv-ctrl-btn {
      width: 36px; height: 36px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.7);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 16px; transition: all 0.15s ease; line-height: 1;
    }
    .gv-ctrl-btn:hover {
      background: rgba(184,114,10,0.2);
      border-color: rgba(184,114,10,0.4);
      color: #D4A853;
      transform: scale(1.05);
    }
    .gv-ctrl-btn.active {
      background: rgba(184,114,10,0.25);
      border-color: rgba(184,114,10,0.5);
      color: #D4A853;
    }
    .gv-ctrl-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 2px 0;
    }
    .gv-ctrl-top {
      background: rgba(6,9,15,0.88);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 6px 10px;
      display: flex; align-items: center; gap: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .gv-live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: gv-breath 2s ease-in-out infinite;
    }
    .gv-member-chip {
      display: flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 2px 8px 2px 4px;
      cursor: pointer; transition: all 0.15s;
    }
    .gv-member-chip:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
    }
    .gv-member-chip.active {
      border-color: var(--chip-color, #10B981);
      background: rgba(var(--chip-rgb, 16,185,129),0.15);
    }
    .gv-compass {
      background: rgba(6,9,15,0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }

    /* ── Popup ─────────────────────────────────────────────────── */
    .gv-popup {
      background: rgba(6,9,15,0.95);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 14px;
      min-width: 200px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      pointer-events: auto;
    }
    .gv-popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .gv-popup-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .gv-popup-name { font-size: 13px; font-weight: 700; color: #F0EDE8; }
    .gv-popup-loc { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 1px; }
    .gv-popup-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
    .gv-popup-stat { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 8px; }
    .gv-popup-stat-val { font-size: 13px; font-weight: 700; color: #F0EDE8; }
    .gv-popup-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 1px; }
    .gv-popup-actions { display: flex; gap: 6px; margin-top: 10px; }
    .gv-popup-btn {
      flex: 1; padding: 6px 0; border-radius: 8px; border: none;
      font-size: 11px; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .gv-popup-btn:hover { opacity: 0.85; }
  `
  document.head.appendChild(s)
}

/* ── Person marker HTML ──────────────────────────────────────── */
function personPin(m: MapMember, active: boolean): string {
  const s = active ? 60 : 48
  const sc = STATUS_COLOR[m.status]
  const glow = active ? 28 : 14
  const ringAnim = m.status === 'sos' ? 'gv-sos-pulse' : 'gv-pulse'
  const bat = m.battery
  const batCol = bat > 50 ? '#10B981' : bat > 20 ? '#F59E0B' : '#EF4444'

  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;cursor:pointer;">
    ${active || m.status === 'sos' ? `
      <div style="position:absolute;inset:-8px;border-radius:50%;background:${sc};animation:${ringAnim} 2.2s ease-out infinite;opacity:0;pointer-events:none;z-index:0;"></div>
      <div style="position:absolute;inset:-8px;border-radius:50%;background:${sc};animation:${ringAnim} 2.2s ease-out infinite;animation-delay:0.8s;opacity:0;pointer-events:none;z-index:0;"></div>
      ${m.status === 'sos' ? '<div style="position:absolute;inset:-8px;border-radius:50%;background:#EF4444;animation:gv-sos-pulse 2.2s ease-out infinite;animation-delay:1.4s;opacity:0;pointer-events:none;z-index:0;"></div>' : ''}
    ` : ''}
    <div style="width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;border:3px solid ${sc};position:relative;flex-shrink:0;z-index:1;box-shadow:0 0 ${glow}px ${sc}80,0 4px 16px rgba(0,0,0,0.6);${active ? 'animation:gv-float 3s ease-in-out infinite;' : ''}">
      <img src="${m.photo}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
      <div style="position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:${sc};border:2px solid #06090F;z-index:2;${m.status === 'sos' ? 'animation:gv-breath 0.8s infinite;' : ''}"></div>
    </div>
    <div style="background:rgba(6,9,15,0.9);color:${sc};font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;border:1px solid ${sc}50;backdrop-filter:blur(8px);white-space:nowrap;font-family:Inter,sans-serif;letter-spacing:0.06em;z-index:1;box-shadow:0 2px 8px rgba(0,0,0,0.5);">
      ${m.name.toUpperCase()}
      ${m.speed && m.speed > 0 ? `<span style="color:rgba(255,255,255,0.45);font-weight:400;margin-left:3px;">${m.speed}km/h</span>` : ''}
    </div>
    <div style="width:${s}px;height:3px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden;z-index:1;">
      <div style="width:${bat}%;height:100%;background:${batCol};border-radius:2px;"></div>
    </div>
  </div>`
}

/* ── Vehicle marker HTML ─────────────────────────────────────── */
function vehiclePin(vehicle: string, color: string, speed: number): string {
  const emoji = V_EMOJI[vehicle] || '📍'
  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;">
    <div style="width:42px;height:42px;border-radius:13px;background:rgba(6,9,15,0.85);border:2px solid ${color}80;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 16px ${color}50,0 4px 12px rgba(0,0,0,0.5);">${emoji}</div>
    <div style="background:rgba(6,9,15,0.9);color:${color};font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid ${color}50;font-family:Inter,sans-serif;white-space:nowrap;">${speed} km/h</div>
  </div>`
}

/* ── Home marker HTML ────────────────────────────────────────── */
function homePin(): string {
  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
    <div style="width:44px;height:44px;border-radius:50%;background:rgba(16,185,129,0.12);border:2px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(16,185,129,0.5),0 4px 12px rgba(0,0,0,0.5);animation:gv-breath 3s ease-in-out infinite;">🏠</div>
    <div style="background:rgba(16,185,129,0.15);color:#10B981;font-size:8px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid rgba(16,185,129,0.35);font-family:Inter,sans-serif;letter-spacing:0.07em;">HOME</div>
  </div>`
}

/* ── Smooth marker animation (lerp) ─────────────────────────── */
function animateTo(marker: any, toLat: number, toLng: number, ms = 800) {
  const from = marker.getLatLng()
  const startTime = performance.now()
  const frame = (now: number) => {
    const t = Math.min((now - startTime) / ms, 1)
    const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t
    marker.setLatLng([
      from.lat + (toLat - from.lat) * ease,
      from.lng + (toLng - from.lng) * ease,
    ])
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/* ── MapView component ───────────────────────────────────────── */
export default function MapView({
  activeId,
  onMemberClick,
  members: membersProp,
}: {
  activeId: string | null
  onMemberClick: (id: string) => void
  members?: MapMember[]
}) {
  const MEMBERS = (membersProp && membersProp.length > 0) ? membersProp : MAP_MEMBERS
  const containerRef   = useRef<HTMLDivElement>(null)
  const mapRef         = useRef<any>(null)
  const personMarkers  = useRef<Record<string, any>>({})
  const vehicleMarkers = useRef<Record<string, any>>({})
  const routeLines     = useRef<Record<string, any>>({})
  const homeLines      = useRef<Record<string, any>>({})
  const tileLayerRef   = useRef<any>(null)
  const styleRef       = useRef<MapStyle>('dark')
  const followRef      = useRef(false)
  const activeRef      = useRef<string | null>(null)
  const popupRef       = useRef<HTMLDivElement | null>(null)
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const trailTimers    = useRef<ReturnType<typeof setInterval>[]>([])

  /* ── Create / update floating popup ─────────────────────────── */
  const showPopup = useCallback((m: MapMember, map: any) => {
    if (popupRef.current) popupRef.current.remove()
    const sc = STATUS_COLOR[m.status]
    const div = document.createElement('div')
    div.className = 'gv-popup'
    div.innerHTML = `
      <div class="gv-popup-header">
        <img class="gv-popup-avatar" src="${m.photo}" style="border:2px solid ${sc};" />
        <div>
          <div class="gv-popup-name">${m.name}</div>
          <div class="gv-popup-loc">📍 ${m.address ?? m.location}</div>
        </div>
        <div style="margin-left:auto;background:${sc}20;color:${sc};font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;border:1px solid ${sc}40;">${m.status.toUpperCase()}</div>
      </div>
      <div class="gv-popup-stats">
        <div class="gv-popup-stat">
          <div class="gv-popup-stat-val">${m.speed ?? 0} km/h</div>
          <div class="gv-popup-stat-lbl">Speed</div>
        </div>
        <div class="gv-popup-stat">
          <div class="gv-popup-stat-val" style="color:${m.battery > 50 ? '#10B981' : m.battery > 20 ? '#F59E0B' : '#EF4444'}">${m.battery}%</div>
          <div class="gv-popup-stat-lbl">Battery</div>
        </div>
        <div class="gv-popup-stat">
          <div class="gv-popup-stat-val">${m.distanceFromHome ?? '—'} km</div>
          <div class="gv-popup-stat-lbl">From Home</div>
        </div>
        <div class="gv-popup-stat">
          <div class="gv-popup-stat-val">${m.accuracy ?? '—'}m</div>
          <div class="gv-popup-stat-lbl">Accuracy</div>
        </div>
      </div>
      <div class="gv-popup-actions">
        <button class="gv-popup-btn" style="background:${sc}20;color:${sc};border:1px solid ${sc}40;">📞 Call</button>
        <button class="gv-popup-btn" style="background:rgba(59,130,246,0.15);color:#3B82F6;border:1px solid rgba(59,130,246,0.3);">💬 Message</button>
      </div>
    `
    const pane = map.getPanes().popupPane
    pane.appendChild(div)
    popupRef.current = div

    // Position popup above marker
    const point = map.latLngToContainerPoint([m.lat, m.lng])
    div.style.position = 'absolute'
    div.style.left = (point.x - 110) + 'px'
    div.style.top  = (point.y - 230) + 'px'
    div.style.zIndex = '800'

    // Reposition on map move
    const reposition = () => {
      const pt = map.latLngToContainerPoint([m.lat, m.lng])
      div.style.left = (pt.x - 110) + 'px'
      div.style.top  = (pt.y - 230) + 'px'
    }
    map.on('move zoom', reposition)

    // Close on map click
    const close = () => {
      div.remove()
      popupRef.current = null
      map.off('click', close)
      map.off('move zoom', reposition)
    }
    setTimeout(() => map.on('click', close), 120)
  }, [])

  /* ── Simulate real-time position polling (30 s) ──────────────── */
  const startPolling = useCallback((map: any, L: any) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      // In production replace with: fetch('/api/locations').then(r=>r.json())
      MEMBERS.forEach(m => {
        // Simulate tiny drift to demonstrate smooth animation
        const dLat = (Math.random() - 0.5) * 0.0004
        const dLng = (Math.random() - 0.5) * 0.0004
        const newLat = m.lat + dLat
        const newLng = m.lng + dLng

        const pm = personMarkers.current[m.id]
        if (pm) {
          animateTo(pm, newLat, newLng, 800)
        }
        const hl = homeLines.current[m.id]
        if (hl) {
          const pts = hl.getLatLngs()
          if (pts.length >= 2) {
            hl.setLatLngs([HOME_COORDS, [newLat, newLng]])
          }
        }
        const vm = vehicleMarkers.current[m.id]
        if (vm && m.vehicleLat && m.vehicleLng) {
          animateTo(vm, m.vehicleLat + dLat, m.vehicleLng + dLng, 800)
        }
        // Follow-mode camera track
        if (followRef.current && activeRef.current === m.id) {
          map.panTo([newLat, newLng], { animate: true, duration: 0.8 })
        }
      })
    }, 30_000)
  }, [])

  /* ── Init map ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      injectStyles(true)
      const L = (await import('leaflet')).default
      delete (containerRef.current as any)._leaflet_id

      const map = L.map(containerRef.current!, {
        center: HOME_COORDS,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
      });
      (window as any).L = L

      /* ── Dark tile layer (default) ───────────────────────────── */
      tileLayerRef.current = L.tileLayer(MAP_TILES.dark.url, {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      /* ── Home marker ─────────────────────────────────────────── */
      L.marker(HOME_COORDS, {
        icon: L.divIcon({
          className: 'gv-pin',
          html: homePin(),
          iconSize: [44, 60],
          iconAnchor: [22, 60],
        }),
        zIndexOffset: 1000,
      }).addTo(map)

      /* ── Geofence circles ────────────────────────────────────── */
      MAP_GEOFENCES.forEach(gf => {
        L.circle([gf.lat, gf.lng], {
          radius: gf.radius,
          color: gf.color,
          fillColor: gf.color,
          fillOpacity: 0.04,
          dashArray: gf.type === 'restricted' ? '4 4' : '8 6',
          weight: gf.type === 'restricted' ? 2 : 1.5,
          opacity: 0.6,
        }).addTo(map)
        // Geofence label
        L.marker([gf.lat, gf.lng], {
          icon: L.divIcon({
            className: 'gv-pin',
            html: `<div style="background:rgba(6,9,15,0.7);color:${gf.color};font-size:8px;font-weight:700;padding:2px 7px;border-radius:4px;border:1px solid ${gf.color}40;backdrop-filter:blur(6px);white-space:nowrap;font-family:Inter,sans-serif;letter-spacing:0.07em;">${gf.name.toUpperCase()}</div>`,
            iconSize: [120, 20],
            iconAnchor: [60, 10],
          }),
        }).addTo(map)
      })

      /* ── Member markers + trails ─────────────────────────────── */
      MEMBERS.forEach(m => {
        const active = activeRef.current === m.id
        const sc = speedColor(m.speed ?? 0)

        // Animated route trail (history polyline)
        if (m.routeHistory && m.routeHistory.length > 1) {
          const pts: [number, number][] = [
            ...m.routeHistory.map(p => [p.lat, p.lng] as [number, number]),
            [m.lat, m.lng],
          ]
          const trail = L.polyline(pts, {
            color: sc,
            weight: 3,
            opacity: 0.55,
            dashArray: '8 5',
          }).addTo(map)
          // Animate trailing dash
          let offset = 0
          const timer = setInterval(() => {
            offset = (offset + 1) % 26
            trail.setStyle({ dashOffset: String(-offset) })
          }, 60)
          trailTimers.current.push(timer)
          routeLines.current[m.id] = trail
        }

        // Dashed line home → member
        const homeLine = L.polyline([HOME_COORDS, [m.lat, m.lng]], {
          color: m.color,
          weight: active ? 2 : 1.5,
          opacity: active ? 0.6 : 0.2,
          dashArray: '5 8',
        }).addTo(map)
        homeLines.current[m.id] = homeLine

        // Person marker
        const size = active ? 60 : 48
        const pm = L.marker([m.lat, m.lng], {
          icon: L.divIcon({
            className: 'gv-pin',
            html: personPin(m, active),
            iconSize: [size, size + 24],
            iconAnchor: [size / 2, size + 24],
          }),
          zIndexOffset: active ? 1000 : 200,
        })
          .addTo(map)
          .on('click', () => {
            onMemberClick(m.id)
            showPopup(m, map)
            if (followRef.current) map.flyTo([m.lat, m.lng], 15, { duration: 1.2 })
          })
        personMarkers.current[m.id] = pm

        // Vehicle marker (if not walking)
        if (m.vehicleLat && m.vehicleLng && m.vehicle !== 'walk') {
          L.polyline([[m.lat, m.lng], [m.vehicleLat, m.vehicleLng]], {
            color: m.color, weight: 1, opacity: 0.3, dashArray: '3 5',
          }).addTo(map)
          const vm = L.marker([m.vehicleLat, m.vehicleLng], {
            icon: L.divIcon({
              className: 'gv-pin',
              html: vehiclePin(m.vehicle, m.color, m.speed ?? 0),
              iconSize: [42, 60],
              iconAnchor: [21, 60],
            }),
            zIndexOffset: 100,
          })
            .addTo(map)
            .on('click', () => { onMemberClick(m.id); showPopup(m, map) })
          vehicleMarkers.current[m.id] = vm
        }
      })

      /* ── Zoom + tools panel (bottom-right) ───────────────────── */
      const ctrlPanel = (L as any).control({ position: 'bottomright' })
      ctrlPanel.onAdd = () => {
        const d = L.DomUtil.create('div', 'gv-ctrl-panel')
        d.style.marginBottom = '10px'
        d.style.marginRight = '10px'
        d.innerHTML = `
          <button class="gv-ctrl-btn" id="gv-zoom-in"    title="Zoom in">+</button>
          <button class="gv-ctrl-btn" id="gv-zoom-out"   title="Zoom out">−</button>
          <div class="gv-ctrl-divider"></div>
          <button class="gv-ctrl-btn" id="gv-fit-all"    title="Fit all members">⊡</button>
          <button class="gv-ctrl-btn" id="gv-follow"     title="Follow mode">🎯</button>
          <div class="gv-ctrl-divider"></div>
          <button class="gv-ctrl-btn" id="gv-style-dark" title="Dark map">🌙</button>
          <button class="gv-ctrl-btn" id="gv-style-light" title="Light map">🗺️</button>
          <button class="gv-ctrl-btn" id="gv-style-sat"  title="Satellite">🛰️</button>
        `
        L.DomEvent.disableClickPropagation(d)
        return d
      }
      ctrlPanel.addTo(map)

      /* ── Live header bar (top-left) ──────────────────────────── */
      const topBar = (L as any).control({ position: 'topleft' })
      topBar.onAdd = () => {
        const d = L.DomUtil.create('div', 'gv-ctrl-top')
        d.style.margin = '10px'
        const onlineCnt = MEMBERS.filter(m => m.status !== 'offline').length
        d.innerHTML = `
          <div class="gv-live-dot"></div>
          <span style="font-size:11px;font-weight:700;color:#F0EDE8;font-family:Inter,sans-serif;letter-spacing:0.04em;">GRAVITY LIVE</span>
          <span style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:4px;">${onlineCnt}/${MAP_MEMBERS.length} online</span>
        `
        L.DomEvent.disableClickPropagation(d)
        return d
      }
      topBar.addTo(map)

      /* ── Wire up control buttons ─────────────────────────────── */
      setTimeout(() => {
        const zi = document.getElementById('gv-zoom-in')
        const zo = document.getElementById('gv-zoom-out')
        const fa = document.getElementById('gv-fit-all')
        const fl = document.getElementById('gv-follow')
        const sd = document.getElementById('gv-style-dark')
        const sl = document.getElementById('gv-style-light')
        const ss = document.getElementById('gv-style-sat')

        zi?.addEventListener('click', () => map.zoomIn())
        zo?.addEventListener('click', () => map.zoomOut())

        fa?.addEventListener('click', () => {
          const pts = MEMBERS.map(m => L.latLng(m.lat, m.lng))
          if (pts.length) {
            map.flyToBounds(L.latLngBounds(pts), { padding: [40, 40], duration: 1.5 })
          }
        })

        fl?.addEventListener('click', () => {
          followRef.current = !followRef.current
          fl.classList.toggle('active', followRef.current)
          if (followRef.current && activeRef.current) {
            const m = MEMBERS.find(x => x.id === activeRef.current)
            if (m) map.flyTo([m.lat, m.lng], 15, { duration: 1.2 })
          }
        })

        const changeStyle = (style: MapStyle) => {
          if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
          tileLayerRef.current = L.tileLayer(MAP_TILES[style].url, {
            subdomains: 'abcd',
            maxZoom: 20,
          }).addTo(map)
          styleRef.current = style
          injectStyles(style === 'dark')
          ;[sd, sl, ss].forEach(b => b?.classList.remove('active'))
        }

        sd?.addEventListener('click', () => { changeStyle('dark');      sd.classList.add('active') })
        sl?.addEventListener('click', () => { changeStyle('voyager');   sl.classList.add('active') })
        ss?.addEventListener('click', () => { changeStyle('satellite'); ss.classList.add('active') })
        sd?.classList.add('active')
      }, 300)

      mapRef.current = map
      startPolling(map, L)

      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 500)
    }

    init()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      trailTimers.current.forEach(t => clearInterval(t))
      trailTimers.current = []
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      personMarkers.current  = {}
      vehicleMarkers.current = {}
      routeLines.current     = {}
      homeLines.current      = {}
      if (containerRef.current) delete (containerRef.current as any)._leaflet_id
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Update markers when activeId changes ────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return
    const L_w = (window as any).L
    if (!L_w) return
    activeRef.current = activeId

    MEMBERS.forEach(m => {
      const active = activeId === m.id
      const size = active ? 60 : 48
      const pm = personMarkers.current[m.id]
      if (pm) {
        pm.setIcon(L_w.divIcon({
          className: 'gv-pin',
          html: personPin(m, active),
          iconSize: [size, size + 24],
          iconAnchor: [size / 2, size + 24],
        }))
        pm.setZIndexOffset(active ? 1000 : 200)
        if (active && followRef.current) {
          mapRef.current.flyTo([m.lat, m.lng], 15, { duration: 1.2 })
        }
      }
      const hl = homeLines.current[m.id]
      if (hl) hl.setStyle({ weight: active ? 2 : 1.5, opacity: active ? 0.6 : 0.2 })
    })
  }, [activeId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
