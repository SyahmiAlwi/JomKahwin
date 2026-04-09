import { Goal } from "@/lib/contexts/onboarding-context";

export const GOAL_OPTIONS: Array<{
  id: Goal;
  emoji: string;
  label: string;
  desc: string;
}> = [
  {
    id: "bajet",
    emoji: "💰",
    label: "Bajet & Kos",
    desc: "Quotes semua melompat-lompat, takut dah over budget",
  },
  {
    id: "jemputan",
    emoji: "👥",
    label: "Senarai & RSVP",
    desc: "Guest list banyak, siapa confirm siapa pending, pening nak follow-up",
  },
  {
    id: "tarikh",
    emoji: "⏰",
    label: "Tarikh & Timeline",
    desc: "Ramai events (nikah, tunang, resepsi), timeline melampau ketat",
  },
  {
    id: "tugasan",
    emoji: "✅",
    label: "Checklist yang Banyak",
    desc: "To-do list endless, tak tahu mula dari mana nak kick off",
  },
  {
    id: "vendor",
    emoji: "🎨",
    label: "Vendor & Supplier",
    desc: "Quotes semua scatter, yang mana vendor dah book yang belum, keliru",
  },
];

export const PAIN_POINTS_BY_GOAL: Record<Goal, string[]> = {
  bajet: [
    "Quotes semua scatter — WhatsApp, email, notes — siapa quote berapa lupa je",
    "Tak tahu total overall, takut dah melebihi bajet tanpa sedar",
    "Pasangan tak tahu status terkini — gaduh pasal siapa supposed to track",
    "Setiap quote baru datang, stress pamp (jantung berdebar)",
    "Vendor lupa commit atau quotes berubah tiba-tiba — keliru betul",
  ],
  jemputan: [
    "Guest list melampau campur-aduk — repeat sending invite, follow-up berapa kali pun",
    "Orang reply via WhatsApp, SMS, Telegram — semua scatter, mana mana satu nak check",
    "Takut final count salah, lepas tu catering prepare lebih/kurang, sia-sia je",
    "Pasangan punya list lain lagi — duplikasi, nak scrap which copy?",
    "Nak tahu siapa confirm siapa tak confirm — effort sangat besar",
  ],
  tarikh: [
    "Ramai events (nikah, tunang, resepsi) — mana event mana date, keliru gila",
    "Timeline sempit, nampak chill tapi sebenarnya stress",
    "Keluarga semua ada pendapat lain — tak align, buat hal je",
    "Takut delay atau vendor book orang lain — panic",
    "Event rundown complicated — siapa start mula jam berapa tak tahu",
  ],
  tugasan: [
    "To-do list endless — yang mana nak prioritize, semua urgent je nampak",
    "Banyak orang involved — siapa supposed to do apa, tak clear",
    "Deadline all hampir-hampir — panik gila",
    "Progress tak nampak — dah done apa belum, tak tahu je",
    "Lupa details — fitting date, catering tasting, semua lepas",
  ],
  vendor: [
    "Quotes semua scatter — comparing siapa dengan siapa is nightmare",
    "Tak tahu siapa nak call next — supplier list di phone, email, chat, semua tempat",
    "Easy lupa follow-up dan deadline dengan vendors",
    "Pasangan tak tahu yang mana vendor dah confirm yang belum",
    "Updated contracts mana, payment status apa — lost je",
  ],
};

export const SOLUTION_MAPPING: Record<
  Goal,
  Array<{
    pain: string;
    solution: string;
  }>
> = {
  bajet: [
    {
      pain: "Quotes scatter, tak tahu total",
      solution: "All costs dalam satu dashboard. See total & remaining budget in a flash.",
    },
    {
      pain: "Pasangan tak tahu status",
      solution: "Partner sees same info real-time. Tak perlu argue siapa responsible.",
    },
    {
      pain: "Setiap quote buat jantung berdebar",
      solution: "Category tracking yang simple. Quote masuk, automatic calculate vs budget.",
    },
  ],
  jemputan: [
    {
      pain: "Guest list melampau campur",
      solution: "One list, shared between you & partner. No duplikates, no confusion lagi.",
    },
    {
      pain: "Replies scatter di WhatsApp, SMS, Telegram",
      solution: "All RSVPs in one app. See confirm, pending, dalam satu tempat.",
    },
    {
      pain: "Takut count salah, catering berlebihan",
      solution: "Auto-count pax by group. Share final headcount to catering dalam sekali jalan.",
    },
  ],
  tarikh: [
    {
      pain: "Ramai events, dates semua keliru",
      solution:
        "Timeline view — see all events (Nikah, Tunang, Resepsi) & countdowns together.",
    },
    {
      pain: "Timeline tight, keluarga disagreements",
      solution: "Share event dates dengan family. Everyone sees same timeline.",
    },
    {
      pain: "Takut delay atau vendor book orang lain",
      solution: "Automatic reminders & checklists. Never miss deadlines.",
    },
  ],
  tugasan: [
    {
      pain: "To-do list endless, apa nak prioritize",
      solution: "Checklist organized by event. See urgent vs nice-to-have.",
    },
    {
      pain: "Banyak orang, siapa do apa tak clear",
      solution: "Assign tasks in app. Partner knows who's responsible.",
    },
    {
      pain: "Forget deadlines & details",
      solution: "Reminders on every task. Never forget fitting date, catering tasting, etc.",
    },
  ],
  vendor: [
    {
      pain: "Quotes scatter, comparing is hell",
      solution: "All vendor info & quotes dalam satu tempat. Easy compare.",
    },
    {
      pain: "Tak tahu siapa nak call",
      solution: "Quick dial atau WhatsApp vendors directly from app.",
    },
    {
      pain: "Lupa follow-up & payment status",
      solution: "Track vendor deadlines & contracts dalam satu list.",
    },
  ],
};

export const PREFERENCE_OPTIONS = [
  {
    id: "bajet",
    emoji: "💰",
    label: "Bajet & Perbelanjaan",
    desc: "Track costs, compare quotes, tengok spending vs budget in real-time",
  },
  {
    id: "jemputan",
    emoji: "👥",
    label: "Senarai & RSVP",
    desc: "Manage guest list, collect confirm/not confirm, auto-count pax",
  },
  {
    id: "majlis",
    emoji: "📅",
    label: "Majlis & Jadual",
    desc: "Event countdowns, timeline, rundown dalam satu tempat",
  },
  {
    id: "checklist",
    emoji: "✅",
    label: "Checklist",
    desc: "To-do list, track progress, assign tasks to family/partner",
  },
  {
    id: "vendor",
    emoji: "👔",
    label: "Vendor & Supplier",
    desc: "Track vendor contacts, quotes, payments, deadlines",
  },
  {
    id: "reminder",
    emoji: "⏰",
    label: "Reminders & Timeline",
    desc: "Get alerts for deadlines, event prep, never lupa apa-apa",
  },
];

export const BUDGET_CATEGORIES = [
  { id: "venue", emoji: "💍", label: "Venue / Lokasi" },
  { id: "catering", emoji: "🍽️", label: "Catering / Makanan" },
  { id: "hiasan", emoji: "🌸", label: "Hiasan / Dekorasi" },
  { id: "bridal", emoji: "💅", label: "Bridal / Makeup" },
  { id: "photo", emoji: "📷", label: "Photography" },
  { id: "entertainment", emoji: "🎵", label: "Entertainment / DJ" },
  { id: "transport", emoji: "🚗", label: "Transport / Kereta" },
  { id: "printing", emoji: "💌", label: "Printing / Undangan" },
];

export const DEFAULT_BUDGET_AMOUNTS: Record<string, number> = {
  venue: 15000,
  catering: 8000,
  hiasan: 3000,
  bridal: 2000,
  photo: 2000,
  entertainment: 1500,
  transport: 1000,
  printing: 500,
};

export const GOAL_LABELS: Record<Goal, string> = {
  bajet: "Bajet & Kos",
  jemputan: "Senarai & RSVP",
  tarikh: "Tarikh & Timeline",
  tugasan: "Checklist yang Banyak",
  vendor: "Vendor & Supplier",
};

export const GOAL_HEADINGS_FOR_PAIN_INTRO: Record<Goal, string> = {
  bajet: "Okay, dalam hal bajet & kos...",
  jemputan: "Alright, dalam hal senarai & RSVP...",
  tarikh: "Got it, dalam hal tarikh & timeline...",
  tugasan: "Sure, dalam hal checklist...",
  vendor: "Makes sense, dalam hal vendor & supplier...",
};
