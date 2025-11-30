"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Check, Plus, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const initialTasks = [
    {
        id: "phase-1",
        title: "6 Bulan Sebelum",
        tasks: [
            { id: 1, title: "Tetapkan tarikh nikah & sanding", completed: true },
            { id: 2, title: "Tempah lokasi majlis", completed: true },
            { id: 3, title: "Pilih tema & warna baju", completed: false },
        ]
    },
    {
        id: "phase-2",
        title: "3 Bulan Sebelum",
        tasks: [
            { id: 4, title: "Hadiri kursus kahwin", completed: false },
            { id: 5, title: "Tempah jurusolek & jurugambar", completed: false },
            { id: 6, title: "Hantar borang nikah", completed: false },
        ]
    },
    {
        id: "phase-3",
        title: "1 Bulan Sebelum",
        tasks: [
            { id: 7, title: "Edarkan kad jemputan", completed: false },
            { id: 8, title: "Fitting baju terakhir", completed: false },
        ]
    }
];

export default function ChecklistPage() {
    const [phases, setPhases] = useState(initialTasks);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", phase: "phase-1" });
    const { toast } = useToast();

    const toggleTask = (phaseId: string, taskId: number) => {
        setPhases(phases.map(phase => {
            if (phase.id === phaseId) {
                return {
                    ...phase,
                    tasks: phase.tasks.map(task =>
                        task.id === taskId ? { ...task, completed: !task.completed } : task
                    )
                };
            }
            return phase;
        }));
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Senarai Semak</h1>
                    <p className="text-muted-foreground">Jangan tertinggal sebarang persiapan penting.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="icon" className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            {/* Timeline View */}
            <div className="relative space-y-12 pl-4 md:pl-0">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-[8.5rem] top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent hidden md:block" />

                {phases.map((phase, phaseIndex) => (
                    <div key={phase.id} className="relative md:grid md:grid-cols-[8rem_1fr] gap-8">
                        {/* Phase Title (Sticky on Desktop) */}
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
                                        onClick={() => toggleTask(phase.id, task.id)}
                                        className={cn(
                                            "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                                            task.completed
                                                ? "bg-primary/5 border-primary/20"
                                                : "bg-white border-border hover:border-primary/50 hover:shadow-md"
                                        )}
                                    >
                                        {/* Checkbox */}
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shrink-0 z-10",
                                            task.completed
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "border-muted-foreground/30 group-hover:border-primary"
                                        )}>
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
                                        <span className={cn(
                                            "font-medium transition-all duration-300 z-10",
                                            task.completed ? "text-muted-foreground line-through decoration-primary/50" : "text-foreground"
                                        )}>
                                            {task.title}
                                        </span>

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
                <form onSubmit={(e) => {
                    e.preventDefault();
                    setPhases(phases.map(phase => {
                        if (phase.id === newTask.phase) {
                            const newId = Math.max(...phase.tasks.map(t => t.id)) + 1;
                            return {
                                ...phase,
                                tasks: [...phase.tasks, { id: newId, title: newTask.title, completed: false }]
                            };
                        }
                        return phase;
                    }));
                    toast({ title: "Berjaya!", description: "Tugasan baru ditambah.", variant: "success" });
                    setNewTask({ title: "", phase: "phase-1" });
                    setIsDialogOpen(false);
                }} className="space-y-4">
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
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Tambah
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
