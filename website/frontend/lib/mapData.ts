/* Shared family member data — no Leaflet dependency */
export interface MapMember {
  id: string
  name: string
  color: string
  photo: string
  location: string
  battery: number
  lat: number
  lng: number
}

export const MAP_MEMBERS: MapMember[] = [
  {
    id: 'mom', name: 'Mom', color: '#3B82F6',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'Home', battery: 87,
    lat: 19.0760, lng: 72.8777,
  },
  {
    id: 'dad', name: 'Dad', color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'Office', battery: 64,
    lat: 19.0500, lng: 72.8420,
  },
  {
    id: 'priya', name: 'Priya', color: '#F59E0B',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'College', battery: 42,
    lat: 19.1060, lng: 72.8680,
  },
  {
    id: 'anya', name: 'Anya', color: '#8B5CF6',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    location: 'School', battery: 95,
    lat: 19.0650, lng: 72.9040,
  },
]
