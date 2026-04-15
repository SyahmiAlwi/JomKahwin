import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type Vendor = {
  id: string;
  wedding_id: string;
  user_id: string;
  name: string;
  category: string;
  phone: string;
  estimated_price: number;
  amount_paid: number;
  status: string;
  notes: string;
  budget_category_id: string | null;
  created_at: string;
};

export type VendorInput = {
  name: string;
  category: string;
  phone: string;
  estimated_price: number;
  amount_paid: number;
  status: string;
  notes: string;
  budget_category_id: string | null;
};

// ── Queries ──────────────────────────────────────────────────

export function useVendors() {
  const { weddingId } = useWedding();
  return useQuery({
    queryKey: ["vendors", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("wedding_vendors")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Vendor[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useAddVendor() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (input: VendorInput) => {
      if (!weddingId) throw new Error("Wedding not loaded");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("wedding_vendors")
        .insert({ ...input, wedding_id: weddingId, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors", weddingId] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async ({ id, ...fields }: VendorInput & { id: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("wedding_vendors")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate vendors — budget page reads from vendors to compute amounts
      queryClient.invalidateQueries({ queryKey: ["vendors", weddingId] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const { weddingId } = useWedding();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("wedding_vendors")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors", weddingId] });
    },
  });
}
