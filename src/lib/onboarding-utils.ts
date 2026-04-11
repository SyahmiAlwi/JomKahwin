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
    desc: "Quotation semua berterabur & merata, takut dah over budget!",
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
    desc: "Ramai events (nikah, tunang, resepsi), timeline padat weh!",
  },
  {
    id: "tugasan",
    emoji: "✅",
    label: "Checklist yang Banyak",
    desc: "To-do list berjela, tak tahu mula dari mana start",
  },
  {
    id: "vendor",
    emoji: "🎨",
    label: "Vendor & Supplier",
    desc: "Quotation semua berserabut, yang mana vendor dah book yang belum, keliru!",
  },
];

export const PAIN_POINTS_BY_GOAL: Record<Goal, string[]> = {
  bajet: [
    "Quotes semua merata kat WhatsApp, email, notes; Siapa quote berapa? Asyik lupa je",
    "Tak tahu total overall, takut dah melebihi bajet kita tanpa sedar",
    "Pasangan tak tahu status terkini, nanti gaduh pasal siapa supposed to track",
    "Setiap quotation baru datang, stress la urus kewangan betul-betul!",
    "Vendor lupa commit atau quotes berubah tiba-tiba, nauzubillah-hi-minzalik!",
  ],
  jemputan: [
    "Guest list dah bercampur-aduk, repeat sending invite, susah nak record semua!",
    "Orang reply via WhatsApp, SMS, Telegram; semua caca-marba, mana mana satu nak check?",
    "Takut final count salah, lepas tu catering headcountprepare lebih/kurang, sia-sia je",
    "Pasangan punya list jemputan lain berlainan, tak terurus. Susah la nak rujuk!",
    "Nak tahu siapa confirm siapa tak confirm? Drain energy & time je wei!",
  ],
  tarikh: [
    "Banyak events (nikah /tunang / resepsi), mana event mana date, keliru gila",
    "Timeline padat, nampak chill tapi sebenarnya otak berserabut",
    "Keluarga semua ada pendapat lain, tak align dan jadi masalah",
    "Takut delay atau vendor book orang lain, panic + anxiety weh!",
    "RSVP confirmation, siapa datang, siapa takdatang, tak clear!",
  ],
  tugasan: [
    "To-do list berjela. Mana satu nak prioritize, semua urgent je nampak",
    "Banyak orang involved tapi siapa supposed to do apa? Tak clear",
    "Deadline semua dekat-dekat, ish serabut lah!",
    "Progress tak jelas, apa dah done apa belum, entahla weh",
    "Lupa details penting: fitting date, catering tasting, semua terlepas pandang!",
  ],
  vendor: [
    "Quotes semua berterabur, nak compare vendor mana lebih bagus? Nightmare!",
    "Tak tahu siapa nak call next, supplier list merata kat whatsapp, email, chat, semua tempat lah!",
    "Asyik lupa follow-up dan deadline dengan vendors",
    "Pasangan tak tahu yang mana vendor dah confirm yang belum, risau bergaduh nanti!",
    "Updated vendor list mana, payment status apa, tak keep track je. Stres!",
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
      pain: "Quotes scattered everywhere, taktau total dan tak track",
      solution: "All costs dalam satu dashboard. See total & remaining budget in a flash.",
    },
    {
      pain: "Pasangan tak tahu status",
      solution: "Partner sees same info real-time. Tak perlu argue siapa responsible.",
    },
    {
      pain: "Setiap quote buat pening kepala",
      solution: "Category tracking yang simple. Quote masuk, automatic calculate vs budget.",
    },
  ],
  jemputan: [
    {
      pain: "Guest list ada berbagai versi, tak clear",
      solution: "One list, shared between you & partner. No duplicates, tak confuse lagi.",
    },
    {
      pain: "Replies scattered di WhatsApp, SMS, Telegram",
      solution: "All RSVPs in one app. See confirm, pending, dalam satu tempat.",
    },
    {
      pain: "Takut count salah, catering berlebihan",
      solution: "Auto-count pax by group. Share final headcount to catering dalam sekali jalan.",
    },
  ],
  tarikh: [
    {
      pain: "Events berlambak, tarikh semua bercelaru",
      solution:
        "Timeline view: rujuk semua timing events (Nikah, Tunang, Resepsi) & countdowns together.",
    },
    {
      pain: "Timeline padat sangat, keluarga bercanggah",
      solution: "Share event dates dengan family. Everyone sees same timeline.",
    },
    {
      pain: "Takut delay atau vendor book orang lain",
      solution: "Automatic reminders & checklists. Never miss deadlines.",
    },
  ],
  tugasan: [
    {
      pain: "To-do list banyak, mana satu nak prioritize?",
      solution: "Checklist organized by event. See urgent vs nice-to-have tasks.",
    },
    {
      pain: "Banyak orang, siapa buat apa? Tak clear",
      solution: "Assign tasks in app. Partner knows who's responsible.",
    },
    {
      pain: "Lupa deadlines & details",
      solution: "Reminders on every task. Never forget fitting date, catering tasting, etc.",
    },
  ],
  vendor: [
    {
      pain: "Quotes scattered? Comparing them is hell",
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
    desc: "Get alerts for deadlines, event prep, takkan lupa apa-apa dah",
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
