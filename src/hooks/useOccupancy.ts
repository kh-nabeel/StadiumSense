import { useMemo } from 'react'
import { useFirestoreCollection } from './useFirestore'
import { SEED_SECTIONS, calcOccupancyPct, getDensityColor, getDensityLabel } from '../data/seedData'
import type { VenueSection } from '../types'

export interface EnrichedSection extends VenueSection {
  occupancyPct: number
  densityColor: string
  densityLabel: 'low' | 'medium' | 'high' | 'critical'
}

export function useOccupancy() {
  const { data: firestoreSections, loading, error } = useFirestoreCollection<VenueSection>('sections')

  // Fall back to seed data if Firestore is empty or erroring
  const rawSections: VenueSection[] = firestoreSections.length > 0 ? firestoreSections : SEED_SECTIONS

  const sections: EnrichedSection[] = useMemo(() =>
    rawSections.map((s: any) => {
      const currentOcc = s.currentOccupancy ?? s.current ?? 0
      const cap = s.capacity ?? 1
      const pct = Math.round((currentOcc / cap) * 100)
      const seedMatch = SEED_SECTIONS.find(seed => seed.id === s.id)
      
      return {
        ...s,
        currentOccupancy: currentOcc,
        gateNumber: s.gateNumber ?? s.gate ?? seedMatch?.gateNumber ?? '',
        lat: seedMatch?.lat ?? s.lat ?? 0,
        lng: seedMatch?.lng ?? s.lng ?? 0,
        occupancyPct: pct,
        densityColor: getDensityColor(pct),
        densityLabel: getDensityLabel(pct),
      } as EnrichedSection
    }),
    [rawSections]
  )

  const nearestOpenGate = useMemo(() => {
    return sections
      .filter((s) => s.occupancyPct < 80)
      .sort((a, b) => a.occupancyPct - b.occupancyPct)[0] ?? sections[0]
  }, [sections])

  const totalAttendance = useMemo(() =>
    sections.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0),
    [sections]
  )

  const averageOccupancyPct = useMemo(() =>
    Math.round(sections.reduce((sum, s) => sum + s.occupancyPct, 0) / sections.length),
    [sections]
  )

  return { sections, loading, error, nearestOpenGate, totalAttendance, averageOccupancyPct }
}
