import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type BudgetCategory = {
  id: string;
  user_id: string;
  event_id: string | null;
  name: string;
  color: string;
  allocated: number;
  created_at: string;
};

export type BudgetExpense = {
  id: string;
  user_id: string;
  category_id: string;
  description: string | null;
  amount: number;
  date: string;
  created_at: string;
};

export type BudgetFund = {
  id: string;
  user_id: string;
  event_id: string | null;
  description: string;
  amount: number;
  date: string;
  created_at: string;
};

// ── Queries ──────────────────────────────────────────────────

export function useBudgetCategories() {
  return useQuery({
    queryKey: ["budget_categories"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetCategory[];
    },
  });
}

export function useBudgetExpenses() {
  return useQuery({
    queryKey: ["budget_expenses"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_expenses")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetExpense[];
    },
  });
}

export function useBudgetFunds() {
  return useQuery({
    queryKey: ["budget_funds"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budget_funds")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BudgetFund[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddExpenseCategory() {
  const queryClient = useQueryClient();
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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the category record
      const { data: cat, error: catErr } = await supabase
        .from("budget_categories")
        .insert({
          user_id: user.id,
          name,
          color: "text-blue-500 bg-blue-100",
          allocated: total,
        })
        .select()
        .single();
      if (catErr) throw catErr;

      // Create the initial expense entry for this category
      const { error: expErr } = await supabase.from("budget_expenses").insert({
        user_id: user.id,
        category_id: cat.id,
        description: name,
        amount,
        date: new Date().toISOString().split("T")[0],
      });
      if (expErr) throw expErr;

      return cat as BudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_categories"] });
      queryClient.invalidateQueries({ queryKey: ["budget_expenses"] });
    },
  });
}

export function useAddFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      source,
      amount,
    }: {
      source: string;
      amount: number;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budget_funds")
        .insert({
          user_id: user.id,
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
      queryClient.invalidateQueries({ queryKey: ["budget_funds"] });
    },
  });
}
