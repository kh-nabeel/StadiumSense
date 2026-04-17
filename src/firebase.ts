import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { getPerformance, trace } from 'firebase/performance'
import { getRemoteConfig, fetchAndActivate } from 'firebase/remote-config'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const functions = getFunctions(app)
export const analytics = getAnalytics(app)
export const perf = getPerformance(app)
export const measureTrace = (name: string) => trace(perf, name)
export { logEvent }

// Remote Config
export const remoteConfig = getRemoteConfig(app)
remoteConfig.settings.minimumFetchIntervalMillis = 300000
remoteConfig.defaultConfig = {
  halftime_mode: false,
  max_queue_alert_threshold: 15,
  venue_name: 'JN Stadium Kochi',
  match_title: 'Kerala Blasters FC vs Chennaiyin FC',
  exit_routing_active: false,
}


// Messaging is only supported in secure contexts with browser support
export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (supported) return getMessaging(app)
  return null
}

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

export default app
