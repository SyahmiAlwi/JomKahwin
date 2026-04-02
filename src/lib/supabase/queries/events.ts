import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type DbEvent = {
  id: string;
  user_id: string;
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
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbEvent[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: NewEvent) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert({ ...event, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as DbEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
