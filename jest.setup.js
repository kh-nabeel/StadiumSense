// Jest global setup — polyfill import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_FIREBASE_API_KEY: 'test-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_GOOGLE_MAPS_API_KEY: '',
        VITE_GEMINI_API_KEY: '',
        DEV: false,
        PROD: false,
        MODE: 'test',
      },
    },
  },
  writable: true,
})
