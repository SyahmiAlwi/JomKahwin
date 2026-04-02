"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { CheckSquare, Users, Wallet, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/providers/user-provider";
import { useGuests } from "@/lib/supabase/queries/guests";
import { useBudgetCategories } from "@/lib/supabase/queries/budget";
import { useChecklistTasks } from "@/lib/supabase/queries/checklist";
import {
    useEvents,
    useAddEvent,
    calcDaysLeft,
    formatDateMY,
} from "@/lib/supabase/queries/events";

const EVENT_TYPES = ["Nikah", "Tunang", "Resepsi"] as const;

export default function DashboardPage() {
    const { toast } = useToast();
    const { user } = useUser();

    // ── Data queries ──────────────────────────────────────────
    const { data: events = [], isLoading: eventsLoading } = useEvents();
    const { data: guests = [] } = useGuests();
    const { data: categories = [] } = useBudgetCategories();
    const { data: tasks = [] } = useChecklistTasks();

    // ── Derived stats ─────────────────────────────────────────
    const totalBudget = categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalGuests = guests.reduce((sum, g) => sum + g.pax, 0);
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;

    // ── Add-event dialog state ────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newType, setNewType] = useState<string>(EVENT_TYPES[0]);

    const addEvent = useAddEvent();

    const handleAddEvent = async () => {
        if (!newName.trim() || !newDate) {
            toast({ title: "Sila isi semua maklumat majlis.", variant: "error" });
            return;
        }
        try {
            await addEvent.mutateAsync({
                name: newName.trim(),
                date: newDate,
                type: newType,
            });
            toast({ title: "Majlis berjaya ditambah!", variant: "default" });
            setDialogOpen(false);
            setNewName("");
            setNewDate("");
            setNewType(EVENT_TYPES[0]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sila cuba lagi.";
            toast({ title: "Gagal menambah majlis", description: msg, variant: "error" });
        }
    };

    // ── Display name ──────────────────────────────────────────
    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split("@")[0] ??
        "Pengguna";

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                        Hai, {displayName}
                    </h1>
                </div>
            </div>

            {/* Countdown Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-foreground">Majlis Anda</h2>
                    <Button variant="ghost" className="text-primary hover:bg-primary/5">Lihat Semua</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventsLoading ? (
                        /* skeleton placeholders */
                        [0, 1].map((i) => (
                            <div
                                key={i}
                                className="h-28 rounded-2xl bg-muted/50 animate-pulse"
                            />
                        ))
                    ) : (
                        events.map((event, index) => {
                            const daysLeft = event.date ? calcDaysLeft(event.date) : null;
                            const dateLabel = event.date ? formatDateMY(event.date) : "–";
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        variant="songket"
                                        className="h-full flex flex-col justify-between p-4 group hover:-translate-y-1 transition-transform duration-300"
                                    >
                                        <div className="relative z-10 flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-heading font-bold text-foreground">
                                                {event.name}
                                            </h3>
                                            {event.type && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                                                    {event.type}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative z-10">
                                            {daysLeft !== null ? (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-primary">
                                                        {daysLeft >= 0 ? daysLeft : 0}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {daysLeft >= 0 ? "hari lagi" : "sudah berlalu"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Tarikh belum ditetapkan</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">{dateLabel}</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}

                    {/* Add new event card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: events.length * 0.1 }}
                    >
                        <Card
                            variant="glass"
                            onClick={() => setDialogOpen(true)}
                            className="h-full flex flex-col items-center justify-center border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-all group bg-white/40 min-h-[7rem]"
                        >
                            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <p className="mt-4 font-medium text-lg text-muted-foreground group-hover:text-primary">
                                Tambah Majlis Baru
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bajet</p>
                        <p className="text-xl font-bold text-foreground">
                            {totalBudget > 0
                                ? `RM ${totalBudget.toLocaleString("ms-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                : "–"}
                        </p>
                    </div>
                </Card>

                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tugasan</p>
                        <p className="text-xl font-bold text-foreground">
                            {totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : "–"}
                        </p>
                    </div>
                </Card>

                <Card variant="glass" className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jemputan</p>
                        <p className="text-xl font-bold text-foreground">
                            {totalGuests > 0 ? totalGuests : "–"}
                        </p>
                    </div>
                </Card>
            </section>

            {/* Add Majlis Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">Tambah Majlis Baru</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="event-name">Nama Majlis</Label>
                            <Input
                                id="event-name"
                                placeholder="cth. Majlis Nikah"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="event-date">Tarikh</Label>
                            <Input
                                id="event-date"
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Jenis Majlis</Label>
                            <div className="flex gap-2">
                                {EVENT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewType(type)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                                            newType === type
                                                ? "bg-primary text-white border-primary"
                                                : "bg-background text-foreground border-input hover:border-primary/50"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDialogOpen(false)}
                            disabled={addEvent.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleAddEvent}
                            disabled={addEvent.isPending}
                        >
                            {addEvent.isPending ? "Menyimpan…" : "Simpan Majlis"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
