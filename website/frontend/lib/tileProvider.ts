/**
 * Tile Provider with automatic fallback chain.
 *
 * Chain order per style:
 *   dark      → Mapbox Dark (paid, if token set) → CartoDB Dark (OSM) → OSM Standard
 *   voyager   → Mapbox Streets (paid)            → CartoDB Voyager   → OSM Standard
 *   satellite → Mapbox Satellite (paid)           → Google Earth      → ESRI Imagery → OSM Standard
 *
 * If a tile-layer accumulates ≥ ERROR_THRESHOLD consecutive errors, the manager
 * removes it and transparently promotes the next entry in the chain — no user
 * action required, map never goes blank.
 */

export interface TileSource {
  id: string
  label: string
  url: string
  opts: Record<string, unknown>
  isPaid: boolean
}

export interface FallbackTileManager {
  /** Cleanly detach the currently active layer from the map. */
  remove: () => void
  getCurrentId: () => string
  getCurrentLabel: () => string
  isPaidActive: () => boolean
}

/* ── resolve NEXT_PUBLIC env vars (inlined at build time by Next.js) ── */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

function mapboxSources(
  style: 'dark-v11' | 'streets-v12' | 'satellite-streets-v12',
  id: string,
  label: string,
): TileSource[] {
  if (!MAPBOX_TOKEN) return []
  return [
    {
      id,
      label: `${label} (Mapbox — paid)`,
      url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
      opts: { maxZoom: 22, tileSize: 512, zoomOffset: -1 },
      isPaid: true,
    },
  ]
}

/* ── Tile chains (paid-first, free fallbacks, OSM last resort) ────── */
export const TILE_CHAINS: Record<'dark' | 'voyager' | 'satellite', TileSource[]> = {
  dark: [
    ...mapboxSources('dark-v11', 'mapbox-dark', 'Dark'),
    {
      id: 'carto-dark',
      label: 'Dark (CartoDB + OpenStreetMap)',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      opts: { subdomains: 'abcd', maxZoom: 20 },
      isPaid: false,
    },
    {
      id: 'osm-standard',
      label: 'Standard (OpenStreetMap — always-on)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { subdomains: 'abc', maxZoom: 19 },
      isPaid: false,
    },
  ],

  voyager: [
    ...mapboxSources('streets-v12', 'mapbox-streets', 'Streets'),
    {
      id: 'carto-voyager',
      label: 'Voyager (CartoDB + OpenStreetMap)',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      opts: { subdomains: 'abcd', maxZoom: 20 },
      isPaid: false,
    },
    {
      id: 'osm-standard',
      label: 'Standard (OpenStreetMap — always-on)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { subdomains: 'abc', maxZoom: 19 },
      isPaid: false,
    },
  ],

  satellite: [
    ...mapboxSources('satellite-streets-v12', 'mapbox-satellite', 'Satellite'),
    {
      id: 'google-earth',
      label: 'Satellite (Google Earth)',
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      opts: { subdomains: '0123', maxZoom: 22 },
      isPaid: false,
    },
    {
      id: 'esri-satellite',
      label: 'Satellite (ESRI World Imagery — free)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      opts: { maxZoom: 19 },
      isPaid: false,
    },
    {
      id: 'osm-standard',
      label: 'Standard (OpenStreetMap — always-on)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      opts: { subdomains: 'abc', maxZoom: 19 },
      isPaid: false,
    },
  ],
}

/**
 * Creates a Leaflet tile layer backed by an automatic fallback chain.
 *
 * The returned manager's `.remove()` method works like a normal Leaflet
 * layer's `.remove()`, so it can be stored wherever a raw tile layer was
 * stored before (e.g. `tileLayerRef.current`).
 *
 * @param L        - Leaflet module (dynamic import)
 * @param map      - Leaflet map instance
 * @param chain    - Ordered array of tile sources (preferred → fallback)
 * @param onSwitch - Optional callback fired when the chain advances
 */
export function createFallbackTileLayer(
  L: any,
  map: any,
  chain: TileSource[],
  onSwitch?: (fromId: string, toId: string, toLabel: string) => void,
): FallbackTileManager {
  const ERROR_THRESHOLD = 5   // consecutive tile errors before promoting fallback
  let chainIdx = 0
  let errorCount = 0
  let switching = false
  let activeLayer: any = null
  let destroyed = false

  function mount(idx: number) {
    if (destroyed || idx >= chain.length) return
    const src = chain[idx]

    const layer = L.tileLayer(src.url, { ...src.opts })
    layer.addTo(map)
    activeLayer = layer

    layer.on('tileload', () => {
      /* successful load — reset the error counter for this tier */
      if (chainIdx === idx) errorCount = 0
    })

    layer.on('tileerror', () => {
      if (destroyed || switching || chainIdx !== idx) return
      errorCount++
      if (errorCount < ERROR_THRESHOLD) return

      const nextIdx = idx + 1
      if (nextIdx >= chain.length) return    // already at last fallback

      switching = true
      try { map.removeLayer(layer) } catch (_) { /* ignore */ }
      chainIdx = nextIdx
      errorCount = 0
      const next = chain[nextIdx]
      onSwitch?.(src.id, next.id, next.label)
      mount(nextIdx)
      switching = false
    })
  }

  mount(0)

  return {
    remove() {
      destroyed = true
      if (activeLayer) {
        try { map.removeLayer(activeLayer) } catch (_) { /* ignore */ }
        activeLayer = null
      }
    },
    getCurrentId:    () => chain[chainIdx]?.id    ?? 'unknown',
    getCurrentLabel: () => chain[chainIdx]?.label ?? 'Unknown',
    isPaidActive:    () => chain[chainIdx]?.isPaid ?? false,
  }
}
