"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Check, Plus, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChecklistTasks,
  useAddChecklistTask,
  useToggleChecklistTask,
  useDeleteChecklistTask,
} from "@/lib/supabase/queries/checklist";
import { useWedding } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";

const PHASES = [
  { id: "phase-1", title: "6 Bulan Sebelum" },
  { id: "phase-2", title: "3 Bulan Sebelum" },
  { id: "phase-3", title: "1 Bulan Sebelum" },
];

export default function ChecklistPage() {
  const { weddingId, isLoading: weddingLoading } = useWedding();
  const { user } = useUser();
  const { data: tasks = [] } = useChecklistTasks();
  const addTaskMutation = useAddChecklistTask();
  const toggleMutation = useToggleChecklistTask();
  const deleteMutation = useDeleteChecklistTask();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", phase: "phase-1" });
  const { toast } = useToast();

  // Group flat task list by phase
  const phases = useMemo(
    () =>
      PHASES.map((p) => ({
        id: p.id,
        title: p.title,
        tasks: tasks.filter((t) => t.phase === p.id),
      })),
    [tasks]
  );

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      await toggleMutation.mutateAsync({ id: taskId, completed: !currentCompleted });
      if (weddingId && user && task) {
        const supabase = createClient();
        await logActivity({
          supabase, weddingId, userId: user.id,
          action: !currentCompleted ? "Selesaikan tugasan" : "Batal selesai tugasan",
          entityType: "checklist", entityName: task.title,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    try {
      await deleteMutation.mutateAsync(taskId);
      toast({ title: "Dihapus!", description: "Tugasan telah dipadam.", variant: "default" });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "Padam tugasan", entityType: "checklist", entityName: task?.title });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await addTaskMutation.mutateAsync({ title: newTask.title, phase: newTask.phase });
      toast({ title: "Berjaya!", description: "Tugasan baru ditambah.", variant: "success" });
      setNewTask({ title: "", phase: "phase-1" });
      setIsDialogOpen(false);
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "Tambah tugasan", entityType: "checklist", entityName: added.title });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Senarai Semak</h1>
          <p className="text-muted-foreground">Jangan tertinggal sebarang persiapan penting.</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="icon"
          className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Timeline View */}
      <div className="relative space-y-12 pl-4 md:pl-0">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-[8.5rem] top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent hidden md:block" />

        {phases.map((phase, phaseIndex) => (
          <div key={phase.id} className="relative md:grid md:grid-cols-[8rem_1fr] gap-8">
            {/* Phase Title */}
            <div className="mb-4 md:mb-0 md:text-right sticky top-24 self-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium border border-secondary">
                <Clock className="h-3 w-3" />
                {phase.title}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {phase.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phaseIndex * 0.2 + index * 0.1 }}
                >
                  <div
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className={cn(
                      "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                      task.completed
                        ? "bg-primary/5 border-primary/20"
                        : "bg-white border-border hover:border-primary/50 hover:shadow-md"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shrink-0 z-10",
                        task.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 group-hover:border-primary"
                      )}
                    >
                      <AnimatePresence>
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Text */}
                    <span
                      className={cn(
                        "font-medium transition-all duration-300 z-10 flex-1",
                        task.completed
                          ? "text-muted-foreground line-through decoration-primary/50"
                          : "text-foreground"
                      )}
                    >
                      {task.title}
                    </span>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 z-10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Fill Effect */}
                    <motion.div
                      className="absolute inset-0 bg-primary/5"
                      initial={{ x: "-100%" }}
                      animate={{ x: task.completed ? "0%" : "-100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Tambah Tugasan">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Tugasan</label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Contoh: Beli cincin"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Fasa</label>
            <select
              value={newTask.phase}
              onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
              className="w-full h-12 px-3 rounded-2xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="phase-1">6 Bulan Sebelum</option>
              <option value="phase-2">3 Bulan Sebelum</option>
              <option value="phase-3">1 Bulan Sebelum</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={addTaskMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {addTaskMutation.isPending ? "Menyimpan..." : "Tambah"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
