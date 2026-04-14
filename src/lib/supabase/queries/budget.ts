import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type BudgetCategory = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  event_id: string | null;
  name: string;
  color: string;
  allocated: number;
  created_at: string;
};

export type BudgetExpense = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  category_id: string;
  description: string | null;
  amount: number;
  date: string;
  created_at: string;
};

export type BudgetFund = {
  id: string;
  user_id: string;
  wedding_id: string | null;
  event_id: string | null;
  description: string;
  amount: number;
  date: string;
  created_at: string;
};

// ── Queries ──────────────────────────────────────────────────

export function useBudgetCategories() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["budget_categories", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetCategory[];
    },
  });
}

export function useBudgetExpenses() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["budget_expenses", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_expenses")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetExpense[];
    },
  });
}

export function useBudgetFunds() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["budget_funds", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_funds")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetFund[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddExpenseCategory() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      name,
      amount,
      total,
    }: {
      name: string;
      amount: number;
      total: number;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: cat, error: catErr } = await supabase
        .from("budget_categories")
        .insert({
          user_id: user.id,
          wedding_id: weddingId,
          name,
          color: "text-blue-500 bg-blue-100",
          allocated: total,
        })
        .select()
        .single();
      if (catErr) throw catErr;

      const { error: expErr } = await supabase.from("budget_expenses").insert({
        user_id: user.id,
        wedding_id: weddingId,
        category_id: cat.id,
        description: name,
        amount,
        date: new Date().toISOString().split("T")[0],
      });
      if (expErr) throw expErr;

      return cat as BudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", weddingId] });
      queryClient.invalidateQueries({ queryKey: ["budget_expenses", weddingId] });
    },
  });
}

export function useAddFund() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      source,
      amount,
    }: {
      source: string;
      amount: number;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budget_funds")
        .insert({
          user_id: user.id,
          wedding_id: weddingId,
          description: source,
          amount,
          date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      if (error) throw error;
      return data as BudgetFund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_funds", weddingId] });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      amount,
      total,
    }: {
      id: string;
      name: string;
      amount: number;
      total: number;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      
      const { error: catErr } = await supabase
        .from("budget_categories")
        .update({ name, allocated: total })
        .eq("id", id);
      if (catErr) throw catErr;

      // When updating, we assume a simple 1:1 relation as created by useAddExpenseCategory
      // If there are multiple expenses under this category, this logic might need refinement.
      // For now, we update the first matching expense (or all of them, but usually it's one per category in this simplified UI).
      const { error: expErr } = await supabase
        .from("budget_expenses")
        .update({ description: name, amount })
        .eq("category_id", id);
      if (expErr) throw expErr;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", weddingId] });
      queryClient.invalidateQueries({ queryKey: ["budget_expenses", weddingId] });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      
      // Delete expenses first to prevent foreign key errors if cascade isn't on
      await supabase.from("budget_expenses").delete().eq("category_id", id);
      const { error } = await supabase.from("budget_categories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories", weddingId] });
      queryClient.invalidateQueries({ queryKey: ["budget_expenses", weddingId] });
    },
  });
}

export function useUpdateFund() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({
      id,
      source,
      amount,
    }: {
      id: string;
      source: string;
      amount: number;
    }) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const { error } = await supabase
        .from("budget_funds")
        .update({ description: source, amount })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_funds", weddingId] });
    },
  });
}

export function useDeleteFund() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const { error } = await supabase.from("budget_funds").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_funds", weddingId] });
    },
  });
}
