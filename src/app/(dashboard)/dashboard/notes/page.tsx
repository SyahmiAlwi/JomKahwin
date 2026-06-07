"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, StickyNote, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotes, useCreateNote, type Note } from "@/lib/supabase/queries/notes";

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
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const hasImages = note.images && note.images.length > 0;
  const hasTitle = note.title && note.title.trim().length > 0;
  const hasBody = note.body && note.body.trim().length > 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        "group w-full text-left break-inside-avoid mb-3",
        "bg-card border border-border rounded-2xl",
        "p-4 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-rose-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {hasImages && (
        <div className="mb-3 overflow-hidden rounded-xl h-36 bg-muted">
          <img
            src={note.images[0].url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      )}

      {hasTitle ? (
        <p className="font-semibold text-foreground text-sm leading-snug mb-1.5 line-clamp-2">
          {note.title}
        </p>
      ) : (
        <p className="italic text-muted-foreground/60 text-sm mb-1.5">Tanpa tajuk</p>
      )}

      {hasBody && (
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-3">
          {note.body}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60">
          {relativeTime(note.updated_at)}
        </span>
        {hasImages && note.images.length > 1 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <ImageIcon className="w-3 h-3" />
            {note.images.length}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function SkeletonCard({ h }: { h: number }) {
  return (
    <div
      className="break-inside-avoid mb-3 bg-muted/60 rounded-2xl animate-shimmer"
      style={{ height: `${h}px` }}
    />
  );
}

export default function NotesPage() {
  const router = useRouter();
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();

  const handleCreate = async () => {
    const note = await createNote.mutateAsync({});
    router.push(`/dashboard/notes/${note.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground font-heading">Nota Kahwin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Memuatkan…"
              : notes.length > 0
                ? `${notes.length} nota`
                : "Catat idea bersama pasangan"}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={createNote.isPending}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-rose-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Nota Baru
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          {[148, 100, 180, 120, 96, 164].map((h, i) => (
            <SkeletonCard key={i} h={h} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center py-20 px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <StickyNote className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            Belum ada nota lagi
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
            Catat idea, inspirasi, atau perkara penting berkaitan perkahwinan anda di sini.
          </p>
          <Button
            onClick={handleCreate}
            disabled={createNote.isPending}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Buat Nota Pertama
          </Button>
        </motion.div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          <AnimatePresence>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => router.push(`/dashboard/notes/${note.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
