/* lib/mapData.ts — Gravity map data & types */

export type VehicleType = 'car' | 'bus' | 'walk' | 'bike' | 'auto' | 'tempo' | 'train' | 'metro'
export type Gender = 'male' | 'female'
export type MemberStatus = 'safe' | 'alert' | 'sos' | 'offline'
export type MapStyle = 'dark' | 'voyager' | 'satellite'

export interface RoutePoint { lat: number; lng: number; time: string; speed: number }

export interface MapGeofence {
  id: string
  name: string
  lat: number
  lng: number
  radius: number        // metres
  color: string
  type: 'safe' | 'alert' | 'restricted'
  members: string[]     // member IDs allowed/watched
}

export interface MapMember {
  id: string
  name: string
  color: string
  photo: string
  location: string
  battery: number
  lat: number
  lng: number
  vehicle: VehicleType
  speed?: number
  gender: Gender
  status: MemberStatus
  lastUpdated: string   // ISO string
  accuracy?: number     // GPS accuracy in metres
  altitude?: number
  heading?: number      // degrees 0-360
  vehicleLat?: number
  vehicleLng?: number
  routeHistory?: RoutePoint[]   // last 10 GPS points for trail
  distanceFromHome?: number     // km
  address?: string
}

/* ── Geofences ──────────────────────────────────────────────── */
export const MAP_GEOFENCES: MapGeofence[] = [
  {
    id: 'home', name: 'Home Zone', lat: 19.0760, lng: 72.8777,
    radius: 400, color: '#10B981', type: 'safe',
    members: ['mom', 'dad', 'priya', 'anya', 'grandpa'],
  },
  {
    id: 'school', name: 'DPS School', lat: 19.0650, lng: 72.9040,
    radius: 300, color: '#3B82F6', type: 'safe',
    members: ['anya'],
  },
  {
    id: 'college', name: 'Mumbai University', lat: 19.1060, lng: 72.8680,
    radius: 350, color: '#8B5CF6', type: 'safe',
    members: ['priya'],
  },
  {
    id: 'office', name: 'Bandra Kurla Complex', lat: 19.0596, lng: 72.8656,
    radius: 500, color: '#F59E0B', type: 'safe',
    members: ['dad'],
  },
  {
    id: 'nogo', name: 'Restricted Zone', lat: 19.0820, lng: 72.9200,
    radius: 200, color: '#EF4444', type: 'restricted',
    members: ['anya', 'priya'],
  },
]

/* ── Members ─────────────────────────────────────────────────── */
export const MAP_MEMBERS: MapMember[] = [
  {
    id: 'mom', name: 'Mom', color: '#3B82F6', gender: 'female',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Home', battery: 87, status: 'safe',
    lat: 19.0760, lng: 72.8777,
    vehicle: 'walk', speed: 3,
    lastUpdated: new Date().toISOString(), accuracy: 8,
    heading: 45, distanceFromHome: 0.0, address: 'Andheri West, Mumbai',
    routeHistory: [
      { lat: 19.0755, lng: 72.8770, time: '10:30', speed: 2 },
      { lat: 19.0757, lng: 72.8773, time: '10:35', speed: 3 },
      { lat: 19.0759, lng: 72.8775, time: '10:40', speed: 2 },
      { lat: 19.0760, lng: 72.8777, time: '10:45', speed: 0 },
    ],
  },
  {
    id: 'dad', name: 'Dad', color: '#10B981', gender: 'male',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Office', battery: 64, status: 'safe',
    lat: 19.0596, lng: 72.8656,
    vehicle: 'car', speed: 42,
    vehicleLat: 19.0590, vehicleLng: 72.8642,
    lastUpdated: new Date().toISOString(), accuracy: 12,
    heading: 210, distanceFromHome: 2.8, address: 'BKC, Bandra East, Mumbai',
    routeHistory: [
      { lat: 19.0760, lng: 72.8777, time: '08:30', speed: 0 },
      { lat: 19.0700, lng: 72.8750, time: '08:45', speed: 35 },
      { lat: 19.0650, lng: 72.8710, time: '09:00', speed: 48 },
      { lat: 19.0620, lng: 72.8680, time: '09:10', speed: 30 },
      { lat: 19.0596, lng: 72.8656, time: '09:20', speed: 0 },
    ],
  },
  {
    id: 'priya', name: 'Priya', color: '#F59E0B', gender: 'female',
    photo: 'https://randomuser.me/api/portraits/women/22.jpg',
    location: 'College', battery: 42, status: 'alert',
    lat: 19.1060, lng: 72.8680,
    vehicle: 'bus', speed: 28,
    vehicleLat: 19.1068, vehicleLng: 72.8668,
    lastUpdated: new Date().toISOString(), accuracy: 15,
    heading: 90, distanceFromHome: 3.4, address: 'Vidyanagari, Santacruz East, Mumbai',
    routeHistory: [
      { lat: 19.0760, lng: 72.8777, time: '07:45', speed: 0 },
      { lat: 19.0850, lng: 72.8750, time: '08:00', speed: 32 },
      { lat: 19.0950, lng: 72.8720, time: '08:20', speed: 28 },
      { lat: 19.1020, lng: 72.8695, time: '08:35', speed: 25 },
      { lat: 19.1060, lng: 72.8680, time: '08:50', speed: 0 },
    ],
  },
  {
    id: 'anya', name: 'Anya', color: '#8B5CF6', gender: 'female',
    photo: 'https://randomuser.me/api/portraits/girls/10.jpg',
    location: 'School', battery: 95, status: 'safe',
    lat: 19.0650, lng: 72.9040,
    vehicle: 'auto', speed: 18,
    vehicleLat: 19.0642, vehicleLng: 72.9028,
    lastUpdated: new Date().toISOString(), accuracy: 6,
    heading: 135, distanceFromHome: 1.9, address: 'Vile Parle East, Mumbai',
    routeHistory: [
      { lat: 19.0760, lng: 72.8777, time: '07:30', speed: 0 },
      { lat: 19.0720, lng: 72.8850, time: '07:45', speed: 22 },
      { lat: 19.0680, lng: 72.8950, time: '07:55', speed: 18 },
      { lat: 19.0650, lng: 72.9040, time: '08:05', speed: 0 },
    ],
  },
  {
    id: 'grandpa', name: 'Grandpa', color: '#EF4444', gender: 'male',
    photo: 'https://randomuser.me/api/portraits/men/70.jpg',
    location: 'Market', battery: 71, status: 'safe',
    lat: 19.0820, lng: 72.8900,
    vehicle: 'walk', speed: 4,
    lastUpdated: new Date().toISOString(), accuracy: 10,
    heading: 270, distanceFromHome: 0.8, address: 'Lokhandwala Market, Andheri West, Mumbai',
    routeHistory: [
      { lat: 19.0760, lng: 72.8777, time: '09:00', speed: 0 },
      { lat: 19.0780, lng: 72.8820, time: '09:15', speed: 4 },
      { lat: 19.0800, lng: 72.8860, time: '09:30', speed: 3 },
      { lat: 19.0820, lng: 72.8900, time: '09:45', speed: 0 },
    ],
  },
]

/* ── Tile layer URLs ─────────────────────────────────────────── */
export const MAP_TILES: Record<MapStyle, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 20,
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri © OpenStreetMap',
    maxZoom: 18,
  },
}

export const HOME_COORDS: [number, number] = [19.0760, 72.8777]
