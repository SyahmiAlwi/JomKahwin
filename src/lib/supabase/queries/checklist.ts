import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type ChecklistTask = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  event_id: string | null;
  title: string;
  phase: string;
  completed: boolean;
  created_at: string;
};

// ── Queries ──────────────────────────────────────────────────

export function useChecklistTasks() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["checklist_tasks", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("checklist_tasks")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChecklistTask[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddChecklistTask() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      title,
      phase,
    }: {
      title: string;
      phase: string;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("checklist_tasks")
        .insert({ user_id: user.id, wedding_id: weddingId, title, phase, completed: false })
        .select()
        .single();
      if (error) throw error;
      return data as ChecklistTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist_tasks", weddingId] });
    },
  });
}

export function useToggleChecklistTask() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("checklist_tasks")
        .update({ completed })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ChecklistTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist_tasks", weddingId] });
    },
  });
}

export function useDeleteChecklistTask() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("checklist_tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist_tasks", weddingId] });
    },
  });
}
