import { useState, useEffect, useRef } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import { traceFirestoreLoad } from '../performance/traces'
import { COLLECTIONS } from '../constants'

// ─── useFirestoreCollection ────────────────────────────────────────────────────

/**
 * Custom hook to fetch a Firestore collection and listen to real-time updates.
 * @param collectionPath The path to the Firestore collection.
 * @param constraints Optional Firestore query constraints (e.g., where, orderBy).
 * @returns An object containing the data array, loading state, and any error encountered.
 * @example
 * const { data, loading, error } = useFirestoreCollection('sections', [where('status', '==', 'critical')]);
 */
export function useFirestoreCollection<T extends DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isFirst = useRef(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    isFirst.current = true
    const stopTrace = (collectionPath === COLLECTIONS.SECTIONS || collectionPath === COLLECTIONS.CONCESSIONS)
      ? traceFirestoreLoad(collectionPath)
      : null

    const ref = collection(db, collectionPath)
    const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref)

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T))
        
        if (isFirst.current) {
          isFirst.current = false
          setData(docs)
          setLoading(false)
          if (stopTrace) stopTrace()
        } else {
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            setData(docs)
            setLoading(false)
          }, 1000)
        }
      },
      (err) => {
        console.error(`Firestore [${collectionPath}] error:`, err)
        setError(err)
        setLoading(false)
        if (stopTrace) stopTrace()
      }
    )

    return () => {
      unsub()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath])

  return { data, loading, error }
}

// ─── useFirestoreDocument ──────────────────────────────────────────────────────

/**
 * Custom hook to fetch a single Firestore document and listen to real-time updates.
 * @param collectionPath The path to the Firestore collection containing the document.
 * @param docId The ID of the document to fetch (or null to skip fetching).
 * @returns An object containing the document data, loading state, and any error encountered.
 * @example
 * const { data, loading, error } = useFirestoreDocument('alerts', 'alert-123');
 */
export function useFirestoreDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string | null
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isFirst = useRef(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!docId) {
      setLoading(false)
      return
    }

    isFirst.current = true
    const ref = doc(db, collectionPath, docId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const newData = snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null
        
        if (isFirst.current) {
          isFirst.current = false
          setData(newData)
          setLoading(false)
        } else {
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            setData(newData)
            setLoading(false)
          }, 1000)
        }
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => {
      unsub()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [collectionPath, docId])

  return { data, loading, error }
}

export { orderBy, where }
