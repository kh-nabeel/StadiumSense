import type { VenueSection, ConcessionStand, EventTimeline } from '../types'

// ─── 6 Venue Sections ──────────────────────────────────────────────────────────

export const SEED_SECTIONS: VenueSection[] = [
  {
    id: 'section_north_upper',
    name: 'Valiyathura North Upper Stand',
    capacity: 9200,
    currentOccupancy: 8740,
    gateNumber: 'Gate 1',
    lat: 9.9981,
    lng: 76.3008,
  },
  {
    id: 'section_south_upper',
    name: 'Ernakulam South Upper Stand',
    capacity: 9200,
    currentOccupancy: 7180,
    gateNumber: 'Gate 2',
    lat: 9.9963,
    lng: 76.3008,
  },
  {
    id: 'section_east_lower',
    name: 'Mattancherry East Lower Stand',
    capacity: 7800,
    currentOccupancy: 4060,
    gateNumber: 'Gate 3',
    lat: 9.9972,
    lng: 76.3016,
  },
  {
    id: 'section_west_lower',
    name: 'Fort Kochi West Lower Stand',
    capacity: 7800,
    currentOccupancy: 6550,
    gateNumber: 'Gate 4',
    lat: 9.9972,
    lng: 76.3000,
  },
  {
    id: 'section_vip_pavilion',
    name: 'Bolgatty VIP Pavilion',
    capacity: 3200,
    currentOccupancy: 2270,
    gateNumber: 'Gate 5',
    lat: 9.9965,
    lng: 76.2999,
  },
  {
    id: 'section_ultras_north',
    name: 'Yellow Wall Ultras Block',
    capacity: 8400,
    currentOccupancy: 8230,
    gateNumber: 'Gate 6',
    lat: 9.9980,
    lng: 76.3014,
  },
]

// ─── 5 Concession Stands ───────────────────────────────────────────────────────

export const SEED_CONCESSIONS: ConcessionStand[] = [
  {
    id: 'c1',
    name: 'Sadhya Express',
    section: 'North Stand',
    waitTimeMinutes: 22,
    isOpen: true,
    lat: 9.9980,
    lng: 76.3013,
    menuItems: [
      { id: 'c1-1', name: 'Kerala meals', price: 120.0, emoji: '🍱', available: true },
      { id: 'c1-2', name: 'Puttu kadala', price: 80.0, emoji: '🍛', available: true },
      { id: 'c1-3', name: 'Idiyappam', price: 60.5, emoji: '🥐', available: false },
      { id: 'c1-4', name: 'Sambar rice', price: 90.0, emoji: '🍲', available: true },
    ],
  },
  {
    id: 'c2',
    name: 'Thattu Kada Corner',
    section: 'South Stand',
    waitTimeMinutes: 3,
    isOpen: true,
    lat: 9.9964,
    lng: 76.3013,
    menuItems: [
      { id: 'c2-1', name: 'Kappa fish curry', price: 110.0, emoji: '🥘', available: true },
      { id: 'c2-2', name: 'Banana fritters', price: 40.0, emoji: '🍌', available: true },
      { id: 'c2-3', name: 'Uzhunnu vada', price: 30.5, emoji: '🍩', available: true },
      { id: 'c2-4', name: 'Chai', price: 20.0, emoji: '☕', available: true },
    ],
  },
  {
    id: 'c3',
    name: 'Kozhikode Dum Biryani',
    section: 'East Stand',
    waitTimeMinutes: 11,
    isOpen: true,
    lat: 9.9972,
    lng: 76.3019,
    menuItems: [
      { id: 'c3-1', name: 'Chicken biryani', price: 200.0, emoji: '🍗', available: true },
      { id: 'c3-2', name: 'Mutton biryani', price: 260.0, emoji: '🍖', available: true },
      { id: 'c3-3', name: 'Raita', price: 30.0, emoji: '🥗', available: true },
      { id: 'c3-4', name: 'Papad', price: 10.0, emoji: '🥨', available: true },
    ],
  },
  {
    id: 'c4',
    name: 'Malabar Juice and Drinks',
    section: 'West Stand',
    waitTimeMinutes: 1,
    isOpen: true,
    lat: 9.9972,
    lng: 76.3005,
    menuItems: [
      { id: 'c4-1', name: 'Tender coconut', price: 50.0, emoji: '🥥', available: true },
      { id: 'c4-2', name: 'Sugarcane juice', price: 40.0, emoji: '🥤', available: true },
      { id: 'c4-3', name: 'Lime soda', price: 30.0, emoji: '🍋', available: true },
      { id: 'c4-4', name: 'Buttermilk', price: 25.0, emoji: '🥛', available: true },
    ],
  },
  {
    id: 'c5',
    name: 'Backwaters VIP Lounge',
    section: 'VIP Box',
    waitTimeMinutes: 2,
    isOpen: true,
    lat: 9.9972,
    lng: 76.2995,
    menuItems: [
      { id: 'c5-1', name: 'Karimeen pollichathu', price: 450.0, emoji: '🐟', available: true },
      { id: 'c5-2', name: 'Prawn curry', price: 380.0, emoji: '🍤', available: true },
      { id: 'c5-3', name: 'Fish fry', price: 300.0, emoji: '🍱', available: true },
      { id: 'c5-4', name: 'Mocktails', price: 180.0, emoji: '🍹', available: false },
    ],
  },
]

// ─── Event Timeline ────────────────────────────────────────────────────────────

export const SEED_EVENT: EventTimeline = {
  id: 'event-2026-04-15',
  eventName: 'ISL Match — Kerala Blasters vs Chennaiyin',
  homeTeam: 'Kerala Blasters FC',
  awayTeam: 'Chennaiyin FC',
  venue: 'Jawaharlal Nehru Stadium',
  phase: 'kick-off',
  kickoffTime: Date.now() - 1000 * 60 * 22, // kicked off 22 mins ago
}

// ─── Utility: Occupancy % ─────────────────────────────────────────────────────

export function calcOccupancyPct(section: VenueSection): number {
  return Math.round((section.currentOccupancy / section.capacity) * 100)
}

export function getDensityColor(pct: number): string {
  if (pct >= 90) return '#ef4444'   // red — critical
  if (pct >= 70) return '#f59e0b'   // amber — medium
  return '#22c55e'                   // green — low
}

export function getDensityLabel(pct: number): 'low' | 'medium' | 'high' | 'critical' {
  if (pct >= 95) return 'critical'
  if (pct >= 80) return 'high'
  if (pct >= 60) return 'medium'
  return 'low'
}

export function calcWaitTimeDisplay(minutes: number): string {
  if (minutes <= 1) return '~1 min'
  if (minutes < 60) return `~${minutes} min${minutes !== 1 ? 's' : ''}`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}
