"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Edit3, Heart, Clock, Sparkles } from "lucide-react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
    const prev = useRef(value);
    const changed = prev.current !== value;
    useEffect(() => { prev.current = value; }, [value]);

    const display = String(value).padStart(2, "0");

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20 md:w-28 md:h-28">
                <div className="w-full h-full rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-lg shadow-primary/10 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={value}
                            initial={changed ? { y: -40, opacity: 0 } : false}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="text-3xl md:text-5xl font-bold text-foreground font-heading tabular-nums"
                        >
                            {display}
                        </motion.span>
                    </AnimatePresence>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground/70 uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function CountdownPage() {
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [eventName, setEventName] = useState("Majlis Perkahwinan");
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formDate, setFormDate] = useState("");
    const [formName, setFormName] = useState("");
    const [isPast, setIsPast] = useState(false);
    const { toast } = useToast();

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("jk_wedding_date");
        const savedName = localStorage.getItem("jk_wedding_name");
        if (saved) {
            setTargetDate(new Date(saved));
            setFormDate(new Date(saved).toISOString().split("T")[0]);
        }
        if (savedName) {
            setEventName(savedName);
            setFormName(savedName);
        }
    }, []);

    // Tick every second
    useEffect(() => {
        if (!targetDate) return;
        const tick = () => {
            const tl = calculateTimeLeft(targetDate);
            setTimeLeft(tl);
            setIsPast(targetDate.getTime() <= Date.now());
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    const handleSave = () => {
        if (!formDate) return;
        const d = new Date(formDate + "T00:00:00");
        setTargetDate(d);
        setEventName(formName || "Majlis Perkahwinan");
        localStorage.setItem("jk_wedding_date", d.toISOString());
        localStorage.setItem("jk_wedding_name", formName || "Majlis Perkahwinan");
        setIsDialogOpen(false);
        toast({ title: "Berjaya!", description: "Tarikh perkahwinan disimpan.", variant: "success" });
    };

    const openDialog = () => {
        setFormName(eventName);
        setIsDialogOpen(true);
    };

    const formattedDate = targetDate
        ? targetDate.toLocaleDateString("ms-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : null;

    const totalDaysFromNow = targetDate
        ? Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Kiraan Detik</h1>
                    <p className="text-muted-foreground">Hitung mundur menuju hari bahagia anda.</p>
                </div>
                <Button onClick={openDialog} className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 w-fit">
                    <Edit3 className="h-4 w-4 mr-2" />
                    {targetDate ? "Tukar Tarikh" : "Tetapkan Tarikh"}
                </Button>
            </div>

            {targetDate ? (
                <>
                    {/* Hero Countdown Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card variant="gradient" className="p-8 md:p-12 relative overflow-hidden border-none shadow-2xl shadow-primary/20 text-center">
                            {/* Background decoration */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <Heart className="absolute top-4 right-6 h-32 w-32 text-white/10 rotate-12" />
                                <Sparkles className="absolute bottom-4 left-6 h-20 w-20 text-white/10 -rotate-12" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                {isPast ? (
                                    <div className="space-y-3">
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Heart className="h-16 w-16 text-white mx-auto fill-white" />
                                        </motion.div>
                                        <h2 className="text-4xl font-heading font-bold text-white">Tahniah!</h2>
                                        <p className="text-white/90 text-lg">Hari istimewa anda telah tiba. Semoga berbahagia!</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-white/80 text-sm uppercase tracking-widest font-medium mb-1">Menuju ke</p>
                                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">{eventName}</h2>
                                            {formattedDate && (
                                                <p className="text-white/70 mt-1 text-sm">{formattedDate}</p>
                                            )}
                                        </div>

                                        {/* Countdown Units */}
                                        <div className="flex items-end justify-center gap-3 md:gap-6 flex-wrap">
                                            <FlipUnit value={timeLeft.days} label="Hari" />
                                            <span className="text-4xl font-bold text-white/60 pb-8">:</span>
                                            <FlipUnit value={timeLeft.hours} label="Jam" />
                                            <span className="text-4xl font-bold text-white/60 pb-8">:</span>
                                            <FlipUnit value={timeLeft.minutes} label="Minit" />
                                            <span className="text-4xl font-bold text-white/60 pb-8">:</span>
                                            <FlipUnit value={timeLeft.seconds} label="Saat" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: "Jumlah Hari Lagi", value: totalDaysFromNow.toString(), icon: Calendar, color: "text-pink-500 bg-pink-50" },
                            { label: "Minggu Lagi", value: Math.floor(totalDaysFromNow / 7).toString(), icon: Clock, color: "text-purple-500 bg-purple-50" },
                            { label: "Bulan Lagi", value: Math.floor(totalDaysFromNow / 30).toString(), icon: Heart, color: "text-rose-500 bg-rose-50" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                            >
                                <Card className="p-5 text-center border-border/50">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Event info card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="p-6 border-border/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Heart className="h-6 w-6 text-primary fill-primary/30" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">{eventName}</h3>
                                    <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formattedDate}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openDialog}
                                    className="ml-auto border-border/50 hover:bg-primary/5 hover:border-primary/30"
                                >
                                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                                    Edit
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </>
            ) : (
                /* Empty state */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-12 text-center border-border/50 space-y-6">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Heart className="h-10 w-10 text-primary fill-primary/30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-heading font-bold text-foreground">Tetapkan Tarikh Perkahwinan</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Masukkan tarikh majlis anda untuk mula mengira detik menuju hari bahagia!
                            </p>
                        </div>
                        <Button onClick={openDialog} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                            <Calendar className="h-4 w-4 mr-2" />
                            Tetapkan Tarikh
                        </Button>
                    </Card>
                </motion.div>
            )}

            {/* Dialog */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Tetapkan Tarikh Majlis">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nama Majlis</label>
                        <Input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Contoh: Majlis Perkahwinan Syahmi & Aina"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Tarikh Majlis</label>
                        <Input
                            type="date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Heart className="h-4 w-4 mr-2" />
                        Simpan Tarikh
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
