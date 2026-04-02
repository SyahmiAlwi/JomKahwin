"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Clock, User, FileText, Trash2, Edit3, CalendarDays, ChevronDown } from "lucide-react";

type Category = "Solemnization" | "Resepsi" | "Doa" | "Makan" | "Hiburan" | "Lain-lain";

interface Slot {
    id: number;
    time: string;
    activity: string;
    pic: string;
    notes: string;
    category: Category;
}

const CATEGORY_STYLES: Record<Category, { bg: string; text: string; badge: string; dot: string }> = {
    Solemnization: { bg: "bg-rose-50", text: "text-rose-700", badge: "bg-rose-100 text-rose-700", dot: "bg-rose-400" },
    Resepsi:       { bg: "bg-pink-50",  text: "text-pink-700",  badge: "bg-pink-100 text-pink-700",  dot: "bg-pink-400"  },
    Doa:           { bg: "bg-purple-50",text: "text-purple-700",badge: "bg-purple-100 text-purple-700",dot: "bg-purple-400"},
    Makan:         { bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
    Hiburan:       { bg: "bg-sky-50",   text: "text-sky-700",   badge: "bg-sky-100 text-sky-700",    dot: "bg-sky-400"   },
    "Lain-lain":   { bg: "bg-slate-50", text: "text-slate-700", badge: "bg-slate-100 text-slate-600",dot: "bg-slate-400" },
};

const CATEGORIES: Category[] = ["Solemnization", "Resepsi", "Doa", "Makan", "Hiburan", "Lain-lain"];

const initialSlots: Slot[] = [
    { id: 1, time: "09:00", activity: "Akad Nikah", pic: "Tok Kadi", notes: "Sediakan saksi dan wali", category: "Solemnization" },
    { id: 2, time: "10:30", activity: "Doa Selamat", pic: "Ustaz Razak", notes: "Bacaan Al-Fatihah & doa ringkas", category: "Doa" },
    { id: 3, time: "11:00", activity: "Persandingan", pic: "Pengapit", notes: "Pengantin duduk di pelamin", category: "Resepsi" },
    { id: 4, time: "12:00", activity: "Makan Tengah Hari", pic: "Katering", notes: "Hidangan untuk 300 tetamu", category: "Makan" },
    { id: 5, time: "14:00", activity: "Persembahan Kompang", pic: "Kumpulan Kompang Jaya", notes: "30 minit persembahan", category: "Hiburan" },
    { id: 6, time: "15:00", activity: "Sesi Bergambar", pic: "Fotografer", notes: "Gambar keluarga & tetamu rapat", category: "Lain-lain" },
];

const EMPTY_FORM = { time: "", activity: "", pic: "", notes: "", category: "Resepsi" as Category };

export default function TimetablePage() {
    const [slots, setSlots] = useState<Slot[]>(initialSlots);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const { toast } = useToast();

    const sorted = [...slots].sort((a, b) => a.time.localeCompare(b.time));

    const openAdd = () => {
        setEditingSlot(null);
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    };

    const openEdit = (slot: Slot) => {
        setEditingSlot(slot);
        setForm({ time: slot.time, activity: slot.activity, pic: slot.pic, notes: slot.notes, category: slot.category });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!form.time || !form.activity) return;
        if (editingSlot) {
            setSlots(slots.map(s => s.id === editingSlot.id ? { ...s, ...form } : s));
            toast({ title: "Dikemaskini!", description: "Slot jadual telah dikemaskini.", variant: "success" });
        } else {
            const newId = Math.max(0, ...slots.map(s => s.id)) + 1;
            setSlots([...slots, { id: newId, ...form }]);
            toast({ title: "Berjaya!", description: "Slot baru ditambah ke jadual.", variant: "success" });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setSlots(slots.filter(s => s.id !== id));
        toast({ title: "Dipadam", description: "Slot telah dibuang daripada jadual.", variant: "success" });
    };

    const formatTime12 = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        const ampm = h >= 12 ? "PTG" : "PGI";
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Jadual Hari H</h1>
                    <p className="text-muted-foreground">Urus aturcara dan rundown majlis anda.</p>
                </div>
                <Button onClick={openAdd} className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Slot
                </Button>
            </div>

            {/* Summary bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card variant="gradient" className="p-6 border-none shadow-2xl shadow-primary/10">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <CalendarDays className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white/80 text-xs uppercase tracking-wider">Jumlah Slot</p>
                                <p className="text-white font-bold text-xl">{slots.length}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-auto">
                            {CATEGORIES.map(cat => {
                                const count = slots.filter(s => s.category === cat).length;
                                if (count === 0) return null;
                                const style = CATEGORY_STYLES[cat];
                                return (
                                    <span key={cat} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                        {cat} ({count})
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[38px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden md:block" />

                <div className="space-y-4">
                    <AnimatePresence>
                        {sorted.map((slot, index) => {
                            const style = CATEGORY_STYLES[slot.category];
                            const isExpanded = expandedId === slot.id;

                            return (
                                <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <div className="flex gap-4 md:gap-6 items-start">
                                        {/* Time bubble */}
                                        <div className="flex flex-col items-center shrink-0 w-[76px]">
                                            <div className={`h-10 w-16 rounded-xl ${style.bg} ${style.text} flex items-center justify-center text-xs font-bold border border-white shadow-sm z-10`}>
                                                {formatTime12(slot.time)}
                                            </div>
                                        </div>

                                        {/* Card */}
                                        <Card className={`flex-1 p-4 border-border/50 cursor-pointer transition-all duration-200 ${isExpanded ? "shadow-md" : ""}`}
                                            onClick={() => setExpandedId(isExpanded ? null : slot.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${style.dot}`} />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-foreground truncate">{slot.activity}</p>
                                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                                                                {slot.category}
                                                            </span>
                                                            {slot.pic && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <User className="h-3 w-3" />
                                                                    {slot.pic}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                                            {slot.notes && (
                                                                <p className="text-sm text-muted-foreground flex gap-2">
                                                                    <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                                                                    {slot.notes}
                                                                </p>
                                                            )}
                                                            <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => openEdit(slot)}
                                                                    className="border-border/50 hover:bg-primary/5 hover:border-primary/30 text-xs h-8"
                                                                >
                                                                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(slot.id)}
                                                                    className="border-red-200 hover:bg-red-50 text-red-500 text-xs h-8"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                                    Padam
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {slots.length === 0 && (
                        <Card className="p-10 text-center border-border/50">
                            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="font-medium text-foreground">Tiada slot lagi</p>
                            <p className="text-sm text-muted-foreground mt-1">Tekan "Tambah Slot" untuk mulakan jadual hari H anda.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editingSlot ? "Kemaskini Slot" : "Tambah Slot Baru"}
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-foreground mb-1 block">Masa</label>
                            <Input
                                type="time"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-foreground mb-1 block">Kategori</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value as Category })}
                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nama Aktiviti</label>
                        <Input
                            value={form.activity}
                            onChange={e => setForm({ ...form, activity: e.target.value })}
                            placeholder="Contoh: Akad Nikah"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">PIC (Orang Bertanggungjawab)</label>
                        <Input
                            value={form.pic}
                            onChange={e => setForm({ ...form, pic: e.target.value })}
                            placeholder="Contoh: Abang Long, Tok Kadi"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nota</label>
                        <Input
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Sebarang nota tambahan..."
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {editingSlot ? "Kemaskini Slot" : "Tambah Slot"}
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
