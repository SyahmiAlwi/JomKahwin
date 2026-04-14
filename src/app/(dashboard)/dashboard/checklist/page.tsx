"use client";

import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  StickyNote,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChecklistTasks,
  useAddChecklistTask,
  useUpdateChecklistStatus,
  useUpdateChecklistDetails,
  useDeleteChecklistTask,
  useSeedChecklist,
  STATUS_META,
  STATUS_CYCLE,
  type ChecklistStatus,
  type ChecklistTask,
} from "@/lib/supabase/queries/checklist";
import { CHECKLIST_TEMPLATE } from "@/lib/data/checklist-template";
import { useQueryClient } from "@tanstack/react-query";
import { useWedding } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";

// ── Constants & Helpers ───────────────────────────────────────

export const PHASES = [
  "12 - 6 bulan sebelum",
  "5 bulan sebelum",
  "4 bulan sebelum",
  "3 bulan sebelum",
  "2 bulan sebelum",
  "1 bulan sebelum",
  "2 minggu sebelum",
  "1 minggu sebelum",
  "2 - 3 hari sebelum",
  "1 hari sebelum",
  "Hari Majlis",
  "Lain-lain",
];

function nextStatus(current: ChecklistStatus): ChecklistStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  if (idx === -1) return "not_yet"; // kiv → reset to not_yet on tap
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

/** Derive display name for a member UUID from the members list. */
function memberName(
  uid: string,
  members: { user_id: string; full_name: string | null }[],
  currentUserId?: string
): string {
  const m = members.find((x) => x.user_id === uid);
  if (!m) return "Ahli";
  if (m.full_name) return m.full_name;
  if (uid === currentUserId) return "Anda";
  return "Ahli";
}

function memberInitials(
  uid: string,
  members: { user_id: string; full_name: string | null }[],
  currentUserId?: string
): string {
  return memberName(uid, members, currentUserId).charAt(0).toUpperCase();
}

// ── Status Badge ──────────────────────────────────────────────

function StatusBadge({
  status,
  onClick,
  small,
}: {
  status: ChecklistStatus;
  onClick?: () => void;
  small?: boolean;
}) {
  const m = STATUS_META[status];
  return (
    <button
      type="button"
      onClick={onClick}
      title={onClick ? "Klik untuk tukar status" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-all shrink-0",
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        m.bg,
        m.color,
        onClick && "cursor-pointer hover:opacity-80 active:scale-95"
      )}
    >
      <span className={cn("rounded-full shrink-0", small ? "h-1.5 w-1.5" : "h-2 w-2", m.dot)} />
      {m.label}
    </button>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

function ProgressBar({ tasks }: { tasks: ChecklistTask[] }) {
  const total = tasks.length;
  const counts = useMemo(() => ({
    not_yet: tasks.filter((t) => t.status === "not_yet").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    settle: tasks.filter((t) => t.status === "settle").length,
    kiv: tasks.filter((t) => t.status === "kiv").length,
  }), [tasks]);

  const pct = total > 0 ? Math.round((counts.settle / total) * 100) : 0;

  return (
    <Card className="p-5 border-border/60 bg-white/80">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">Progress Keseluruhan</p>
        <span className="text-2xl font-bold text-primary font-heading">{pct}%</span>
      </div>

      {/* Segmented bar */}
      <div className="h-2.5 rounded-full bg-muted flex overflow-hidden">
        {(["settle", "in_progress", "kiv"] as ChecklistStatus[]).map((s) => {
          const w = total > 0 ? (counts[s] / total) * 100 : 0;
          if (w === 0) return null;
          return (
            <div
              key={s}
              className={cn("h-full transition-all duration-700", {
                "bg-emerald-500": s === "settle",
                "bg-blue-400": s === "in_progress",
                "bg-orange-400": s === "kiv",
              })}
              style={{ width: `${w}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {(Object.entries(STATUS_META) as [ChecklistStatus, typeof STATUS_META[ChecklistStatus]][]).map(
          ([s, m]) => (
            <span key={s} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full shrink-0", m.dot)} />
              {m.label} <strong className="text-foreground">{counts[s]}</strong>
            </span>
          )
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          Jumlah <strong className="text-foreground">{total}</strong>
        </span>
      </div>
    </Card>
  );
}

// ── Expanded Row Panel ────────────────────────────────────────

function TaskExpandedPanel({
  task,
  members,
  currentUserId,
  onNotesBlur,
  onTogglePic,
  onStatusChange,
}: {
  task: ChecklistTask;
  members: { user_id: string; full_name: string | null }[];
  currentUserId?: string;
  onNotesBlur: (notes: string) => void;
  onTogglePic: (uid: string) => void;
  onStatusChange: (status: ChecklistStatus) => void;
}) {
  const [localNotes, setLocalNotes] = useState(task.notes ?? "");

  return (
    <motion.div
      key="panel"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 space-y-3 border-t border-border/40 mt-0 pt-3">
        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <StickyNote className="h-3 w-3" /> Catatan
          </label>
          <textarea
            rows={2}
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={() => onNotesBlur(localNotes)}
            placeholder="Tambah catatan di sini…"
            className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* PIC */}
        {members.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Tanggungjawab
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const active = task.assigned_to?.includes(m.user_id) ?? false;
                const name = m.full_name ?? (m.user_id === currentUserId ? "Anda" : "Ahli");
                return (
                  <button
                    key={m.user_id}
                    type="button"
                    onClick={() => onTogglePic(m.user_id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all",
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
                    )}
                  >
                    <span className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                    )}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Dropdown */}
        <div className="flex justify-end items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground mr-1">Status:</label>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as ChecklistStatus)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
          >
            <option value="not_yet">Belum Selesai</option>
            <option value="in_progress">Sedang Lakukan</option>
            <option value="settle">Selesai ✓</option>
            <option value="kiv">KIV</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}

// ── Task Item ─────────────────────────────────────────────────

function TaskItem({
  task,
  members,
  currentUserId,
  onStatusChange,
  onNotesBlur,
  onTogglePic,
  onDelete,
}: {
  task: ChecklistTask;
  members: { user_id: string; full_name: string | null }[];
  currentUserId?: string;
  onStatusChange: (status: ChecklistStatus) => void;
  onNotesBlur: (notes: string) => void;
  onTogglePic: (uid: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSettled = task.status === "settle";
  const hasNotes = !!task.notes?.trim();
  const hasPic = task.assigned_to?.length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-200",
        isSettled
          ? "bg-muted/30 border-border/30"
          : task.is_important
            ? "bg-rose-50/60 border-rose-200/60 shadow-sm"
            : "bg-white border-border/60 shadow-sm hover:shadow-md hover:border-primary/30"
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Status badge */}
        <StatusBadge status={task.status} onClick={undefined} small />

        {/* Title */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex-1 text-left min-w-0"
        >
          <span
            className={cn(
              "text-sm font-medium leading-snug block",
              isSettled
                ? "text-muted-foreground line-through decoration-muted-foreground/40"
                : "text-foreground"
            )}
          >
            {task.is_important && (
              <AlertCircle className="inline h-3.5 w-3.5 mr-1 text-rose-500 shrink-0 mb-0.5" />
            )}
            {task.title}
          </span>

          {/* Indicator row */}
          {(hasPic || hasNotes) && (
            <div className="flex items-center gap-2 mt-1">
              {hasPic && (
                <div className="flex -space-x-1">
                  {task.assigned_to.slice(0, 3).map((uid) => (
                    <span
                      key={uid}
                      title={memberName(uid, members, currentUserId)}
                      className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center border border-white"
                    >
                      {memberInitials(uid, members, currentUserId)}
                    </span>
                  ))}
                </div>
              )}
              {hasNotes && <StickyNote className="h-3 w-3 text-muted-foreground/60" />}
            </div>
          )}
        </button>

        {/* Expand chevron */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-colors shrink-0"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <TaskExpandedPanel
            task={task}
            members={members}
            currentUserId={currentUserId}
            onNotesBlur={onNotesBlur}
            onTogglePic={onTogglePic}
            onStatusChange={onStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Seed Modal ────────────────────────────────────────────────

function SeedModal({ onSeed, onDismiss, loading }: { onSeed: () => void; onDismiss: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            disabled={loading}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            Guna template checklist? 🇲🇾
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Kami ada sediakan <strong>143 tugasan</strong> persiapan kahwin Malaysia yang lengkap — dari 12 bulan sebelum sampai hari majlis.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSeed}
            disabled={loading}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Memuatkan…" : "Ya, muatkan! ✨"}
          </Button>
          <Button
            onClick={onDismiss}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Tak perlu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Filter Pills ──────────────────────────────────────────────

const FILTER_OPTIONS: Array<{ value: "all" | ChecklistStatus; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "not_yet", label: "Belum" },
  { value: "in_progress", label: "Sedang" },
  { value: "settle", label: "Selesai" },
  { value: "kiv", label: "KIV" },
];

function PhaseGroup({
  phase,
  tasks,
  members,
  currentUserId,
  onStatusChange,
  onNotesBlur,
  onTogglePic,
  onDelete,
}: {
  phase: string;
  tasks: ChecklistTask[];
  members: { user_id: string; full_name: string | null }[];
  currentUserId?: string;
  onStatusChange: (t: ChecklistTask, status: ChecklistStatus) => void;
  onNotesBlur: (t: ChecklistTask, notes: string) => void;
  onTogglePic: (t: ChecklistTask, uid: string) => void;
  onDelete: (e: React.MouseEvent, t: ChecklistTask) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between pb-2 mb-1 border-b border-border/50 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-lg text-foreground uppercase tracking-wide text-left">
            {phase}
          </h3>
          <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2.5"
          >
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <TaskItem
                  task={task}
                  members={members}
                  currentUserId={currentUserId}
                  onStatusChange={(status) => onStatusChange(task, status)}
                  onNotesBlur={(notes) => onNotesBlur(task, notes)}
                  onTogglePic={(uid) => onTogglePic(task, uid)}
                  onDelete={(e) => onDelete(e, task)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function ChecklistPage() {
  const { weddingId, isLoading: weddingLoading, members } = useWedding();
  const { user } = useUser();
  const { data: tasks = [], isLoading: tasksLoading } = useChecklistTasks();

  const statusMutation = useUpdateChecklistStatus();
  const detailsMutation = useUpdateChecklistDetails();
  const addMutation = useAddChecklistTask();
  const deleteMutation = useDeleteChecklistTask();
  const seedMutation = useSeedChecklist();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<"all" | ChecklistStatus>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPhase, setNewPhase] = useState(PHASES[0]);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Show seed modal once tasks are loaded & none exist
  const seedChecked = useRef(false);
  if (!tasksLoading && !weddingLoading && tasks.length === 0 && !seedChecked.current) {
    seedChecked.current = true;
    setShowSeedModal(true);
  }

  // Filtered list
  const filtered = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  // Grouped by phase
  const groupedTasks = useMemo(() => {
    const groups: Record<string, ChecklistTask[]> = {};
    PHASES.forEach((p) => (groups[p] = []));

    filtered.forEach((t) => {
      const g = PHASES.includes(t.phase) ? t.phase : "Lain-lain";
      groups[g].push(t);
    });

    return groups;
  }, [filtered]);

  // ── Handlers ──────────────────────────────────────────────

  const handleStatusChange = async (task: ChecklistTask, newStatus: ChecklistStatus) => {
    try {
      await statusMutation.mutateAsync({ id: task.id, status: newStatus });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({
          supabase, weddingId, userId: user.id,
          action: `Tukar status → ${STATUS_META[newStatus].label}`,
          entityType: "checklist", entityName: task.title,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleNotesBlur = async (task: ChecklistTask, notes: string) => {
    if (notes === (task.notes ?? "")) return;
    try {
      await detailsMutation.mutateAsync({ id: task.id, notes });
    } catch {
      // silently ignore
    }
  };

  const handleTogglePic = async (task: ChecklistTask, uid: string) => {
    const current = task.assigned_to ?? [];
    const next = current.includes(uid)
      ? current.filter((x) => x !== uid)
      : [...current, uid];
    try {
      await detailsMutation.mutateAsync({ id: task.id, assigned_to: next });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, task: ChecklistTask) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(task.id);
      toast({ title: "Dihapus!", variant: "default" });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({
          supabase, weddingId, userId: user.id,
          action: "Padam tugasan", entityType: "checklist", entityName: task.title,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPhase) return;
    try {
      await addMutation.mutateAsync({ title: newTitle.trim(), phase: newPhase });
      toast({ title: "Berjaya!", description: "Tugasan baru ditambah.", variant: "success" });
      setNewTitle("");
      setNewPhase(PHASES[0]);
      setIsAddOpen(false);
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({
          supabase, weddingId, userId: user.id,
          action: "Tambah tugasan", entityType: "checklist", entityName: newTitle.trim(),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      setShowSeedModal(false);
      toast({ title: "Template dimuatkan! ✨", description: "143 tugasan berjaya ditambah.", variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat memuat template", description: msg, variant: "error" });
    }
  };

  // ── Loading ────────────────────────────────────────────────

  if (weddingLoading || tasksLoading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="h-8 w-48 rounded-xl bg-muted/50 animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* Seed modal */}
      <AnimatePresence>
        {showSeedModal && (
          <SeedModal
            onSeed={handleSeed}
            onDismiss={() => setShowSeedModal(false)}
            loading={seedMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div className="space-y-5 pb-28">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Senarai Semak</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Jangan tertinggal sebarang persiapan penting.
            </p>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="icon"
            className="rounded-full h-11 w-11 shadow-md shrink-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress bar (only if there are tasks) */}
        {tasks.length > 0 && <ProgressBar tasks={tasks} />}

        {/* Filter pills */}
        {tasks.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 no-scrollbar">
            {FILTER_OPTIONS.map((f) => {
              const count =
                f.value === "all"
                  ? tasks.length
                  : tasks.filter((t) => t.status === f.value).length;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                    filter === f.value
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                        filter === f.value ? "bg-white/20 text-white" : "bg-muted text-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && !showSeedModal && (
          <Card className="p-12 text-center border-dashed border-2 border-border space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-heading font-bold text-foreground">Tiada Tugasan</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Tambah tugasan sendiri atau muat template checklist kahwin Malaysia yang lengkap.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => setShowSeedModal(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Muat Template
              </Button>
              <Button variant="outline" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Manual
              </Button>
            </div>
          </Card>
        )}

        {/* Filtered empty state */}
        {tasks.length > 0 && filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Tiada tugasan dengan status <strong>{STATUS_META[filter as ChecklistStatus]?.label}</strong>.
          </div>
        )}

        {/* Grouped Task List */}
        <div className="space-y-8 mt-6">
          {PHASES.map((phase) => (
            <PhaseGroup
              key={phase}
              phase={phase}
              tasks={groupedTasks[phase]}
              members={members}
              currentUserId={user?.id}
              onStatusChange={handleStatusChange}
              onNotesBlur={handleNotesBlur}
              onTogglePic={handleTogglePic}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Tugasan">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Fasa (Tempoh)</label>
            <select
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Nama Tugasan</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Contoh: Beli cincin kahwin"
              required
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={addMutation.isPending || !newTitle.trim()}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {addMutation.isPending ? "Menyimpan…" : "Tambah"}
          </Button>
        </form>
      </Dialog>
    </>
  );
}
