'use client'

import { useEffect, useRef } from 'react'
import { MAP_MEMBERS } from '@/lib/mapData'

const HOME: [number, number] = [19.0760, 72.8777]

/* ── Build DivIcon HTML for a member ─────────────────────────── */
function pinHtml(photo: string, color: string, name: string, active: boolean) {
  const size = active ? 54 : 48
  const inset = active ? 10 : 8
  const glow = active ? 20 : 12
  const opacity = active ? '99' : '55'
  return `
    <div class="gpin" style="width:${size}px;height:${size}px">
      <div class="gpin-pulse" style="--c:${color};inset:-${inset}px"></div>
      <div class="gpin-pulse gpin-p2" style="--c:${color};inset:-${inset}px"></div>
      <div class="gpin-img" style="border-color:${color};box-shadow:0 0 ${glow}px ${color}${opacity};width:${size}px;height:${size}px">
        <img src="${photo}" alt="${name}" />
      </div>
      <div class="gpin-dot"></div>
    </div>
  `
}

/* ── MapView — vanilla Leaflet, no react-leaflet ─────────────── */
export default function MapView({
  activeId,
  onMemberClick,
}: {
  activeId: string | null
  onMemberClick: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef      = useRef<any>(null)
  const markersRef  = useRef<Record<string, any>>({})
  const linesRef    = useRef<Record<string, any>>({})
  const activeRef   = useRef<string | null>(null)

  /* Initial map setup */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      const L = (await import('leaflet')).default

      /* Clear stale Leaflet ID — React Strict Mode runs effects twice */
      delete (containerRef.current as any)._leaflet_id

      const map = L.map(containerRef.current!, {
        center: HOME,
        zoom: 13,
        zoomControl:        false,
        attributionControl: false,
        dragging:           false,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        touchZoom:          false,
        boxZoom:            false,
        keyboard:           false,
      })

      /* CartoDB Dark Matter tiles */
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 20 }
      ).addTo(map)

      /* Geofence — Home (emerald dashed) */
      L.circle(HOME, {
        radius: 500,
        color: '#10B981', fillColor: '#10B981',
        fillOpacity: 0.05, dashArray: '7 5', weight: 1.5,
      }).addTo(map)

      /* Geofence — School (amber dashed) */
      L.circle([19.1060, 72.8680], {
        radius: 350,
        color: '#F59E0B', fillColor: '#F59E0B',
        fillOpacity: 0.04, dashArray: '5 4', weight: 1.5,
      }).addTo(map)

      /* Connection lines + markers */
      MAP_MEMBERS.forEach(m => {
        const isActive = activeRef.current === m.id

        /* Dashed polyline from home */
        const line = L.polyline([HOME, [m.lat, m.lng]], {
          color: m.color,
          weight:  isActive ? 2 : 1,
          opacity: isActive ? 0.75 : 0.22,
          dashArray: '6 7',
        }).addTo(map)
        linesRef.current[m.id] = line

        /* Photo marker */
        const icon = L.divIcon({
          className: 'gravity-pin',
          html: pinHtml(m.photo, m.color, m.name, isActive),
          iconSize:   [isActive ? 54 : 48, isActive ? 54 : 48],
          iconAnchor: [isActive ? 27 : 24, isActive ? 27 : 24],
        })

        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .on('click', () => onMemberClick(m.id))

        markersRef.current[m.id] = marker
      })

      mapRef.current = map
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = {}
        linesRef.current = {}
      }
      /* Also clear the DOM-level Leaflet ID so next init doesn't throw */
      if (containerRef.current) {
        delete (containerRef.current as any)._leaflet_id
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Update markers/lines when activeId changes */
  useEffect(() => {
    if (!mapRef.current) return
    activeRef.current = activeId

    MAP_MEMBERS.forEach(m => {
      const isActive = activeId === m.id

      /* Update line style */
      const line = linesRef.current[m.id]
      if (line) {
        line.setStyle({
          weight:  isActive ? 2 : 1,
          opacity: isActive ? 0.75 : 0.22,
        })
      }

      /* Update marker icon */
      const marker = markersRef.current[m.id]
      if (marker) {
        const L_mod = (window as any).L
        if (!L_mod) return
        const size = isActive ? 54 : 48
        const half = size / 2
        marker.setIcon(L_mod.divIcon({
          className: 'gravity-pin',
          html: pinHtml(m.photo, m.color, m.name, isActive),
          iconSize:   [size, size],
          iconAnchor: [half, half],
        }))
      }
    })
  }, [activeId])

  /* Expose L on window for the activeId effect above */
  useEffect(() => {
    import('leaflet').then(mod => {
      ;(window as any).L = mod.default
    })
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
