/* Shared family member data — no Leaflet dependency */
export type VehicleType = 'car' | 'bus' | 'walk' | 'bike' | 'auto' | 'tempo'
export type Gender = 'male' | 'female'

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
  /* Vehicle parked slightly offset from person (on nearby road) */
  vehicleLat?: number
  vehicleLng?: number
}

export const MAP_MEMBERS: MapMember[] = [
  {
    id: 'mom', name: 'Mom', color: '#3B82F6', gender: 'female',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'Home', battery: 87,
    lat: 19.0760, lng: 72.8777,
    vehicle: 'walk', speed: 3,
    /* walking — no separate vehicle marker */
  },
  {
    id: 'dad', name: 'Dad', color: '#10B981', gender: 'male',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'Office', battery: 64,
    lat: 19.0500, lng: 72.8420,
    vehicle: 'car', speed: 42,
    vehicleLat: 19.0493, vehicleLng: 72.8408,   /* car on road 200m away */
  },
  {
    id: 'priya', name: 'Priya', color: '#F59E0B', gender: 'female',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'College', battery: 42,
    lat: 19.1060, lng: 72.8680,
    vehicle: 'bus', speed: 28,
    vehicleLat: 19.1068, vehicleLng: 72.8668,   /* bus at bus stop */
  },
  {
    id: 'anya', name: 'Anya', color: '#8B5CF6', gender: 'female',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'School', battery: 95,
    lat: 19.0650, lng: 72.9040,
    vehicle: 'auto', speed: 18,
    vehicleLat: 19.0642, vehicleLng: 72.9028,   /* auto on road */
  },
  {
    id: 'grandpa', name: 'Grandpa', color: '#EF4444', gender: 'male',
    photo: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'Market', battery: 71,
    lat: 19.0820, lng: 72.8900,
    vehicle: 'tempo', speed: 22,
    vehicleLat: 19.0812, vehicleLng: 72.8888,   /* tempo on road */
  },
]
