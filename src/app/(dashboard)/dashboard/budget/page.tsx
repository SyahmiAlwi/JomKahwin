"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Wallet, TrendingUp, DollarSign, ShoppingBag, Coffee, Camera, Music } from "lucide-react";

// Mock Data
const initialExpenses = [
    { id: 1, category: "Lokasi & Katering", amount: 12000, total: 15000, icon: Coffee, color: "text-pink-500 bg-pink-100" },
    { id: 2, category: "Busana & Andaman", amount: 3500, total: 5000, icon: ShoppingBag, color: "text-purple-500 bg-purple-100" },
    { id: 3, category: "Fotografi", amount: 1500, total: 2000, icon: Camera, color: "text-blue-500 bg-blue-100" },
    { id: 4, category: "Hiburan", amount: 800, total: 1000, icon: Music, color: "text-orange-500 bg-orange-100" },
];

export default function BudgetPage() {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: "", amount: "", total: "" });
    const { toast } = useToast();
    const totalBudget = 25000;
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const percentage = Math.round((totalSpent / totalBudget) * 100);

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Bajet Majlis</h1>
                    <p className="text-muted-foreground">Urus kewangan majlis anda dengan bijak.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="icon" className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            {/* Visual Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card variant="gradient" className="p-8 relative overflow-hidden border-none shadow-2xl shadow-primary/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet className="h-48 w-48 text-primary-foreground" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-2">
                            <p className="text-primary-foreground/80 font-medium">Baki Bajet</p>
                            <h2 className="text-5xl font-bold text-white tracking-tight">
                                RM {(totalBudget - totalSpent).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-2 text-white/90 text-sm mt-2">
                                <TrendingUp className="h-4 w-4" />
                                <span>{100 - percentage}% masih ada untuk dibelanjakan</span>
                            </div>
                        </div>

                        {/* Circular Progress */}
                        <div className="flex justify-center md:justify-end">
                            <div className="relative h-32 w-32">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        className="text-white/20 stroke-current"
                                        strokeWidth="10"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        className="text-white stroke-current"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: percentage / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeDasharray="251.2"
                                        strokeDashoffset="0"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                                    <span className="text-2xl font-bold">{percentage}%</span>
                                    <span className="text-[10px] uppercase tracking-wider opacity-80">Digunakan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Expense Categories */}
            <div className="grid gap-4">
                <h3 className="text-xl font-heading font-bold text-foreground">Kategori Perbelanjaan</h3>
                {expenses.map((expense, index) => (
                    <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                    >
                        <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer border-border/50">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${expense.color}`}>
                                <expense.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-foreground truncate">{expense.category}</p>
                                    <p className="font-medium text-foreground">RM {expense.amount.toLocaleString()}</p>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="bg-primary h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(expense.amount / expense.total) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                    <span>{Math.round((expense.amount / expense.total) * 100)}% digunakan</span>
                                    <span>Daripada RM {expense.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Add Expense Dialog */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Tambah Perbelanjaan">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const newId = Math.max(...expenses.map(e => e.id)) + 1;
                    setExpenses([...expenses, {
                        id: newId,
                        category: newExpense.category,
                        amount: parseInt(newExpense.amount),
                        total: parseInt(newExpense.total),
                        icon: DollarSign,
                        color: "text-blue-500 bg-blue-100"
                    }]);
                    toast({ title: "Berjaya!", description: "Perbelanjaan baru ditambah.", variant: "success" });
                    setNewExpense({ category: "", amount: "", total: "" });
                    setIsDialogOpen(false);
                }} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Kategori</label>
                        <Input
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            placeholder="Contoh: Hantaran"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Jumlah Dibelanjakan (RM)</label>
                        <Input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            placeholder="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Bajet Keseluruhan (RM)</label>
                        <Input
                            type="number"
                            value={newExpense.total}
                            onChange={(e) => setNewExpense({ ...newExpense, total: e.target.value })}
                            placeholder="0"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Tambah
                    </Button>
                </form>
            </Dialog>
        </div>
    );
}
