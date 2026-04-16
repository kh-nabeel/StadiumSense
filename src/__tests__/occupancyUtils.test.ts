import {
  calcOccupancyPct,
  getDensityColor,
  getDensityLabel,
  SEED_SECTIONS,
} from '../data/seedData'
import type { VenueSection } from '../types'

const makeSection = (current: number, capacity: number): VenueSection => ({
  id: 'test',
  name: 'Test Section',
  capacity,
  currentOccupancy: current,
  gateNumber: 'Gate T',
  lat: 0,
  lng: 0,
})

describe('calcOccupancyPct', () => {
  it('returns 0 when section is empty', () => {
    expect(calcOccupancyPct(makeSection(0, 1000))).toBe(0)
  })

  it('returns 100 when section is at capacity', () => {
    expect(calcOccupancyPct(makeSection(1000, 1000))).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calcOccupancyPct(makeSection(333, 1000))).toBe(33)
  })

  it('calculates 50% correctly', () => {
    expect(calcOccupancyPct(makeSection(500, 1000))).toBe(50)
  })

  it('calculates 75% correctly', () => {
    expect(calcOccupancyPct(makeSection(750, 1000))).toBe(75)
  })
})

describe('getDensityColor', () => {
  it('returns green for low occupancy (< 70%)', () => {
    expect(getDensityColor(50)).toBe('#22c55e')
    expect(getDensityColor(0)).toBe('#22c55e')
    expect(getDensityColor(69)).toBe('#22c55e')
  })

  it('returns amber for medium occupancy (70–89%)', () => {
    expect(getDensityColor(70)).toBe('#f59e0b')
    expect(getDensityColor(80)).toBe('#f59e0b')
    expect(getDensityColor(89)).toBe('#f59e0b')
  })

  it('returns red for high occupancy (>= 90%)', () => {
    expect(getDensityColor(90)).toBe('#ef4444')
    expect(getDensityColor(100)).toBe('#ef4444')
  })
})

describe('getDensityLabel', () => {
  it('returns low for < 60%', () => {
    expect(getDensityLabel(0)).toBe('low')
    expect(getDensityLabel(59)).toBe('low')
  })

  it('returns medium for 60–79%', () => {
    expect(getDensityLabel(60)).toBe('medium')
    expect(getDensityLabel(79)).toBe('medium')
  })

  it('returns high for 80–94%', () => {
    expect(getDensityLabel(80)).toBe('high')
    expect(getDensityLabel(94)).toBe('high')
  })

  it('returns critical for >= 95%', () => {
    expect(getDensityLabel(95)).toBe('critical')
    expect(getDensityLabel(100)).toBe('critical')
  })
})

describe('SEED_SECTIONS', () => {
  it('contains exactly 6 sections', () => {
    expect(SEED_SECTIONS).toHaveLength(6)
  })

  it('each section has required fields', () => {
    SEED_SECTIONS.forEach(section => {
      expect(section.id).toBeTruthy()
      expect(section.name).toBeTruthy()
      expect(section.capacity).toBeGreaterThan(0)
      expect(section.currentOccupancy).toBeGreaterThanOrEqual(0)
      expect(section.currentOccupancy).toBeLessThanOrEqual(section.capacity)
      expect(section.gateNumber).toBeTruthy()
    })
  })

  it('all sections have valid lat/lng coordinates', () => {
    SEED_SECTIONS.forEach(section => {
      expect(typeof section.lat).toBe('number')
      expect(typeof section.lng).toBe('number')
    })
  })
})
