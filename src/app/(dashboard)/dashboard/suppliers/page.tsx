"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
    Plus, Search, Phone, DollarSign, CheckCircle2, Clock, Star,
    Trash2, Edit3, Store, TrendingUp, Wallet, Link2,
} from "lucide-react";
import { useWedding } from "@/components/providers/wedding-provider";
import {
    useVendors, useAddVendor, useUpdateVendor, useDeleteVendor,
    type Vendor, type VendorInput,
} from "@/lib/supabase/queries/vendors";
import { useBudgetCategories } from "@/lib/supabase/queries/budget";
import { useLanguage, useT } from "@/lib/i18n/language-context";

type Category = "Katering" | "Fotografi" | "Videografi" | "Dekorasi" | "Busana" | "Pelamin" | "Hiburan" | "Lain-lain";
type Status = "Booked" | "Contacted" | "Shortlisted";

const CATEGORIES: Category[] = ["Katering", "Fotografi", "Videografi", "Dekorasi", "Busana", "Pelamin", "Hiburan", "Lain-lain"];

const CATEGORY_ICONS: Record<Category, string> = {
    Katering:    "🍽️",
    Fotografi:   "📸",
    Videografi:  "🎬",
    Dekorasi:    "🌸",
    Busana:      "👗",
    Pelamin:     "💍",
    Hiburan:     "🎶",
    "Lain-lain": "📦",
};

const CATEGORY_COLORS: Record<Category, string> = {
    Katering:    "bg-amber-50 text-amber-700 border-amber-200",
    Fotografi:   "bg-sky-50 text-sky-700 border-sky-200",
    Videografi:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    Dekorasi:    "bg-pink-50 text-pink-700 border-pink-200",
    Busana:      "bg-purple-50 text-purple-700 border-purple-200",
    Pelamin:     "bg-rose-50 text-rose-700 border-rose-200",
    Hiburan:     "bg-green-50 text-green-700 border-green-200",
    "Lain-lain": "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_STYLES: Record<Status, { badge: string; icon: React.ElementType }> = {
    Booked:      { badge: "bg-green-100 text-green-700",  icon: CheckCircle2 },
    Contacted:   { badge: "bg-blue-100 text-blue-700",    icon: Clock },
    Shortlisted: { badge: "bg-amber-100 text-amber-700",  icon: Star },
};

const EMPTY_FORM: {
    name: string;
    category: Category;
    phone: string;
    estimated_price: string;
    amount_paid: string;
    status: Status;
    notes: string;
    budget_category_id: string;
} = {
    name: "",
    category: "Katering",
    phone: "",
    estimated_price: "",
    amount_paid: "",
    status: "Shortlisted",
    notes: "",
    budget_category_id: "",
};

export default function SuppliersPage() {
    const { isLoading: weddingLoading } = useWedding();
    const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
    const { data: budgetCategories = [] } = useBudgetCategories();
    const { lang } = useLanguage();
    const t = useT();
    const numLocale = lang === "en" ? "en-GB" : "ms-MY";

    const addVendorMutation    = useAddVendor();
    const updateVendorMutation = useUpdateVendor();
    const deleteVendorMutation = useDeleteVendor();

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category | "Semua">("Semua");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const { toast } = useToast();

    const filtered = useMemo(() => vendors.filter(v => {
        const matchCat    = activeCategory === "Semua" || v.category === activeCategory;
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    }), [vendors, activeCategory, search]);

    const totalEstimated = vendors.reduce((s, v) => s + v.estimated_price, 0);
    const totalPaid      = vendors.reduce((s, v) => s + v.amount_paid, 0);
    const paidPct        = totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0;
    const bookedCount    = vendors.filter(v => v.status === "Booked").length;

    const openAdd = () => {
        setEditingVendorId(null);
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    };

    const openEdit = (v: Vendor) => {
        setEditingVendorId(v.id);
        setForm({
            name:               v.name,
            category:           v.category as Category,
            phone:              v.phone,
            estimated_price:    String(v.estimated_price),
            amount_paid:        String(v.amount_paid),
            status:             v.status as Status,
            notes:              v.notes,
            budget_category_id: v.budget_category_id ?? "",
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        const entry: VendorInput = {
            name:               form.name,
            category:           form.category,
            phone:              form.phone,
            estimated_price:    parseFloat(form.estimated_price) || 0,
            amount_paid:        parseFloat(form.amount_paid) || 0,
            status:             form.status,
            notes:              form.notes,
            budget_category_id: form.budget_category_id || null,
        };
        try {
            if (editingVendorId) {
                await updateVendorMutation.mutateAsync({ id: editingVendorId, ...entry });
                toast({ title: t("common.success"), description: t("vendors.updatedToast"), variant: "success" });
            } else {
                await addVendorMutation.mutateAsync(entry);
                toast({ title: t("common.success"), description: t("vendors.addedToast"), variant: "success" });
            }
            setIsDialogOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t("common.error");
            toast({ title: t("common.error"), description: msg, variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("vendors.confirmDelete"))) return;
        try {
            await deleteVendorMutation.mutateAsync(id);
            toast({ title: t("common.success"), description: t("vendors.deletedToast"), variant: "success" });
        } catch {
            toast({ title: t("common.error"), description: t("vendors.deleteFail"), variant: "error" });
        }
    };

    const isSaving = addVendorMutation.isPending || updateVendorMutation.isPending;

    if (weddingLoading || vendorsLoading) {
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
                    <h1 className="text-3xl font-heading font-bold text-foreground">{t("vendors.title")}</h1>
                    <p className="text-muted-foreground text-sm">{t("vendors.subtitle")}</p>
                </div>
                <Button onClick={openAdd} className="w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("vendors.addButton")}
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
                            <p className="text-white/80 font-medium text-sm uppercase tracking-wider">{t("vendors.summary")}</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-bold text-white">RM {totalPaid.toLocaleString(numLocale)}</h2>
                                <span className="text-white/70 text-sm">{t("vendors.paid")}</span>
                            </div>
                            <div className="space-y-1 text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 opacity-75" />
                                    <span>{t("vendors.estimateTotal", { amount: totalEstimated.toLocaleString(numLocale) })}</span>
                                </div>
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>{t("budget.balance", { amount: (totalEstimated - totalPaid).toLocaleString(numLocale) })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 md:justify-end">
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{vendors.length}</p>
                                <p className="text-white/70 text-xs mt-0.5">{t("vendors.totalVendors")}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{bookedCount}</p>
                                <p className="text-white/70 text-xs mt-0.5">{t("vendors.booked")}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl px-5 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{paidPct}%</p>
                                <p className="text-white/70 text-xs mt-0.5">{t("vendors.paidPct")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative z-10 mt-6">
                        <div className="flex justify-between text-white/70 text-xs mb-1.5">
                            <span>{t("vendors.totalPaid")}</span>
                            <span>{paidPct}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${paidPct}%` }}
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
                        placeholder={t("vendors.searchPlaceholder")}
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
                            {cat === "Semua" ? t("common.all") : t(`vendorCat.${cat}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vendor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filtered.map((vendor, index) => {
                        const catStyle    = CATEGORY_COLORS[vendor.category as Category] ?? "bg-slate-50 text-slate-700 border-slate-200";
                        const statusStyle = STATUS_STYLES[vendor.status as Status] ?? STATUS_STYLES.Shortlisted;
                        const StatusIcon  = statusStyle.icon;
                        const vendorPaidPct = vendor.estimated_price > 0
                            ? Math.round((vendor.amount_paid / vendor.estimated_price) * 100)
                            : 0;
                        const linkedBudgetCat = budgetCategories.find(c => c.id === vendor.budget_category_id);

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
                                                {CATEGORY_ICONS[vendor.category as Category] ?? "📦"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-foreground truncate">{vendor.name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${catStyle}`}>
                                                    {t(`vendorCat.${vendor.category as Category}`)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusStyle.badge}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {t(`vendorStatus.${vendor.status as Status}`)}
                                        </span>
                                    </div>

                                    {/* Price row */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-xs text-muted-foreground">{t("vendors.field.estimatedPrice")}</p>
                                                <p className="font-bold text-foreground">RM {vendor.estimated_price.toLocaleString(numLocale)}</p>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <p className="text-xs text-muted-foreground">{t("vendors.field.amountPaid")}</p>
                                                <p className="font-bold text-green-600">RM {vendor.amount_paid.toLocaleString(numLocale)}</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-green-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${vendorPaidPct}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{vendorPaidPct}{t("vendors.pct")}</p>
                                    </div>

                                    {/* Budget link badge */}
                                    {linkedBudgetCat && (
                                        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
                                            <Link2 className="h-3 w-3 shrink-0" />
                                            <span>{t("vendors.budgetLink", { name: linkedBudgetCat.name })}</span>
                                        </div>
                                    )}

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
                                            {t("common.edit")}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(vendor.id)}
                                            disabled={deleteVendorMutation.isPending}
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
                            <p className="font-medium text-foreground">{t("vendors.noResults")}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {search ? t("vendors.noResultsFor", { term: search }) : t("vendors.pressToStart")}
                            </p>
                        </Card>
                    </div>
                )}
            </div>

            {/* Dialog */}
            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={editingVendorId ? t("vendors.dialog.editTitle") : t("vendors.dialog.addTitle")}
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">{t("vendors.form.name")}</label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder={t("vendors.form.namePlaceholder")}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">{t("vendors.form.category")}</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value as Category })}
                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {t(`vendorCat.${c}`)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">{t("vendors.form.status")}</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value as Status })}
                                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="Shortlisted">{t("vendorStatus.Shortlisted")}</option>
                                <option value="Contacted">{t("vendorStatus.Contacted")}</option>
                                <option value="Booked">{t("vendorStatus.Booked")}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">{t("vendors.form.phone")}</label>
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
                                {t("vendors.form.estimated")}
                            </label>
                            <Input
                                type="number"
                                value={form.estimated_price}
                                onChange={e => setForm({ ...form, estimated_price: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-green-600" />
                                {t("vendors.form.paid")}
                            </label>
                            <Input
                                type="number"
                                value={form.amount_paid}
                                onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Budget category link */}
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                            <Link2 className="inline h-3.5 w-3.5 mr-1 text-primary" />
                            {t("vendors.form.budgetLink")}
                            <span className="ml-1 text-muted-foreground font-normal">{t("vendors.form.optional")}</span>
                        </label>
                        <select
                            value={form.budget_category_id}
                            onChange={e => setForm({ ...form, budget_category_id: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">{t("vendors.form.budgetLinkNone")}</option>
                            {budgetCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {form.budget_category_id && (
                            <p className="text-xs text-primary mt-1">
                                {t("vendors.form.budgetLinkHint")}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">{t("vendors.form.notes")}</label>
                        <Input
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder={t("vendors.form.notesPlaceholder")}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isSaving ? t("common.saving") : editingVendorId ? t("vendors.form.submitEdit") : t("vendors.form.submitAdd")}
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
