const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBQk3U-U6XaSpRNzJ9Ha7MkKC3WhwHocvc",
  authDomain: "stadiumsense-37455.firebaseapp.com",
  projectId: "stadiumsense-37455",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function seed() {

  // ── SECTIONS ──────────────────────────────────────────
  const sections = [
    {
      id: "section_north_upper",
      name: "Valiyathura North Upper Stand",
      gate: "Gate 1 — Jawaharlal Nehru Road entrance",
      capacity: 9200,
      current: 8740,
      occupancyPct: 95,
      waitMin: 14,
      status: "critical",
      zone: "A",
      level: "upper",
      lat: 9.9980,
      lng: 76.3011,
    },
    {
      id: "section_south_upper",
      name: "Ernakulam South Upper Stand",
      gate: "Gate 2 — Marine Drive side",
      capacity: 9200,
      current: 7180,
      occupancyPct: 78,
      waitMin: 6,
      status: "busy",
      zone: "B",
      level: "upper",
      lat: 9.9964,
      lng: 76.3011,
    },
    {
      id: "section_east_lower",
      name: "Mattancherry East Lower Stand",
      gate: "Gate 3 — Kathrikadavu Road",
      capacity: 7800,
      current: 4060,
      occupancyPct: 52,
      waitMin: 0,
      status: "clear",
      zone: "C",
      level: "lower",
      lat: 9.9972,
      lng: 76.3019,
    },
    {
      id: "section_west_lower",
      name: "Fort Kochi West Lower Stand",
      gate: "Gate 4 — Sahodaran Ayyappan Road",
      capacity: 7800,
      current: 6550,
      occupancyPct: 84,
      waitMin: 8,
      status: "busy",
      zone: "D",
      level: "lower",
      lat: 9.9972,
      lng: 76.3003,
    },
    {
      id: "section_vip_pavilion",
      name: "Bolgatty VIP Pavilion",
      gate: "Gate 5 — VIP entrance, Palarivattom",
      capacity: 3200,
      current: 2270,
      occupancyPct: 71,
      waitMin: 2,
      status: "normal",
      zone: "VIP",
      level: "pavilion",
      lat: 9.9972,
      lng: 76.2995,
    },
    {
      id: "section_ultras_north",
      name: "Yellow Wall — Manjappada Ultras Block",
      gate: "Gate 6 — North Terrace",
      capacity: 8400,
      current: 8230,
      occupancyPct: 98,
      waitMin: 18,
      status: "critical",
      zone: "A",
      level: "terrace",
      lat: 9.9984,
      lng: 76.3011,
    },
  ];

  for (const s of sections) {
    const { id, ...data } = s;
    await setDoc(doc(db, "sections", id), data);
    console.log("Added section:", s.name);
  }

  // ── CONCESSIONS ───────────────────────────────────────
  const concessions = [
    {
      id: "stall_kerala_meals",
      name: "Sadhya Express",
      location: "Concourse A, near Gate 1",
      items: ["Kerala meals", "Puttu kadala", "Idiyappam", "Sambar rice"],
      waitMin: 22,
      queueLength: 41,
      priceRange: "Rs.80 - Rs.160",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: true,
    },
    {
      id: "stall_snacks_south",
      name: "Thattu Kada Corner",
      location: "Concourse B, Gate 2 corridor",
      items: ["Kappa fish curry", "Banana fritters", "Uzhunnu vada", "Chai"],
      waitMin: 3,
      queueLength: 6,
      priceRange: "Rs.20 - Rs.120",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: false,
    },
    {
      id: "stall_biryani_east",
      name: "Kozhikode Dum Biryani",
      location: "Concourse C, Gate 3 side",
      items: ["Chicken biryani", "Mutton biryani", "Raita", "Papad"],
      waitMin: 11,
      queueLength: 22,
      priceRange: "Rs.180 - Rs.260",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: true,
    },
    {
      id: "stall_drinks_west",
      name: "Malabar Juice and Drinks",
      location: "Concourse D, Gate 4 corridor",
      items: ["Tender coconut", "Sugarcane juice", "Buttermilk", "Lime soda"],
      waitMin: 1,
      queueLength: 3,
      priceRange: "Rs.30 - Rs.80",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: false,
    },
    {
      id: "stall_vip_lounge",
      name: "Backwaters VIP Lounge",
      location: "Pavilion Level, Gate 5",
      items: ["Karimeen pollichathu", "Prawn curry", "Fish fry", "Mocktails"],
      waitMin: 2,
      queueLength: 4,
      priceRange: "Rs.350 - Rs.900",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: true,
    },
    {
      id: "stall_fast_lane",
      name: "Pre-Order Fast Lane",
      location: "All concourses — dedicated pickup counters",
      items: ["Pre-ordered items only — all menus available"],
      waitMin: 0,
      queueLength: 0,
      priceRange: "Varies",
      isOpen: true,
      acceptsUPI: true,
      preOrderEnabled: true,
    },
  ];

  for (const c of concessions) {
    const { id, ...data } = c;
    await setDoc(doc(db, "concessions", id), data);
    console.log("Added concession:", c.name);
  }

  // ── MATCH EVENTS ──────────────────────────────────────
  const events = [
    {
      id: "event_gates_open",
      label: "Gates Open",
      time: "18:00",
      status: "done",
      description:
        "All 6 gates open. Security screening active. Shuttle buses from Ernakulam South station running every 15 minutes.",
    },
    {
      id: "event_prematch",
      label: "Pre-match Entertainment",
      time: "18:30",
      status: "done",
      description:
        "Cultural performance on pitch. Manjappada fan group chants begin in North Terrace.",
    },
    {
      id: "event_kickoff",
      label: "Kick-off — ISL Match",
      time: "19:00",
      status: "active",
      description:
        "Kerala Blasters FC vs Chennaiyin FC. Referee: Santosh Kumar.",
    },
    {
      id: "event_halftime",
      label: "Half-time Break",
      time: "19:45",
      status: "upcoming",
      description:
        "15-minute break. Expect 18,000+ simultaneous concourse movements. Staff deployed at junctions J3, J7, J11.",
    },
    {
      id: "event_second_half",
      label: "Second Half",
      time: "20:00",
      status: "upcoming",
      description:
        "Play resumes. All concession counters remain open until 21:00.",
    },
    {
      id: "event_fulltime",
      label: "Full Time and Exit",
      time: "21:00",
      status: "upcoming",
      description:
        "Staggered exit: Zone A first, then B, C, D. KSRTC buses from Gate 2. Kochi Metro last service at 22:30.",
    },
  ];

  for (const e of events) {
    const { id, ...data } = e;
    await setDoc(doc(db, "matchEvents", id), data);
    console.log("Added event:", e.label);
  }

  // ── ALERTS ────────────────────────────────────────────
  const alerts = [
    {
      id: "alert_001",
      type: "crowd_redirect",
      zone: "all",
      active: true,
      message:
        "Gate 6 (Yellow Wall) is at 98% capacity. All new arrivals are being redirected to Gate 3 — East Lower Stand has plenty of open space.",
      timestamp: new Date("2024-01-20T18:42:00+05:30"),
    },
    {
      id: "alert_002",
      type: "queue_advisory",
      zone: "concourse_A",
      active: true,
      message:
        "Sadhya Express stall has a 22 minute wait. Use the Pre-Order Fast Lane or try Malabar Juice counter which has no queue right now.",
      timestamp: new Date("2024-01-20T18:39:00+05:30"),
    },
    {
      id: "alert_003",
      type: "transport",
      zone: "all",
      active: true,
      message:
        "KSRTC special buses from Ernakulam South Bus Stop 14 running every 10 minutes after the match. Kochi Metro last service at 22:30.",
      timestamp: new Date("2024-01-20T18:35:00+05:30"),
    },
    {
      id: "alert_004",
      type: "weather",
      zone: "all",
      active: true,
      message:
        "Heavy rain expected after 21:30 as per IMD alert. Please exit via the covered walkway at Gate 2. Ponchos available at Gate 5 info desk for Rs.50.",
      timestamp: new Date("2024-01-20T18:20:00+05:30"),
    },
    {
      id: "alert_005",
      type: "info",
      zone: "all",
      active: true,
      message:
        "Lost and Found counter is located at the Gate 1 information booth. For assistance call 0484-236-1234.",
      timestamp: new Date("2024-01-20T18:00:00+05:30"),
    },
  ];

  for (const a of alerts) {
    const { id, ...data } = a;
    await setDoc(doc(db, "alerts", id), data);
    console.log("Added alert:", a.id);
  }

  // ── STAFF ─────────────────────────────────────────────
  const staff = [
    {
      id: "staff_rajesh",
      name: "Rajesh Nair",
      role: "gate_manager",
      zone: "A — North Upper",
      gate: "Gate 1",
      phone: "+91 94470 11234",
    },
    {
      id: "staff_priya",
      name: "Priya Krishnan",
      role: "crowd_control",
      zone: "B — South Upper",
      gate: "Gate 2",
      phone: "+91 98950 22345",
    },
    {
      id: "staff_arjun",
      name: "Arjun Menon",
      role: "staff",
      zone: "all",
      gate: "Control Room",
      phone: "+91 70128 33456",
    },
    {
      id: "staff_lakshmi",
      name: "Lakshmi Thomas",
      role: "medical",
      zone: "C — East Lower",
      gate: "First Aid Post",
      phone: "+91 94461 44567",
    },
    {
      id: "staff_suresh",
      name: "Suresh Pillai",
      role: "crowd_control",
      zone: "D — West Lower",
      gate: "Gate 4",
      phone: "+91 99470 55678",
    },
    {
      id: "staff_deepa",
      name: "Deepa Varghese",
      role: "gate_manager",
      zone: "VIP",
      gate: "Gate 5",
      phone: "+91 94462 66789",
    },
  ];

  for (const s of staff) {
    const { id, ...data } = s;
    await setDoc(doc(db, "staff", id), data);
    console.log("Added staff:", s.name);
  }

  console.log("\nAll done! JN Stadium Kochi seed data loaded into Firestore.");
}

seed().catch(console.error);
