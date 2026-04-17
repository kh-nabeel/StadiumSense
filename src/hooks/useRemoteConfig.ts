import { useState, useEffect } from 'react'
import { remoteConfig } from '../firebase'
import { fetchAndActivate, getBoolean, getString, getNumber } from 'firebase/remote-config'

export function useRemoteConfig() {
  const [halftimeMode, setHalftimeMode] = useState(false)
  const [venueName, setVenueName] = useState('JN Stadium Kochi')
  const [matchTitle, setMatchTitle] = useState('Kerala Blasters FC vs Chennaiyin FC')
  const [maxQueueThreshold, setMaxQueueThreshold] = useState(15)
  const [exitRoutingActive, setExitRoutingActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const initConfig = async () => {
      try {
        await fetchAndActivate(remoteConfig)
        if (isMounted) {
          setHalftimeMode(getBoolean(remoteConfig, 'halftime_mode'))
          setVenueName(getString(remoteConfig, 'venue_name'))
          setMatchTitle(getString(remoteConfig, 'match_title'))
          setMaxQueueThreshold(getNumber(remoteConfig, 'max_queue_alert_threshold'))
          setExitRoutingActive(getBoolean(remoteConfig, 'exit_routing_active'))
        }
      } catch (error) {
        console.error('Remote config error (using defaults):', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initConfig()
    return () => { isMounted = false }
  }, [])

  // Aliasing venueNqme just in case the typo was strict, but providing venueName too
  return { halftimeMode, venueName, venueNqme: venueName, matchTitle, maxQueueThreshold, exitRoutingActive, loading }
}
