import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type DbEvent = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  name: string;
  date: string | null;
  type: string | null;
  created_at: string;
};

export type NewEvent = {
  name: string;
  date: string;
  type: string;
};

// ── Queries ──────────────────────────────────────────────────

export function useEvents() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["events", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbEvent[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddEvent() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (event: NewEvent) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert({ ...event, user_id: user.id, wedding_id: weddingId })
        .select()
        .single();
      if (error) throw error;
      return data as DbEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", weddingId] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (updates: {
      id: string;
      name?: string;
      date?: string;
      type?: string;
    }) => {
      const supabase = createClient();
      const { id, ...rest } = updates;
      const { data, error } = await supabase
        .from("events")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as DbEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", weddingId] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", weddingId] });
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────

/** Returns days remaining until the given ISO date string (negative if past). */
export function calcDaysLeft(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Formats an ISO date string to Malay-friendly display (e.g. "15 Mac 2025"). */
export function formatDateMY(dateStr: string): string {
  const bulan = [
    "Jan", "Feb", "Mac", "Apr", "Mei", "Jun",
    "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis",
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formats an ISO date string to English (UK) display (e.g. "15 Mar 2025"). */
export function formatDateEN(dateStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formats a date based on the caller's current language (ms or en). */
export function formatDate(dateStr: string, lang: "ms" | "en"): string {
  return lang === "en" ? formatDateEN(dateStr) : formatDateMY(dateStr);
}
