"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar, Plus, Trash2, Edit3, Heart, CalendarDays, Clock,
} from "lucide-react";
import {
  useEvents,
  useAddEvent,
  useUpdateEvent,
  useDeleteEvent,
  calcDaysLeft,
  formatDate,
  type DbEvent,
} from "@/lib/supabase/queries/events";
import { useWedding } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { useLanguage } from "@/lib/i18n/language-context";

const EVENT_TYPES = ["Nikah", "Tunang", "Resepsi"] as const;

type EventForm = { name: string; date: string; type: string };
const EMPTY_FORM: EventForm = { name: "", date: "", type: EVENT_TYPES[0] };

// ── Status chip helper ────────────────────────────────────────

function DaysChip({ days, t }: { days: number; t: (k: string, v?: Record<string, string | number>) => string }) {
  if (days < 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
        {t("majlis.passed")}
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold animate-pulse">
        {t("majlis.today")}
      </span>
    );
  }
  const color =
    days <= 30
      ? "bg-rose-50 text-rose-600"
      : days <= 90
      ? "bg-amber-50 text-amber-700"
      : "bg-green-50 text-green-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {t("majlis.daysLeft", { days })}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function MajlisPage() {
  const { toast } = useToast();
  const { weddingId, isLoading: weddingLoading } = useWedding();
  const { user } = useUser();
  const { lang, t } = useLanguage();
  const { data: events = [], isLoading } = useEvents();
  const addEvent = useAddEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  // Dialog state — null = closed, "add" = add mode, DbEvent = edit mode
  const [dialog, setDialog] = useState<null | "add" | DbEvent>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setDialog("add");
  };

  const openEdit = (event: DbEvent) => {
    setForm({ name: event.name, date: event.date ?? "", type: event.type ?? EVENT_TYPES[0] });
    setDialog(event);
  };

  const closeDialog = () => {
    setDialog(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.date) {
      toast({ title: t("majlis.fillNameDate"), variant: "error" });
      return;
    }
    try {
      if (dialog === "add") {
        const newEv = await addEvent.mutateAsync({ name: form.name.trim(), date: form.date, type: form.type });
        toast({ title: t("majlis.addedToast"), variant: "success" });
        if (weddingId && user) {
          const supabase = createClient();
          await logActivity({ supabase, weddingId, userId: user.id, action: "event.add", entityType: "event", entityName: newEv.name });
        }
      } else if (dialog && typeof dialog === "object") {
        await updateEvent.mutateAsync({ id: dialog.id, name: form.name.trim(), date: form.date, type: form.type });
        toast({ title: t("majlis.updatedToast"), variant: "success" });
        if (weddingId && user) {
          const supabase = createClient();
          await logActivity({ supabase, weddingId, userId: user.id, action: "event.update", entityType: "event", entityName: form.name.trim() });
        }
      }
      closeDialog();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.tryAgain");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    try {
      await deleteEvent.mutateAsync(id);
      toast({ title: t("majlis.deletedToast"), variant: "default" });
      setDeleteConfirm(null);
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "event.delete", entityType: "event", entityName: eventToDelete?.name });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.tryAgain");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  const isMutating = addEvent.isPending || updateEvent.isPending;
  const isEditMode = dialog !== null && dialog !== "add";
  const dialogTitle = isEditMode ? t("majlis.dialogEditTitle") : t("majlis.dialogAddTitle");

  // Nearest upcoming event for summary card
  const upcomingEvents = events
    .filter((e) => e.date && calcDaysLeft(e.date) >= 0)
    .sort((a, b) => calcDaysLeft(a.date!) - calcDaysLeft(b.date!));
  const nextEvent = upcomingEvents[0] ?? null;

  if (weddingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("majlis.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("majlis.subtitle")}</p>
        </div>
        <Button
          onClick={openAdd}
          className="rounded-full px-6 w-fit"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t("majlis.addButton")}
        </Button>
      </div>

      {/* Summary gradient card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          variant="gradient"
          className="p-8 text-white relative overflow-hidden border-none shadow-xl"
        >
          <Heart className="absolute right-6 top-6 h-28 w-28 text-white/10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">
                {t("majlis.yourCount")}
              </p>
              <h2 className="text-5xl font-bold tracking-tight font-heading">
                {events.length}
                <span className="text-xl opacity-60 font-normal ml-2">
                  {events.length === 1 ? t("majlis.oneEvent") : t("majlis.manyEvents")}
                </span>
              </h2>
            </div>
            {nextEvent && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{t("majlis.nearest")}</p>
                <p className="font-heading font-bold text-white text-lg leading-tight">{nextEvent.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarDays className="h-3.5 w-3.5 text-white/60" />
                  <p className="text-white/80 text-sm">{formatDate(nextEvent.date!, lang)}</p>
                  <span className="text-white/40">·</span>
                  <Clock className="h-3.5 w-3.5 text-white/60" />
                  <p className="text-white/80 text-sm font-semibold">
                    {t("majlis.daysLeft", { days: calcDaysLeft(nextEvent.date!) })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Events list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-14 text-center border-dashed border-2 border-border space-y-5">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-10 w-10 text-primary fill-primary/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold text-foreground">
                {t("majlis.emptyTitle")}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {t("majlis.emptySubtitle")}
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("majlis.addFirst")}
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {events.map((event, index) => {
              const days = event.date ? calcDaysLeft(event.date) : null;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-all border-border/40 group bg-white/80">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-6 w-6 text-primary fill-primary/30" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-foreground text-lg truncate">
                          {event.name}
                        </h3>
                        {event.type && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
                            {t(`eventType.${event.type}`)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {event.date ? (
                          <>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(event.date, lang)}
                            </span>
                            {days !== null && <DaysChip days={days} t={t} />}
                          </>
                        ) : (
                          <span className="italic">{t("majlis.dateNotSet")}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(event)}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(event.id)}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add / Edit Dialog ─────────────────────────────────── */}
      <Dialog
        isOpen={dialog !== null}
        onClose={closeDialog}
        title={dialogTitle}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="majlis-name">{t("majlis.nameLabel")}</Label>
            <Input
              id="majlis-name"
              placeholder={t("majlis.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="majlis-date">{t("majlis.dateLabel")}</Label>
            <Input
              id="majlis-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("majlis.typeLabel")}</Label>
            <div className="flex gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.type === type
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background text-foreground border-input hover:border-primary/40"
                  }`}
                >
                  {t(`eventType.${type}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isMutating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isMutating ? t("common.saving") : isEditMode ? t("common.saveChanges") : t("majlis.saveAdd")}
            </Button>
            <Button onClick={closeDialog} variant="outline" className="flex-1">
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ── Delete confirmation dialog ────────────────────────── */}
      <Dialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title={t("majlis.dialogDeleteTitle")}
      >
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {t("majlis.dialogDeleteBody")}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteEvent.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {deleteEvent.isPending ? t("common.deleting") : t("majlis.yesDelete")}
            </Button>
            <Button
              onClick={() => setDeleteConfirm(null)}
              variant="outline"
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
