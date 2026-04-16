import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { auth } from './firebase'
import AttendeeView from './components/AttendeeView'
import './index.css'

const StaffDashboard = lazy(() => import('./components/StaffDashboard'))

function App() {
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Anonymous sign-in for attendees
    signInAnonymously(auth)
      .then(() => setAuthReady(true))
      .catch((err) => {
        console.warn('Anonymous sign-in failed (running offline or no project):', err.code)
        setAuthReady(true) // still show the app
      })
  }, [])

  if (!authReady) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', flexDirection: 'column', gap: '1rem'
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="14" fill="#6366f1"/>
          <path d="M10 38 L24 10 L38 38 Z" fill="white" opacity="0.9"/>
          <path d="M16 28 L32 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          Loading StadiumSense…
        </p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AttendeeView />} />
        <Route path="/staff" element={
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Dashboard...</div>}>
            <StaffDashboard />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
