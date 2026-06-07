import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useWedding } from "@/components/providers/wedding-provider";

export type NoteImage = {
  url: string;
  storage_path: string;
  name: string;
};

export type Note = {
  id: string;
  wedding_id: string | null;
  user_id: string;
  title: string | null;
  body: string | null;
  images: NoteImage[];
  created_at: string;
  updated_at: string;
};

// ── Queries ──────────────────────────────────────────────────────────────────

export function useNotes() {
  const supabase = createClient();
  const { weddingId } = useWedding();

  return useQuery<Note[]>({
    queryKey: ["notes", weddingId],
    queryFn: async () => {
      if (!weddingId) return [];
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
    enabled: !!weddingId,
  });
}

export function useNote(id: string) {
  const supabase = createClient();

  return useQuery<Note | null>({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Note;
    },
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateNote() {
  const supabase = createClient();
  const { weddingId } = useWedding();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title?: string | null; body?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .insert({
          wedding_id: weddingId ?? null,
          user_id: user.id,
          title: payload.title ?? null,
          body: payload.body ?? null,
          images: [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title?: string | null;
      body?: string | null;
      images?: NoteImage[];
    }) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("notes")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: (note) => {
      qc.setQueryData(["note", note.id], note);
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      qc.removeQueries({ queryKey: ["note", id] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadNoteImage(file: File): Promise<NoteImage> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `notes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("note-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("note-images")
    .getPublicUrl(path);

  return { url: publicUrl, storage_path: path, name: file.name };
}
