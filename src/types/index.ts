// ─── Domain Types ──────────────────────────────────────────────────────────────

export type DensityLevel = 'low' | 'medium' | 'high' | 'critical'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'collected'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type EventPhase = 'pre-match' | 'kick-off' | 'half-time' | 'second-half' | 'full-time'

// ─── Venue Section ─────────────────────────────────────────────────────────────

export interface VenueSection {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
  gateNumber: string
  lat: number
  lng: number
  color?: string
}

// ─── Concession Stand ──────────────────────────────────────────────────────────

export interface MenuItem {
  id: string
  name: string
  price: number
  emoji: string
  available: boolean
}

export interface ConcessionStand {
  id: string
  name: string
  section: string
  waitTimeMinutes: number
  isOpen: boolean
  menuItems: MenuItem[]
  lat: number
  lng: number
}

// ─── Food Order ────────────────────────────────────────────────────────────────

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

export interface FoodOrder {
  id?: string
  userId: string
  standId: string
  standName: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  createdAt: number
  updatedAt?: number
  seatNumber?: string
  specialInstructions?: string
}

// ─── Alert ─────────────────────────────────────────────────────────────────────

export interface StadiumAlert {
  id?: string
  title: string
  message: string
  severity: AlertSeverity
  targetZone: string | 'all'
  createdAt: number
  expiresAt?: number
  createdBy?: string
}

// ─── Event Timeline ────────────────────────────────────────────────────────────

export interface EventTimeline {
  id?: string
  eventName: string
  homeTeam: string
  awayTeam: string
  venue: string
  phase: EventPhase
  kickoffTime: number
  halfTimeStarted?: number
  secondHalfStarted?: number
  fullTimeAt?: number
}

// ─── AI Routing ────────────────────────────────────────────────────────────────

export interface RoutingSuggestion {
  fromSection: string
  toGate: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

export interface CrowdRoutingResponse {
  suggestions: RoutingSuggestion[]
  summary: string
  generatedAt: number
}

// ─── NEW INTERFACES REQUESTED ──────────────────────────────────────────────────

export interface Section {
  id: string;
  name: string;
  gate: string;
  capacity: number;
  current: number;
  occupancyPct: number;
  waitMin: number;
  status: 'critical' | 'busy' | 'clear' | 'normal';
  zone: string;
  level: string;
}

export interface Concession {
  id: string;
  name: string;
  location: string;
  items: string[];
  waitMin: number;
  queueLength: number;
  priceRange: string;
  isOpen: boolean;
  acceptsUPI: boolean;
  preOrderEnabled: boolean;
}

export interface Alert {
  id: string;
  type: string;
  zone: string;
  active: boolean;
  message: string;
  timestamp: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  zone: string;
  gate: string;
  phone: string;
}

export interface MatchEvent {
  id: string;
  label: string;
  time: number;
  status: 'done' | 'active' | 'upcoming';
  description: string;
}

export interface RemoteConfigValues {
  halftimeMode: boolean;
  venueName: string;
  matchTitle: string;
  maxQueueThreshold: number;
  exitRoutingActive: boolean;
  loading: boolean;
}
