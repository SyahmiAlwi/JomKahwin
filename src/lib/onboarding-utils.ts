import { Goal } from "@/lib/contexts/onboarding-context";

// Onboarding data — labels/descriptions are stored as translation keys
// (see `src/lib/i18n/translations.ts`). Call `t(key)` at display time.

export const GOAL_OPTIONS: Array<{
  id: Goal;
  emoji: string;
  labelKey: string;
  descKey: string;
}> = [
  { id: "bajet",    emoji: "💰", labelKey: "onb.goal.bajet.label",    descKey: "onb.goal.bajet.desc" },
  { id: "jemputan", emoji: "👥", labelKey: "onb.goal.jemputan.label", descKey: "onb.goal.jemputan.desc" },
  { id: "tarikh",   emoji: "⏰", labelKey: "onb.goal.tarikh.label",   descKey: "onb.goal.tarikh.desc" },
  { id: "tugasan",  emoji: "✅", labelKey: "onb.goal.tugasan.label",  descKey: "onb.goal.tugasan.desc" },
  { id: "vendor",   emoji: "🎨", labelKey: "onb.goal.vendor.label",   descKey: "onb.goal.vendor.desc" },
];

/** Indexed pain-point keys per goal (0..4). Resolve via `t()`. */
export const PAIN_POINT_KEYS_BY_GOAL: Record<Goal, string[]> = {
  bajet:    [0, 1, 2, 3, 4].map((i) => `onb.pain.bajet.${i}`),
  jemputan: [0, 1, 2, 3, 4].map((i) => `onb.pain.jemputan.${i}`),
  tarikh:   [0, 1, 2, 3, 4].map((i) => `onb.pain.tarikh.${i}`),
  tugasan:  [0, 1, 2, 3, 4].map((i) => `onb.pain.tugasan.${i}`),
  vendor:   [0, 1, 2, 3, 4].map((i) => `onb.pain.vendor.${i}`),
};

/** Indexed pain/solution pairs per goal (0..2). Resolve each side via `t()`. */
export const SOLUTION_KEY_MAPPING: Record<
  Goal,
  Array<{ painKey: string; solutionKey: string }>
> = {
  bajet:    [0, 1, 2].map((i) => ({ painKey: `onb.sol.bajet.${i}.pain`,    solutionKey: `onb.sol.bajet.${i}.sol` })),
  jemputan: [0, 1, 2].map((i) => ({ painKey: `onb.sol.jemputan.${i}.pain`, solutionKey: `onb.sol.jemputan.${i}.sol` })),
  tarikh:   [0, 1, 2].map((i) => ({ painKey: `onb.sol.tarikh.${i}.pain`,   solutionKey: `onb.sol.tarikh.${i}.sol` })),
  tugasan:  [0, 1, 2].map((i) => ({ painKey: `onb.sol.tugasan.${i}.pain`,  solutionKey: `onb.sol.tugasan.${i}.sol` })),
  vendor:   [0, 1, 2].map((i) => ({ painKey: `onb.sol.vendor.${i}.pain`,   solutionKey: `onb.sol.vendor.${i}.sol` })),
};

export const PREFERENCE_OPTIONS: Array<{
  id: string;
  emoji: string;
  labelKey: string;
  descKey: string;
}> = [
  { id: "bajet",     emoji: "💰", labelKey: "onb.pref.bajet.label",     descKey: "onb.pref.bajet.desc" },
  { id: "jemputan",  emoji: "👥", labelKey: "onb.pref.jemputan.label",  descKey: "onb.pref.jemputan.desc" },
  { id: "majlis",    emoji: "📅", labelKey: "onb.pref.majlis.label",    descKey: "onb.pref.majlis.desc" },
  { id: "checklist", emoji: "✅", labelKey: "onb.pref.checklist.label", descKey: "onb.pref.checklist.desc" },
  { id: "vendor",    emoji: "👔", labelKey: "onb.pref.vendor.label",    descKey: "onb.pref.vendor.desc" },
  { id: "reminder",  emoji: "⏰", labelKey: "onb.pref.reminder.label",  descKey: "onb.pref.reminder.desc" },
];

export const BUDGET_CATEGORIES: Array<{ id: string; emoji: string; labelKey: string }> = [
  { id: "venue",         emoji: "💍", labelKey: "onb.bcat.venue" },
  { id: "catering",      emoji: "🍽️", labelKey: "onb.bcat.catering" },
  { id: "hiasan",        emoji: "🌸", labelKey: "onb.bcat.hiasan" },
  { id: "bridal",        emoji: "💅", labelKey: "onb.bcat.bridal" },
  { id: "photo",         emoji: "📷", labelKey: "onb.bcat.photo" },
  { id: "entertainment", emoji: "🎵", labelKey: "onb.bcat.entertainment" },
  { id: "transport",     emoji: "🚗", labelKey: "onb.bcat.transport" },
  { id: "printing",      emoji: "💌", labelKey: "onb.bcat.printing" },
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

/** Translation-key helper for goal labels (e.g. `onb.goal.bajet.label`). */
export const GOAL_LABEL_KEYS: Record<Goal, string> = {
  bajet: "onb.goal.bajet.label",
  jemputan: "onb.goal.jemputan.label",
  tarikh: "onb.goal.tarikh.label",
  tugasan: "onb.goal.tugasan.label",
  vendor: "onb.goal.vendor.label",
};

/** Translation-key helper for goal headings used on screen-3 etc. */
export const GOAL_HEADING_KEYS: Record<Goal, string> = {
  bajet: "onb.goalHeading.bajet",
  jemputan: "onb.goalHeading.jemputan",
  tarikh: "onb.goalHeading.tarikh",
  tugasan: "onb.goalHeading.tugasan",
  vendor: "onb.goalHeading.vendor",
};
