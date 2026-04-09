"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Wallet,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ArrowUpCircle,
  History,
} from "lucide-react";
import {
  useBudgetCategories,
  useBudgetExpenses,
  useBudgetFunds,
  useAddExpenseCategory,
  useAddFund,
} from "@/lib/supabase/queries/budget";
import { useWedding } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";

type DialogMode = "expense" | "fund";

export default function BudgetPage() {
  const { weddingId, isLoading: weddingLoading } = useWedding();
  const { user } = useUser();
  const { data: categories = [] } = useBudgetCategories();
  const { data: expenses = [] } = useBudgetExpenses();
  const { data: funds = [] } = useBudgetFunds();

  const addExpenseMutation = useAddExpenseCategory();
  const addFundMutation = useAddFund();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("expense");
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", total: "" });
  const [newFund, setNewFund] = useState({ source: "", amount: "" });

  const { toast } = useToast();

  // Join categories with their aggregated spent amounts
  const displayExpenses = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        category: cat.name,
        amount: expenses
          .filter((e) => e.category_id === cat.id)
          .reduce((sum, e) => sum + e.amount, 0),
        total: cat.allocated,
        color: cat.color || "text-blue-500 bg-blue-100",
        icon: DollarSign,
      })),
    [categories, expenses]
  );

  const displayFunds = useMemo(
    () =>
      funds.map((f) => ({
        id: f.id,
        source: f.description,
        amount: f.amount,
        date: f.date,
      })),
    [funds]
  );

  // Summary calculations
  const totalBudget = displayFunds.reduce((acc, f) => acc + f.amount, 0);
  const totalSpent = displayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remainingBudget = totalBudget - totalSpent;

  const openDialog = (mode: DialogMode) => {
    setDialogMode(mode);
    setIsDialogOpen(true);
  };

  const handleAddExpense = async () => {
    try {
      const cat = await addExpenseMutation.mutateAsync({
        name: newExpense.category,
        amount: parseInt(newExpense.amount) || 0,
        total: parseInt(newExpense.total) || 0,
      });
      toast({ title: "Berjaya!", description: "Perbelanjaan baru ditambah.", variant: "success" });
      setNewExpense({ category: "", amount: "", total: "" });
      setIsDialogOpen(false);
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "Tambah kategori bajet", entityType: "budget", entityName: cat.name });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ralat";
      toast({ title: "Ralat!", description: msg, variant: "error" });
    }
  };

  const handleAddFund = async () => {
    try {
      await addFundMutation.mutateAsync({
        source: newFund.source,
        amount: parseInt(newFund.amount) || 0,
      });
      toast({ title: "Berjaya!", description: "Dana baru ditambah.", variant: "success" });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "Tambah dana tabung", entityType: "budget", entityName: newFund.source });
      }
      setNewFund({ source: "", amount: "" });
      setIsDialogOpen(false);
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Bajet & Tabung</h1>
          <p className="text-muted-foreground">Urus dana perkahwinan dan perbelanjaan anda.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openDialog("fund")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Tambah Dana
          </Button>
          <Button
            onClick={() => openDialog("expense")}
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Belanja
          </Button>
        </div>
      </div>

      {/* Visual Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          variant="gradient"
          className="p-8 relative overflow-hidden border-none shadow-2xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="h-48 w-48 text-primary-foreground" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <p className="text-primary-foreground/80 font-medium">Tabung Kahwin (Terkumpul)</p>
              <h2 className="text-5xl font-bold text-white tracking-tight">
                RM {totalBudget.toLocaleString()}
              </h2>
              <div className="flex flex-col gap-1 text-white/90 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 opacity-75" />
                  <span>Belanja: RM {totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>Baki: RM {remainingBudget.toLocaleString()}</span>
                </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense Categories (Left 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Kategori Perbelanjaan
          </h3>
          {displayExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer border-border/50">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${expense.color}`}
                >
                  <expense.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-foreground truncate">{expense.category}</p>
                    <p className="font-medium text-foreground">
                      RM {expense.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-primary h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${expense.total > 0 ? (expense.amount / expense.total) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>
                      {expense.total > 0
                        ? Math.round((expense.amount / expense.total) * 100)
                        : 0}
                      % digunakan
                    </span>
                    <span>Daripada RM {expense.total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Fund History (Right 1/3) */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            Rekod Tabung
          </h3>
          <div className="space-y-3">
            {displayFunds.map((fund, index) => (
              <motion.div
                key={fund.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <div className="bg-white p-4 rounded-xl border border-border/50 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-sm text-foreground">{fund.source}</p>
                    <p className="text-xs text-muted-foreground">{fund.date}</p>
                  </div>
                  <span className="text-accent-foreground font-bold text-sm bg-accent/90 px-2 py-1 rounded-md shadow-sm">
                    + RM {fund.amount.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog — dynamic content based on mode */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={dialogMode === "expense" ? "Tambah Perbelanjaan" : "Masuk Dana Tabung"}
      >
        {dialogMode === "expense" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddExpense();
            }}
            className="space-y-4"
          >
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
              <label className="text-sm font-medium text-foreground mb-1 block">
                Jumlah Dibelanjakan (RM)
              </label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Bajet Keseluruhan (RM)
              </label>
              <Input
                type="number"
                value={newExpense.total}
                onChange={(e) => setNewExpense({ ...newExpense, total: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={addExpenseMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {addExpenseMutation.isPending ? "Menyimpan..." : "Tambah Belanja"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddFund();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Sumber Dana</label>
              <Input
                value={newFund.source}
                onChange={(e) => setNewFund({ ...newFund, source: e.target.value })}
                placeholder="Contoh: Gaji Bulan Ini, Simpanan"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Jumlah (RM)</label>
              <Input
                type="number"
                value={newFund.amount}
                onChange={(e) => setNewFund({ ...newFund, amount: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={addFundMutation.isPending}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {addFundMutation.isPending ? "Menyimpan..." : "Simpan Dana"}
            </Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
