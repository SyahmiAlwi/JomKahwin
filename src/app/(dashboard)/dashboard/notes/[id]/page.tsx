"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Trash2, Image as ImageIcon,
  X, Loader2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useNote, useUpdateNote, useDeleteNote,
  uploadNoteImage, type NoteImage,
} from "@/lib/supabase/queries/notes";
import { useToast } from "@/components/ui/use-toast";

type SaveStatus = "idle" | "saving" | "saved";

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Baru sahaja";
  if (mins < 60) return `${mins} min lalu`;
  if (hours < 24) return `${hours}j lalu`;
  if (days === 1) return "Semalam";
  if (days < 30) return `${days}h lalu`;
  return new Date(dateString).toLocaleDateString("ms-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function useAutoResize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, ref]);
}

export default function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: note, isLoading } = useNote(id);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<NoteImage[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useAutoResize(titleRef, title);
  useAutoResize(bodyRef, body);

  useEffect(() => {
    if (note && !initialized) {
      setTitle(note.title ?? "");
      setBody(note.body ?? "");
      setImages(note.images ?? []);
      setInitialized(true);
    }
  }, [note, initialized]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const triggerSave = useCallback(
    (t: string, b: string, imgs: NoteImage[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      setSaveStatus("saving");
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateNote.mutateAsync({
            id,
            title: t.trim() || null,
            body: b.trim() || null,
            images: imgs,
          });
          setSaveStatus("saved");
          savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
          toast({ title: "Ralat menyimpan nota", variant: "error" });
        }
      }, 800);
    },
    [id, updateNote, toast]
  );

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (initialized) triggerSave(v, body, images);
  };

  const handleBodyChange = (v: string) => {
    setBody(v);
    if (initialized) triggerSave(title, v, images);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(files.map(uploadNoteImage));
      const next = [...images, ...uploaded];
      setImages(next);
      triggerSave(title, body, next);
    } catch {
      toast({ title: "Gagal muat naik gambar", variant: "error" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleImageRemove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    triggerSave(title, body, next);
  };

  const handleDelete = async () => {
    await deleteNote.mutateAsync(id);
    router.push("/dashboard/notes");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse pt-2">
        <div className="h-5 w-24 bg-muted rounded-lg" />
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="h-8 w-3/5 bg-muted rounded-lg" />
          <div className="h-px bg-border/60" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center">
        <p className="text-muted-foreground text-sm mb-4">Nota tidak dijumpai.</p>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/notes")}
          className="text-sm rounded-xl"
        >
          ← Kembali ke Nota
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => router.push("/dashboard/notes")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>Nota</span>
        </button>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {saveStatus === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Menyimpan…
              </motion.span>
            )}
            {saveStatus === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 text-xs text-primary"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Disimpan
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
            aria-label="Padam nota"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Title */}
        <div className="px-5 pt-5 pb-3">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Tajuk nota…"
            rows={1}
            className={cn(
              "w-full resize-none overflow-hidden bg-transparent",
              "text-xl font-bold text-foreground font-heading leading-snug",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none"
            )}
          />
        </div>

        <div className="mx-5 h-px bg-border/60" />

        {/* Body */}
        <div className="px-5 py-4">
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Mula menulis di sini…"
            rows={10}
            className={cn(
              "w-full resize-none overflow-hidden bg-transparent min-h-[200px]",
              "text-sm leading-7 text-foreground",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((img, i) => (
                <motion.div
                  key={img.storage_path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-muted"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleImageRemove(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Buang gambar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="px-5 pb-4 pt-3 flex items-center justify-between border-t border-border/60">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              Tambah Gambar
            </button>
          </div>
          <span className="text-xs text-muted-foreground/50">
            {relativeTime(note.updated_at)}
          </span>
        </div>
      </div>

      {/* Delete confirm sheet */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-semibold text-foreground mb-1.5">Padam nota ini?</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Semua teks dan gambar dalam nota ini akan dipadamkan. Tindakan ini tidak boleh dibatalkan.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                  onClick={handleDelete}
                  disabled={deleteNote.isPending}
                >
                  {deleteNote.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Padam"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
