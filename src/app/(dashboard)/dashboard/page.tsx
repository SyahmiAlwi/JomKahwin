"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CheckSquare, Users, Wallet, Plus, Heart } from "lucide-react";
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
import { useWedding } from "@/components/providers/wedding-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function calcTimeLeft(dateStr: string): TimeLeft {
    const target = new Date(dateStr + "T00:00:00");
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

const EVENT_TYPES = ["Nikah", "Tunang", "Resepsi"] as const;

export default function DashboardPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { weddingId, isLoading: weddingLoading } = useWedding();

    const { data: events = [], isLoading: eventsLoading } = useEvents();
    const { data: guests = [] } = useGuests();
    const { data: categories = [] } = useBudgetCategories();
    const { data: tasks = [] } = useChecklistTasks();

    const totalBudget = categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalGuests = guests.reduce((sum, g) => sum + g.pax, 0);
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;

    const nextEvent = useMemo(
        () =>
            events
                .filter((e) => e.date && calcDaysLeft(e.date) >= 0)
                .sort((a, b) => calcDaysLeft(a.date!) - calcDaysLeft(b.date!))[0] ?? null,
        [events]
    );

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!nextEvent?.date) return;
        const tick = () => setTimeLeft(calcTimeLeft(nextEvent.date!));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [nextEvent?.date]);

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
            const newEvent = await addEvent.mutateAsync({
                name: newName.trim(),
                date: newDate,
                type: newType,
            });
            toast({ title: "Majlis berjaya ditambah!", variant: "default" });
            setDialogOpen(false);
            setNewName(""); setNewDate(""); setNewType(EVENT_TYPES[0]);
            if (weddingId && user) {
                const supabase = createClient();
                await logActivity({
                    supabase, weddingId, userId: user.id,
                    action: "Tambah majlis", entityType: "event", entityName: newEvent.name,
                });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Sila cuba lagi.";
            toast({ title: "Gagal menambah majlis", description: msg, variant: "error" });
        }
    };

    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split("@")[0] ??
        "Pengguna";

    if (weddingLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">

            {/* ── Hero Greeting ────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div
                    className="relative rounded-2xl overflow-hidden p-6"
                    style={{ background: "linear-gradient(135deg, #1A0818 0%, #2D1030 60%, #3A1538 100%)" }}
                >
                    {/* Batik overlay */}
                    <div className="absolute inset-0 bg-batik-dark pointer-events-none opacity-60" />
                    {/* Glow */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/25 blur-3xl pointer-events-none rounded-full -translate-y-1/2 translate-x-1/4" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-1">
                                Selamat Datang
                            </p>
                            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                                Hai, {displayName}!
                            </h1>
                            <p className="text-white/50 text-sm mt-1.5">
                                Semoga perancangan anda hari ini berjalan lancar.
                            </p>
                        </div>
                        <div className="hidden md:flex h-14 w-14 rounded-full bg-white/10 border border-white/20 items-center justify-center shrink-0">
                            <Heart className="h-6 w-6 text-primary fill-primary/40" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stats Row ────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
                {[
                    {
                        icon: Wallet,
                        label: "Bajet",
                        value: totalBudget > 0 ? `RM ${totalBudget.toLocaleString("ms-MY", { maximumFractionDigits: 0 })}` : "–",
                        color: "bg-rose-50 text-rose-500",
                    },
                    {
                        icon: CheckSquare,
                        label: "Tugasan",
                        value: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "–",
                        color: "bg-amber-50 text-amber-500",
                    },
                    {
                        icon: Users,
                        label: "Jemputan",
                        value: totalGuests > 0 ? String(totalGuests) : "–",
                        color: "bg-sky-50 text-sky-500",
                    },
                ].map(({ icon: Icon, label, value, color }) => (
                    <Card key={label} className="p-4 flex flex-col items-center gap-2 text-center border border-border">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                            <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Live Countdown ───────────────────────────────── */}
            {!eventsLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {nextEvent ? (
                        <Card
                            variant="gradient"
                            className="p-6 md:p-8 relative overflow-hidden"
                        >
                            {/* Shimmer */}
                            <div className="absolute inset-0 animate-shimmer pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                                <div className="md:min-w-[200px]">
                                    <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
                                        Kiraan Detik
                                    </p>
                                    <h2 className="text-xl md:text-2xl font-heading font-bold text-white leading-tight">
                                        {nextEvent.name}
                                    </h2>
                                    {nextEvent.date && (
                                        <p className="text-white/60 text-sm mt-1">{formatDateMY(nextEvent.date)}</p>
                                    )}
                                </div>

                                <div className="hidden md:block w-px h-16 bg-white/20" />

                                <div className="flex items-end gap-2 md:gap-4">
                                    {(
                                        [
                                            { value: timeLeft.days, label: "Hari" },
                                            { value: timeLeft.hours, label: "Jam" },
                                            { value: timeLeft.minutes, label: "Minit" },
                                            { value: timeLeft.seconds, label: "Saat" },
                                        ] as const
                                    ).map(({ value, label }, i) => (
                                        <div key={label} className="flex items-end gap-2 md:gap-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border border-white/20">
                                                    <span className="text-2xl md:text-3xl font-bold font-heading tabular-nums text-white">
                                                        {String(value).padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">
                                                    {label}
                                                </span>
                                            </div>
                                            {i < 3 && (
                                                <span className="text-white/40 text-2xl font-bold pb-6">:</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6 border-dashed border-2 border-primary/20 flex items-center gap-4 bg-white">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-2xl">💍</span>
                            </div>
                            <div>
                                <p className="font-heading font-semibold text-foreground">Tiada majlis akan datang</p>
                                <p className="text-sm text-muted-foreground">
                                    Tambah tarikh perkahwinan anda di bawah.
                                </p>
                            </div>
                        </Card>
                    )}
                </motion.div>
            )}

            {/* ── Events Grid ──────────────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-heading font-bold text-foreground">Majlis Anda</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventsLoading ? (
                        [0, 1].map((i) => (
                            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
                        ))
                    ) : (
                        events.map((event, index) => {
                            const daysLeft = event.date ? calcDaysLeft(event.date) : null;
                            const dateLabel = event.date ? formatDateMY(event.date) : "–";
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                >
                                    <Card
                                        variant="songket"
                                        className="h-full flex flex-col justify-between p-5 group hover:-translate-y-1 transition-transform duration-300"
                                    >
                                        <div className="relative z-10 flex justify-between items-start mb-3">
                                            <h3 className="text-base font-heading font-bold text-foreground">
                                                {event.name}
                                            </h3>
                                            {event.type && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0 ml-2">
                                                    {event.type}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative z-10">
                                            {daysLeft !== null ? (
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-3xl font-bold text-primary font-heading">
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

                    {/* Add new event */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: events.length * 0.08 }}
                    >
                        <Card
                            onClick={() => setDialogOpen(true)}
                            className="h-full flex flex-col items-center justify-center border-2 border-dashed border-primary/25 hover:border-primary/50 cursor-pointer transition-all group bg-white min-h-[7rem] p-5"
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                                <Plus className="h-6 w-6 text-primary/60 group-hover:text-primary" />
                            </div>
                            <p className="mt-3 font-medium text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                Tambah Majlis Baru
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── Add Majlis Dialog ─────────────────────────────── */}
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
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                            newType === type
                                                ? "bg-primary text-white border-primary shadow-rose-sm"
                                                : "bg-white text-foreground border-border hover:border-primary/40"
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
