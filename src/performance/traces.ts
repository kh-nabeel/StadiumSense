import { measureTrace } from '../firebase'

/**
 * Starts a Firebase Performance monitoring trace for Firestore loads.
 * @param {string} collectionName The name of the collection being loaded.
 * @returns {() => void} A function to stop the trace once data loading completes.
 * @example
 * const stopTrace = traceFirestoreLoad('sections');
 * // ... after loading completes
 * stopTrace();
 */
export const traceFirestoreLoad = (collectionName: string) => {
  try {
    const t = measureTrace(`firestore_load_${collectionName}`)
    t.start()
    return () => { try { t.stop() } catch(e) {} }
  } catch(e) {
    console.warn('Perf trace disabled:', e)
    return () => {}
  }
}

/**
 * Starts a Firebase Performance monitoring trace for Google Maps rendering.
 * @returns {() => void} A function to stop the trace once map rendering completes.
 * @example
 * const stopTrace = traceMapRender();
 * // ... after render completes
 * stopTrace();
 */
export const traceMapRender = () => {
  try {
    const t = measureTrace('map_render')
    t.start()
    return () => { try { t.stop() } catch(e) {} }
  } catch(e) {
    console.warn('Perf trace disabled:', e)
    return () => {}
  }
}

/**
 * Starts a Firebase Performance monitoring trace for Gemini API calls.
 * @returns {() => void} A function to stop the trace once the AI API response resolves.
 * @example
 * const stopTrace = traceGeminiCall();
 * // ... after API completes
 * stopTrace();
 */
export const traceGeminiCall = () => {
  try {
    const t = measureTrace('gemini_call')
    t.start()
    return () => { try { t.stop() } catch(e) {} }
  } catch(e) {
    console.warn('Perf trace disabled:', e)
    return () => {}
  }
}
