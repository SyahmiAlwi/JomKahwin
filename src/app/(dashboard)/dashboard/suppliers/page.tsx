"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Phone, DollarSign, CheckCircle2, Clock, Star, Trash2, Edit3, Store, TrendingUp, Wallet } from "lucide-react";

type Category = "Katering" | "Fotografi" | "Videografi" | "Dekorasi" | "Busana" | "Pelamin" | "Hiburan" | "Lain-lain";
type Status = "Booked" | "Contacted" | "Shortlisted";

interface Vendor {
    id: number;
    name: string;
    category: Category;
    phone: string;
    estimatedPrice: number;
    depositPaid: number;
    status: Status;
    notes: string;
}

const CATEGORIES: Category[] = ["Katering", "Fotografi", "Videografi", "Dekorasi", "Busana", "Pelamin", "Hiburan", "Lain-lain"];

const CATEGORY_ICONS: Record<Category, string> = {
    Katering:   "🍽️",
    Fotografi:  "📸",
    Videografi: "🎬",
    Dekorasi:   "🌸",
    Busana:     "👗",
    Pelamin:    "💍",
    Hiburan:    "🎶",
    "Lain-lain":"📦",
};

const CATEGORY_COLORS: Record<Category, string> = {
    Katering:   "bg-amber-50 text-amber-700 border-amber-200",
    Fotografi:  "bg-sky-50 text-sky-700 border-sky-200",
    Videografi: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Dekorasi:   "bg-pink-50 text-pink-700 border-pink-200",
    Busana:     "bg-purple-50 text-purple-700 border-purple-200",
    Pelamin:    "bg-rose-50 text-rose-700 border-rose-200",
    Hiburan:    "bg-green-50 text-green-700 border-green-200",
    "Lain-lain":"bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_STYLES: Record<Status, { badge: string; icon: React.ElementType; label: string }> = {
    Booked:      { badge: "bg-green-100 text-green-700",  icon: CheckCircle2, label: "Ditempah" },
    Contacted:   { badge: "bg-blue-100 text-blue-700",    icon: Clock,        label: "Dihubungi" },
    Shortlisted: { badge: "bg-amber-100 text-amber-700",  icon: Star,         label: "Senarai Pendek" },
};

const INITIAL_VENDORS: Vendor[] = [
    { id: 1, name: "Katering Mak Cik Ros",    category: "Katering",   phone: "012-3456789", estimatedPrice: 8000, depositPaid: 2000, status: "Booked",      notes: "Nasi minyak & lauk pauk" },
    { id: 2, name: "Studio Kenangan Abadi",    category: "Fotografi",  phone: "011-9876543", estimatedPrice: 2500, depositPaid: 500,  status: "Booked",      notes: "8 jam coverage" },
    { id: 3, name: "Pelamin Seri Indah",       category: "Pelamin",    phone: "019-1122334", estimatedPrice: 3500, depositPaid: 1000, status: "Contacted",   notes: "Tema ungu pastel" },
    { id: 4, name: "Busana Pengantin Cahaya",  category: "Busana",     phone: "013-5544332", estimatedPrice: 1800, depositPaid: 0,    status: "Shortlisted", notes: "3 persalinan + makeup" },
    { id: 5, name: "Deco Sentuhan Impian",     category: "Dekorasi",   phone: "016-7788990", estimatedPrice: 2200, depositPaid: 500,  status: "Contacted",   notes: "Floral arrangement" },
];

const EMPTY_FORM = { name: "", category: "Katering" as Category, phone: "", estimatedPrice: "", depositPaid: "", status: "Shortlisted" as Status, notes: "" };

export default function SuppliersPage() {
    const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category | "Semua">("Semua");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const { toast } = useToast();

    const filtered = useMemo(() => vendors.filter(v => {
        const matchCat = activeCategory === "Semua" || v.category === activeCategory;
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    }), [vendors, activeCategory, search]);

    const totalEstimated = vendors.reduce((s, v) => s + v.estimatedPrice, 0);
    const totalDeposit   = vendors.reduce((s, v) => s + v.depositPaid, 0);
    const depositPct     = totalEstimated > 0 ? Math.round((totalDeposit / totalEstimated) * 100) : 0;
    const bookedCount    = vendors.filter(v => v.status === "Booked").length;

    const openAdd = () => {
        setEditingVendor(null);
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    };

    const openEdit = (v: Vendor) => {
        setEditingVendor(v);
        setForm({ name: v.name, category: v.category, phone: v.phone, estimatedPrice: String(v.estimatedPrice), depositPaid: String(v.depositPaid), status: v.status, notes: v.notes });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!form.name) return;
        const entry = {
            name: form.name,
            category: form.category,
            phone: form.phone,
            estimatedPrice: parseInt(form.estimatedPrice) || 0,
            depositPaid: parseInt(form.depositPaid) || 0,
            status: form.status,
            notes: form.notes,
        };
        if (editingVendor) {
            setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...entry } : v));
            toast({ title: "Dikemaskini!", description: "Maklumat pembekal dikemaskini.", variant: "success" });
        } else {
            const newId = Math.max(0, ...vendors.map(v => v.id)) + 1;
            setVendors([...vendors, { id: newId, ...entry }]);
            toast({ title: "Berjaya!", description: "Pembekal baru ditambah.", variant: "success" });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id: number) => {
        setVendors(vendors.filter(v => v.id !== id));
        toast({ title: "Dipadam", description: "Pembekal telah dibuang.", variant: "success" });
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Pembekal & Vendor</h1>
                    <p className="text-muted-foreground">Urus semua vendor dan pembekal perkahwinan anda.</p>
                </div>
                <Button onClick={openAdd} className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pembekal
                </Button>
            </div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card variant="gradient" className="p-8 relative overflow-hidden border-none shadow-2xl shadow-primary/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Store className="h-48 w-48 text-white" />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-3">
                            <p className="text-white/80 font-medium text-sm uppercase tracking-wider">Ringkasan Pembayaran</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold text-white">RM {totalDeposit.toLocaleString()}</h2>
                                <span className="text-white/70 text-sm">deposit dibayar</span>
                            </div>
                            <div className="space-y-1 text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 opacity-75" />
                                    <span>Anggaran Total: RM {totalEstimated.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Baki: RM {(totalEstimated - totalDeposit).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 md:justify-end">
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{vendors.length}</p>
                                <p className="text-white/70 text-xs mt-0.5">Jumlah Vendor</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{bookedCount}</p>
                                <p className="text-white/70 text-xs mt-0.5">Ditempah</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{depositPct}%</p>
                                <p className="text-white/70 text-xs mt-0.5">Deposit</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative z-10 mt-6">
                        <div className="flex justify-between text-white/70 text-xs mb-1.5">
                            <span>Deposit dibayar</span>
                            <span>{depositPct}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${depositPct}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Search & Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama pembekal..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["Semua", ...CATEGORIES] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat as typeof activeCategory)}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-200 ${
                                activeCategory === cat
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                    : "bg-white border-border/50 text-foreground/70 hover:border-primary/30"
                            }`}
                        >
                            {cat !== "Semua" && <span className="mr-1">{CATEGORY_ICONS[cat as Category]}</span>}
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vendor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filtered.map((vendor, index) => {
                        const catStyle = CATEGORY_COLORS[vendor.category];
                        const statusStyle = STATUS_STYLES[vendor.status];
                        const StatusIcon = statusStyle.icon;
                        const depositPct = vendor.estimatedPrice > 0
                            ? Math.round((vendor.depositPaid / vendor.estimatedPrice) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={vendor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                            >
                                <Card className="p-5 border-border/50 hover:shadow-md transition-shadow space-y-4">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl border shrink-0 ${catStyle}`}>
                                                {CATEGORY_ICONS[vendor.category]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-foreground truncate">{vendor.name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${catStyle}`}>
                                                    {vendor.category}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusStyle.badge}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusStyle.label}
                                        </span>
                                    </div>

                                    {/* Price row */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-xs text-muted-foreground">Anggaran Harga</p>
                                                <p className="font-bold text-foreground">RM {vendor.estimatedPrice.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <p className="text-xs text-muted-foreground">Deposit Dibayar</p>
                                                <p className="font-bold text-green-600">RM {vendor.depositPaid.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-green-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${depositPct}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{depositPct}% deposit</p>
                                    </div>

                                    {/* Phone & notes */}
                                    {(vendor.phone || vendor.notes) && (
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            {vendor.phone && (
                                                <p className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                                    {vendor.phone}
                                                </p>
                                            )}
                                            {vendor.notes && (
                                                <p className="text-xs line-clamp-1 opacity-80">{vendor.notes}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1 border-t border-border/50">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEdit(vendor)}
                                            className="flex-1 border-border/50 hover:bg-primary/5 hover:border-primary/30 text-xs h-8"
                                        >
                                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(vendor.id)}
                                            className="border-red-200 hover:bg-red-50 text-red-500 text-xs h-8 px-3"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="col-span-full">
                        <Card className="p-10 text-center border-border/50">
                            <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="font-medium text-foreground">Tiada pembekal dijumpai</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {search ? `Tiada hasil untuk "${search}"` : "Tekan 'Tambah Pembekal' untuk mulakan."}
                            </p>
                        </Card>
                    </div>
                )}
            </div>

            {/* Dialog */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editingVendor ? "Kemaskini Pembekal" : "Tambah Pembekal Baru"}
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Nama Pembekal / Syarikat</label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: Studio Kenangan Abadi"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Kategori</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value as Category })}
                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value as Status })}
                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="Shortlisted">Senarai Pendek</option>
                                <option value="Contacted">Dihubungi</option>
                                <option value="Booked">Ditempah</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">No. Telefon</label>
                        <Input
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            placeholder="012-3456789"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                <Wallet className="inline h-3.5 w-3.5 mr-1" />
                                Anggaran (RM)
                            </label>
                            <Input
                                type="number"
                                value={form.estimatedPrice}
                                onChange={e => setForm({ ...form, estimatedPrice: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-green-600" />
                                Deposit (RM)
                            </label>
                            <Input
                                type="number"
                                value={form.depositPaid}
                                onChange={e => setForm({ ...form, depositPaid: e.target.value })}
                                placeholder="0"
                            />
                        </div>
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
                        {editingVendor ? "Kemaskini Pembekal" : "Tambah Pembekal"}
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
