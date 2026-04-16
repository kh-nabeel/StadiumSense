# StadiumSense 🏟️

> Real-time stadium event experience platform — crowd density heatmap, gate navigation, concession pre-ordering, and AI crowd routing.

# ScreenShots 

<img width="1919" height="943" alt="attendee view" src="https://github.com/user-attachments/assets/9b056173-54cc-4e9f-bd98-525bf55abc54" />
> Attendee View


<img width="1919" height="943" alt="staff view" src="https://github.com/user-attachments/assets/5f7cada7-0cd4-4d93-b6ed-91b6c709fac6" />
> Staff View


## Project Overview

### Chosen Vertical
**Live Event & Venue Management (Sports/Entertainment)**  
Large-scale events often suffer from acute crowd bottlenecks, frustratingly long concession lines, and inefficient routing. We chose this vertical because providing real-time visibility solves immediate safety and convenience problems for both attendees and venue staff.

### Approach and Logic
Our approach is to balance the load of the stadium by providing a dual-experience platform:
1. **Mobile-First Attendee App:** Focuses on user convenience. By showing attendees real-time heatmap data, directing them to the least crowded gates, and displaying live wait times for food, we naturally distribute foot traffic across the venue.
2. **Desktop Staff Dashboard:** Aggregates venue-wide occupancy metrics, issues broadcast alerts (e.g., "Gate C closed"), and leverages AI to suggest proactive crowd-control decisions.

### How the Solution Works
- **Real-Time Data Sync:** The application is built on React/TypeScript with a Firebase Firestore backend. Every change in occupancy or queue times is pushed instantly to clients via real-time listeners.
- **Mapping & Heatmaps:** We use the Google Maps JavaScript API with a visualization layer to render dynamic density heatmaps based on live section capacities.
- **AI-Powered Routing:** The staff dashboard feeds live occupancy metrics into a Firebase Cloud Function connected to the **Gemini API**, which analyzes the data and generates safe, realistic crowd redistribution strategies.
- **Offline Reliability:** Built as a Progressive Web App (PWA) with service workers to ensure core UI functionality even if stadium cellular networks are congested.

### Assumptions Made
- **Hardware Integration:** We assume the venue has the underlying physical infrastructure (e.g., smart turnstiles, computer vision cameras, or ticket scanners) to continuously feed accurate, real-time occupancy numbers into our Firestore database.
- **Network Availability:** While PWA caching helps, real-time heatmaps and live food ordering assume attendees have reasonable access to stadium Wi-Fi or cellular data.
- **Order Integrity:** The current version uses anonymous authentication for friction-less food ordering. We assume a production deployment would integrate a payment gateway or ticket-linked accounts to prevent spam orders.

---

## Features

| Feature | Attendee App | Staff Dashboard |
|---|---|---|
| Live crowd density heatmap | ✅ | — |
| Nearest open gate navigation | ✅ | — |
| Concession queue wait times | ✅ | — |
| Food pre-order (Firestore) | ✅ | — |
| Push notifications (FCM) | ✅ | — |
| Offline support (service worker) | ✅ | — |
| Live occupancy table | — | ✅ |
| Broadcast alert system | — | ✅ |
| AI crowd routing (Gemini) | — | ✅ |
| Event timeline tracker | — | ✅ |

---

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (Spark/free tier is fine)
- Google Maps JavaScript API key
- Gemini API key

---

## Quick Start

### 1. Clone & Install

```bash
cd d:\stadiumsense
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally

```bash
npm run dev
```

- **Attendee View:** http://localhost:5173
- **Staff Dashboard:** http://localhost:5173/staff

> The app uses seed data by default — it works without a live Firebase project.

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `stadiumsense`
3. Enable **Google Analytics** (optional)

### 2. Enable Services

In your Firebase console:
- **Authentication** → Sign-in methods → enable **Anonymous**
- **Firestore** → Create database → production mode
- **Cloud Messaging** → Note your Server Key

### 3. Login & Init

```bash
firebase login
firebase use --add   # select your project
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Seed Initial Data

Run this one-time to populate Firestore with the 6 venue sections and 5 concession stands:

```bash
node scripts/seed.js
```

*(Or import manually via the Firebase console using the JSON in `src/data/seedData.ts`)*

---

## Google Maps Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable these APIs on your project:
   - **Maps JavaScript API**
   - **Directions API**
   - **Maps Visualization (Heatmap) library** (included with Maps JS API)
3. Create an API key → restrict to your domain
4. Add to `.env.local` as `VITE_GOOGLE_MAPS_API_KEY`

> **Note:** The app gracefully falls back to a zone-card grid if the Maps API key is missing or the quota is exceeded.

---

## Gemini AI Setup (Cloud Function)

The AI routing panel calls Gemini directly from the browser using your `VITE_GEMINI_API_KEY`.

For production, deploy via the Cloud Function instead (server-side key, more secure):

```bash
cd functions
npm install
firebase functions:config:set gemini.key="YOUR_GEMINI_KEY"
npm run deploy
```

Then update `AIRoutingPanel.tsx` to use `httpsCallable(functions, 'getCrowdRoutingSuggestion')` instead of the direct fetch.

---

## Project Structure

```
stadiumsense/
├── src/
│   ├── components/
│   │   ├── AttendeeView/       # Mobile-first attendee app
│   │   │   ├── index.tsx       # Tab navigation shell
│   │   │   ├── MapOverlay.tsx  # Google Maps heatmap
│   │   │   ├── GateNavigator.tsx
│   │   │   ├── QueueCard.tsx
│   │   │   ├── FoodOrderForm.tsx
│   │   │   └── AlertBanner.tsx
│   │   └── StaffDashboard/     # Desktop operations view
│   │       ├── index.tsx
│   │       ├── OccupancyTable.tsx
│   │       ├── BroadcastPanel.tsx
│   │       ├── AIRoutingPanel.tsx
│   │       └── EventTimeline.tsx
│   ├── hooks/
│   │   ├── useFirestore.ts     # Real-time Firestore listener
│   │   ├── useOccupancy.ts     # Derived occupancy metrics
│   │   └── useGeolocation.ts   # Browser geolocation
│   ├── data/
│   │   └── seedData.ts         # 6 sections, 5 stands, mock event
│   ├── types/
│   │   └── index.ts
│   └── __tests__/
│       ├── waitTimeCalculator.test.ts
│       └── occupancyUtils.test.ts
├── functions/
│   └── src/index.ts            # getCrowdRoutingSuggestion (Gemini)
├── public/
│   ├── sw.js                   # Service worker
│   └── manifest.json           # PWA manifest
├── cypress/
│   └── e2e/attendeeFlow.cy.ts  # Smoke tests
├── firestore.rules
├── firebase.json
└── .env.example
```

---

## Running Tests

```bash
# Unit tests (Jest)
npm test

# Cypress smoke tests (requires dev server running)
npm run dev &
npx cypress run
```

---

## Deployment

```bash
# Build the frontend
npm run build

# Deploy everything (hosting + functions + rules)
firebase deploy
```

---

## Firestore Data Model

### `sections/{sectionId}`
```json
{
  "id": "north-stand",
  "name": "North Stand",
  "capacity": 8500,
  "currentOccupancy": 7820,
  "gateNumber": "Gate A",
  "lat": 51.5557,
  "lng": -0.2797
}
```

### `concessions/{standId}`
```json
{
  "id": "c1",
  "name": "North Bites",
  "section": "North Stand",
  "waitTimeMinutes": 12,
  "isOpen": true,
  "menuItems": [...]
}
```

### `orders/{orderId}`
```json
{
  "userId": "uid",
  "standId": "c1",
  "standName": "North Bites",
  "items": [{ "menuItemId": "c1-1", "name": "Premium Burger", "price": 12.50, "quantity": 2 }],
  "totalPrice": 25.00,
  "status": "pending",
  "createdAt": 1718291234000
}
```

### `alerts/{alertId}`
```json
{
  "title": "Gate C temporarily closed",
  "message": "Please use Gate D. Staff are present to assist.",
  "severity": "warning",
  "targetZone": "East Stand",
  "createdAt": 1718291234000,
  "expiresAt": 1718293034000
}
```

---

## Security

- **Firestore rules:** Attendees are anonymous, read-only on `sections`, `concessions`, `alerts`. Staff (custom claim `role: "staff"`) have write access.
- **API keys:** All keys are in `.env.local` (gitignored). Use `.env.example` as the template.
- **Input validation:** All form inputs have `maxLength` constraints and are validated before Firestore writes.
- **Gemini key:** For production, move `VITE_GEMINI_API_KEY` server-side via Cloud Functions to avoid client exposure.

---

## Accessibility

- All interactive elements have `aria-label` attributes
- Tab navigation uses `aria-current="page"`
- Progress bars use `role="progressbar"` with `aria-valuenow/min/max`
- Live regions use `aria-live="assertive"` for alerts
- Color contrast ratios meet WCAG 2.1 AA (≥ 4.5:1)
- Keyboard navigable throughout

---

## License

MIT
