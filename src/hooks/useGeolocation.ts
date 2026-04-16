import { useState, useEffect } from 'react'

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lat: number; lng: number; accuracy: number }
  | { status: 'error'; message: string }

export function useGeolocation(autoRequest = false) {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  const request = () => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Geolocation not supported by this browser.' })
      return
    }

    setState({ status: 'loading' })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'success',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Enable location access to find nearest gates.',
          2: 'Unable to determine position. Please try again.',
          3: 'Location request timed out.',
        }
        setState({ status: 'error', message: messages[err.code] ?? 'Unknown location error.' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  useEffect(() => {
    if (autoRequest) request()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { state, request }
}
