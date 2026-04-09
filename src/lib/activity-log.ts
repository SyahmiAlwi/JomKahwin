import { SupabaseClient } from "@supabase/supabase-js";

interface LogActivityParams {
  supabase: SupabaseClient;
  weddingId: string;
  userId: string;
  action: string;
  entityType: string;
  entityName?: string | null;
}

/**
 * Inserts one row into activity_log for the given wedding.
 * Failures are silently swallowed so they never block the primary mutation.
 */
export async function logActivity({
  supabase,
  weddingId,
  userId,
  action,
  entityType,
  entityName,
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from("activity_log").insert({
      wedding_id: weddingId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_name: entityName ?? null,
    });
    if (error) {
      console.warn("[logActivity] insert error:", error.message);
    }
  } catch (err) {
    console.warn("[logActivity] unexpected error:", err);
  }
}

export type ActivityLogRow = {
  id: string;
  wedding_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_name: string | null;
  created_at: string;
};

/** Returns a human-readable relative time string in Malay. */
export function timeAgoMS(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru sahaja";
  if (mins < 60) return `${mins} minit lepas`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lepas`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lepas`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lepas`;
  const months = Math.floor(days / 30);
  return `${months} bulan lepas`;
}
