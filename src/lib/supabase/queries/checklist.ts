import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";
import { CHECKLIST_TEMPLATE } from "@/lib/data/checklist-template";
import { CHECKLIST_TEMPLATE_EN } from "@/lib/data/checklist-template-en";
import type { LangCode } from "@/lib/i18n/translations";

// ── Types ─────────────────────────────────────────────────────

export type ChecklistStatus = "not_yet" | "in_progress" | "settle" | "kiv";

export type ChecklistTask = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  event_id: string | null;
  title: string;
  phase: string;
  // Legacy boolean — kept for backward compat; use `status` as source of truth
  completed: boolean;
  // New fields (migration 004)
  status: ChecklistStatus;
  assigned_to: string[]; // array of wedding_member user_ids
  notes: string;
  sort_order: number;
  is_important: boolean;
  created_at: string;
};

// Status cycle order: not_yet → in_progress → settle → not_yet (kiv via explicit action)
export const STATUS_CYCLE: ChecklistStatus[] = ["not_yet", "in_progress", "settle"];

export const STATUS_META: Record<
  ChecklistStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  not_yet: { label: "Belum", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400" },
  in_progress: { label: "Sedang", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  settle: { label: "Selesai", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  kiv: { label: "KIV", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
};

// ── Queries ───────────────────────────────────────────────────

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
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Normalise rows from DB — if `status` column is missing (pre-migration),
      // derive from `completed` so the UI still works gracefully.
      return ((data ?? []) as ChecklistTask[]).map((t) => ({
        ...t,
        status: t.status ?? (t.completed ? "settle" : "not_yet"),
        assigned_to: t.assigned_to ?? [],
        notes: t.notes ?? "",
        sort_order: t.sort_order ?? 0,
        is_important: t.is_important ?? false,
      }));
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddChecklistTask() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({ title, phase }: { title: string; phase: string }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("checklist_tasks")
        .insert({
          user_id: user.id,
          wedding_id: weddingId,
          title,
          phase,
          completed: false,
          status: "not_yet",
          assigned_to: [],
          notes: "",
          sort_order: 9999,
          is_important: false,
        })
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

export function useUpdateChecklistStatus() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChecklistStatus }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("checklist_tasks")
        .update({ status, completed: status === "settle" })
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

export function useUpdateChecklistDetails() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      id,
      notes,
      assigned_to,
    }: {
      id: string;
      notes?: string;
      assigned_to?: string[];
    }) => {
      const supabase = createClient();
      const patch: Record<string, unknown> = {};
      if (notes !== undefined) patch.notes = notes;
      if (assigned_to !== undefined) patch.assigned_to = assigned_to;
      const { data, error } = await supabase
        .from("checklist_tasks")
        .update(patch)
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

/** Legacy toggle — kept so existing activity log calls compile. */
export function useToggleChecklistTask() {
  return useUpdateChecklistStatus();
}

export function useDeleteChecklistTask() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("checklist_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist_tasks", weddingId] });
    },
  });
}

/** Bulk-insert the default wedding preparation template (~143 items). */
export function useSeedChecklist() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (lang: LangCode = "ms") => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const template = lang === "en" ? CHECKLIST_TEMPLATE_EN : CHECKLIST_TEMPLATE;
      const rows = template.map((item) => ({
        user_id: user.id,
        wedding_id: weddingId,
        title: item.title,
        phase: item.phase,
        completed: false,
        status: "not_yet" as ChecklistStatus,
        assigned_to: [] as string[],
        notes: "",
        sort_order: item.sort_order,
        is_important: item.is_important,
      }));

      // Insert in batches of 50 to stay within Supabase payload limits
      const BATCH = 50;
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase.from("checklist_tasks").insert(rows.slice(i, i + BATCH));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist_tasks", weddingId] });
    },
  });
}
