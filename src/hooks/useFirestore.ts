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

// ─── useFirestoreCollection ────────────────────────────────────────────────────

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
