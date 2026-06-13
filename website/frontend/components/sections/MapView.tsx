'use client'

import { useEffect, useRef } from 'react'
import { MAP_MEMBERS, VehicleType, Gender } from '@/lib/mapData'

const HOME: [number, number] = [19.0760, 72.8777]

/* ── Vehicle emoji map ────────────────────────────────────────── */
const VEHICLE_EMOJI: Record<VehicleType, string> = {
  car:   '🚗',
  bus:   '🚌',
  walk:  '🚶',
  bike:  '🚲',
  auto:  '🛺',
  tempo: '🚛',
}

const VEHICLE_LABEL: Record<VehicleType, string> = {
  car:   'CAR',
  bus:   'BUS',
  walk:  'WALK',
  bike:  'BIKE',
  auto:  'AUTO',
  tempo: 'TEMPO',
}

/* ── Gender SVG ──────────────────────────────────────────────── */
function genderSvg(gender: Gender): string {
  if (gender === 'male') {
    /* Male symbol — circle + arrow ↗ */
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" fill="#fff">
      <path d="M9 9c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6zm6-4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-3 9.24V16h2v-1.76A8.01 8.01 0 0 1 20.94 9H21V7h-.12C19.18 4.61 16.75 3 14 3 9.58 3 6 6.58 6 11c0 4.08 3.05 7.44 7 7.93V21h2v-2.07c.34-.04.67-.1 1-.19V17c-.33.09-.66.14-1 .16V14.24z"/>
    </svg>`
  }
  /* Female symbol — circle + cross ↓ */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" fill="#fff">
    <path d="M11 14.93V17H9v2h2v2h2v-2h2v-2h-2v-2.07C16.94 14.44 20 11.08 20 7c0-4.42-3.58-8-8-8S4 2.58 4 7c0 4.08 3.05 7.44 7 7.93zM12 2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"/>
  </svg>`
}

/* ── Person pin HTML (face + gender badge + name) ────────────── */
function personPinHtml(
  photo: string,
  color: string,
  name: string,
  gender: Gender,
  active: boolean,
): string {
  const size       = active ? 58 : 50
  const genderBg   = gender === 'male' ? '#3B82F6' : '#EC4899'
  const glow       = active ? 24 : 12
  const op         = active ? '99' : '60'

  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;position:relative;">
    <!-- pulse rings -->
    <div class="gpin-pulse" style="--c:${color};inset:-10px;position:absolute;border-radius:50%;background:var(--c);animation:gpin-pulse-anim 2.6s ease-out infinite;opacity:0;pointer-events:none;"></div>
    <div class="gpin-pulse gpin-p2" style="--c:${color};inset:-10px;position:absolute;border-radius:50%;background:var(--c);animation:gpin-pulse-anim 2.6s ease-out infinite;animation-delay:1.3s;opacity:0;pointer-events:none;"></div>

    <!-- photo circle -->
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;
      border:3px solid ${color};position:relative;flex-shrink:0;
      box-shadow:0 0 ${glow}px ${color}${op},0 4px 16px rgba(0,0,0,0.5);
    ">
      <img src="${photo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block;"/>

      <!-- gender badge top-right -->
      <div style="
        position:absolute;top:-2px;right:-2px;
        width:18px;height:18px;border-radius:50%;
        background:${genderBg};
        border:2px solid #06090F;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">
        ${genderSvg(gender)}
      </div>

      <!-- live dot bottom-right -->
      <div class="gpin-dot" style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#10B981;border:2px solid #06090F;z-index:2;"></div>
    </div>

    <!-- name tag -->
    <div style="
      background:rgba(6,9,15,0.88);
      color:${color};
      font-size:9px;font-weight:700;
      padding:2px 7px;border-radius:4px;
      border:1px solid ${color}50;
      backdrop-filter:blur(8px);
      white-space:nowrap;
      font-family:'Inter',sans-serif;
      letter-spacing:0.05em;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    ">${name.toUpperCase()}</div>
  </div>`
}

/* ── Vehicle marker HTML ─────────────────────────────────────── */
function vehiclePinHtml(vehicle: VehicleType, color: string, speed: number): string {
  const emoji = VEHICLE_EMOJI[vehicle]
  const label = VEHICLE_LABEL[vehicle]

  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;">
    <!-- vehicle icon box -->
    <div style="
      width:46px;height:46px;border-radius:14px;
      background:${color};
      display:flex;align-items:center;justify-content:center;
      font-size:24px;line-height:1;
      box-shadow:0 0 18px ${color}80,0 4px 16px rgba(0,0,0,0.5),0 0 0 2px rgba(255,255,255,0.15);
      border:2px solid rgba(255,255,255,0.25);
      animation:vehicle-pulse 2.5s ease-in-out infinite;
    ">${emoji}</div>

    <!-- speed + label badge -->
    <div style="
      background:rgba(6,9,15,0.90);
      color:#fff;
      font-size:8px;font-weight:700;
      padding:2px 6px;border-radius:4px;
      border:1px solid ${color}60;
      white-space:nowrap;
      font-family:'Inter',sans-serif;
      letter-spacing:0.04em;
      display:flex;align-items:center;gap:3px;
    ">
      <span style="color:${color}">${label}</span>
      <span style="color:rgba(255,255,255,0.5)">·</span>
      <span>${speed}km/h</span>
    </div>
  </div>`
}

/* ── Home marker ────────────────────────────────────────────── */
function homePinHtml(): string {
  return `
  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
    <div style="
      width:40px;height:40px;border-radius:50%;
      background:rgba(16,185,129,0.15);
      border:2px solid #10B981;
      display:flex;align-items:center;justify-content:center;
      font-size:20px;
      box-shadow:0 0 16px rgba(16,185,129,0.5),0 4px 12px rgba(0,0,0,0.4);
    ">🏠</div>
    <div style="
      background:rgba(16,185,129,0.2);color:#10B981;
      font-size:8px;font-weight:700;
      padding:1px 6px;border-radius:3px;
      border:1px solid rgba(16,185,129,0.4);
      font-family:'Inter',sans-serif;letter-spacing:0.06em;
    ">HOME</div>
  </div>`
}

/* ── Inject vehicle-pulse keyframe ───────────────────────────── */
function injectStyles() {
  if (document.getElementById('gv-map-styles')) return
  const style = document.createElement('style')
  style.id = 'gv-map-styles'
  style.textContent = `
    @keyframes vehicle-pulse {
      0%,100% { transform:scale(1);   box-shadow-spread:0; }
      50%      { transform:scale(1.06); }
    }
    @keyframes gpin-pulse-anim {
      0%   { transform:scale(0.55); opacity:0.75; }
      100% { transform:scale(2.4);  opacity:0; }
    }
  `
  document.head.appendChild(style)
}

/* ── MapView ─────────────────────────────────────────────────── */
export default function MapView({
  activeId,
  onMemberClick,
}: {
  activeId: string | null
  onMemberClick: (id: string) => void
}) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<any>(null)
  const personMarkers = useRef<Record<string, any>>({})
  const vehicleMarkers= useRef<Record<string, any>>({})
  const linesRef      = useRef<Record<string, any>>({})
  const activeRef     = useRef<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      injectStyles()
      const L = (await import('leaflet')).default
      delete (containerRef.current as any)._leaflet_id

      const map = L.map(containerRef.current!, {
        center:             HOME,
        zoom:               14,          /* zoom 14 — roads clearly visible */
        zoomControl:        false,
        attributionControl: false,
        dragging:           true,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        touchZoom:          true,
        boxZoom:            false,
        keyboard:           false,
      })

      /* ── Carto Voyager tiles — colorful roads clearly visible ── */
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 20 }
      ).addTo(map)

      /* ── Home marker ─────────────────────────────────────────── */
      L.marker(HOME, {
        icon: L.divIcon({
          className: 'gravity-pin',
          html:      homePinHtml(),
          iconSize:   [40, 56],
          iconAnchor: [20, 56],
        }),
        zIndexOffset: 500,
      }).addTo(map)

      /* ── Geofence circles ────────────────────────────────────── */
      L.circle(HOME, {
        radius: 400, color: '#10B981', fillColor: '#10B981',
        fillOpacity: 0.05, dashArray: '8 6', weight: 1.5,
      }).addTo(map)

      L.circle([19.1060, 72.8680], {        /* college */
        radius: 300, color: '#F59E0B', fillColor: '#F59E0B',
        fillOpacity: 0.04, dashArray: '5 5', weight: 1.2,
      }).addTo(map)

      L.circle([19.0650, 72.9040], {        /* school */
        radius: 250, color: '#8B5CF6', fillColor: '#8B5CF6',
        fillOpacity: 0.04, dashArray: '5 5', weight: 1.2,
      }).addTo(map)

      /* ── Per-member markers ───────────────────────────────────── */
      MAP_MEMBERS.forEach(m => {
        const isActive = activeRef.current === m.id

        /* Dashed route line to home */
        const line = L.polyline([HOME, [m.lat, m.lng]], {
          color: m.color, weight: isActive ? 3 : 2,
          opacity: isActive ? 0.9 : 0.45, dashArray: '8 6',
        }).addTo(map)
        linesRef.current[m.id] = line

        /* PERSON marker */
        const personSize = isActive ? 58 : 50
        const personIcon = L.divIcon({
          className: 'gravity-pin',
          html:      personPinHtml(m.photo, m.color, m.name, m.gender, isActive),
          iconSize:   [personSize, personSize + 20],
          iconAnchor: [personSize / 2, personSize + 20],
        })
        const personMarker = L.marker([m.lat, m.lng], { icon: personIcon, zIndexOffset: 200 })
          .addTo(map)
          .on('click', () => onMemberClick(m.id))
        personMarkers.current[m.id] = personMarker

        /* VEHICLE marker (only if offset position given) */
        if (m.vehicleLat && m.vehicleLng && m.vehicle !== 'walk') {
          /* Connector line from person to vehicle */
          L.polyline([[m.lat, m.lng], [m.vehicleLat, m.vehicleLng]], {
            color: m.color, weight: 1, opacity: 0.35, dashArray: '3 5',
          }).addTo(map)

          const vIcon = L.divIcon({
            className: 'gravity-pin',
            html:      vehiclePinHtml(m.vehicle, m.color, m.speed ?? 0),
            iconSize:   [46, 64],
            iconAnchor: [23, 64],
          })
          const vMarker = L.marker([m.vehicleLat, m.vehicleLng], { icon: vIcon, zIndexOffset: 100 })
            .addTo(map)
            .on('click', () => onMemberClick(m.id))
          vehicleMarkers.current[m.id] = vMarker
        }
      })

      mapRef.current = map

      /* Force Leaflet to recalculate container size */
      setTimeout(() => map.invalidateSize(), 80)
      setTimeout(() => map.invalidateSize(), 400)
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        personMarkers.current  = {}
        vehicleMarkers.current = {}
        linesRef.current       = {}
      }
      if (containerRef.current) delete (containerRef.current as any)._leaflet_id
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Update marker states on activeId change */
  useEffect(() => {
    if (!mapRef.current) return
    activeRef.current = activeId
    const L_mod = (window as any).L
    if (!L_mod) return

    MAP_MEMBERS.forEach(m => {
      const isActive = activeId === m.id

      /* Update line */
      const line = linesRef.current[m.id]
      if (line) line.setStyle({ weight: isActive ? 3 : 2, opacity: isActive ? 0.9 : 0.45 })

      /* Update person marker */
      const pm = personMarkers.current[m.id]
      if (pm) {
        const size = isActive ? 58 : 50
        pm.setIcon(L_mod.divIcon({
          className: 'gravity-pin',
          html:      personPinHtml(m.photo, m.color, m.name, m.gender, isActive),
          iconSize:   [size, size + 20],
          iconAnchor: [size / 2, size + 20],
        }))
        if (isActive) pm.setZIndexOffset(1000)
        else pm.setZIndexOffset(200)
      }
    })
  }, [activeId])

  /* Expose L on window */
  useEffect(() => {
    import('leaflet').then(mod => { ;(window as any).L = mod.default })
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
