import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type DbGuest = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  event_id: string | null;
  name: string;
  relation: string | null;
  phone: string | null;
  group_name: string | null;
  group_color: string | null;
  pax: number;
  rsvp_status: "hadir" | "tidak" | "pending";
  created_at: string;
};

// ── Queries ──────────────────────────────────────────────────

export function useGuests() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["guests", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbGuest[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddGuest() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (guest: {
      name: string;
      relation: string;
      phone: string;
      group_name: string;
      group_color: string;
      pax: number;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("guests")
        .insert({ ...guest, user_id: user.id, wedding_id: weddingId, rsvp_status: "pending" })
        .select()
        .single();
      if (error) throw error;
      return data as DbGuest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", weddingId] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (updates: {
      id: string;
      name?: string;
      relation?: string;
      phone?: string;
      group_name?: string;
      group_color?: string;
      pax?: number;
      rsvp_status?: "hadir" | "tidak" | "pending";
    }) => {
      const supabase = createClient();
      const { id, ...rest } = updates;
      const { data, error } = await supabase
        .from("guests")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as DbGuest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", weddingId] });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("guests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", weddingId] });
    },
  });
}

/** Bulk-rename / recolor a group across all guests that belong to it. */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      oldName,
      newName,
      newColor,
    }: {
      oldName: string;
      newName: string;
      newColor: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("guests")
        .update({ group_name: newName, group_color: newColor })
        .eq("group_name", oldName)
        .eq("wedding_id", weddingId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", weddingId] });
    },
  });
}

/** Move all guests in one group to a different group (used when deleting a group). */
export function useMoveGuests() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      fromGroup,
      toGroup,
      toColor,
    }: {
      fromGroup: string;
      toGroup: string;
      toColor: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("guests")
        .update({ group_name: toGroup, group_color: toColor })
        .eq("group_name", fromGroup)
        .eq("wedding_id", weddingId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", weddingId] });
    },
  });
}
