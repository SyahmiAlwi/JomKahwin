"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Share2, Copy, Check } from "lucide-react";

export default function Screen10Value() {
  const { state, completeOnboarding } = useOnboarding();
  const [copiedLink, setCopiedLink] = useState(false);

  const totalBudget = 50000;
  const totalExpenses = state.demoTotal;
  const remaining = totalBudget - totalExpenses;
  const expenses = state.demoExpenses;

  const handleShare = async () => {
    const text = `Tengok bajet majlis aku! JomKahwin helps organize everything. ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bajet Majlis Aku",
          text: text,
        });
      } catch (e) {
        console.log("Share failed");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (e) {
        console.log("Copy failed");
      }
    }
  };

  const handleContinue = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={10} total={10} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-6"
      >
        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Ini lah bajet majlis anda!
          </h1>
          <p className="text-muted-foreground">
            Simpan, bagikan dengan pasangan, atau ubah nanti.
          </p>
        </div>

        {/* Budget Breakdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-lg bg-white border border-border p-4 space-y-4"
        >
          {/* Category Breakdown */}
          <div className="space-y-2">
            {expenses.map((expense, idx) => {
              const percentage = (expense.amount / totalBudget) * 100;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-foreground">{expense.category}</p>
                    <p className="text-primary font-bold">
                      RM {expense.amount.toLocaleString("en-MY")}
                    </p>
                  </div>
                  <div className="w-full h-2 bg-muted-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(0)}%
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="font-bold text-foreground">
                RM {totalExpenses.toLocaleString("en-MY")}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">Your Budget</p>
              <p className="font-bold text-foreground">
                RM {totalBudget.toLocaleString("en-MY")}
              </p>
            </div>
            <div className="flex justify-between text-base font-bold bg-primary/5 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
              <p className="text-foreground">Remaining</p>
              <p className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                RM {remaining.toLocaleString("en-MY")} ✓
              </p>
            </div>
          </div>
        </motion.div>

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          Masih ada RM {remaining.toLocaleString("en-MY")} for other categories. Good start! Sekarang bagikan dengan pasangan atau mulai add vendors.
        </motion.p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handleShare}
            variant={copiedLink ? "default" : "outline"}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" /> Bagikan dengan Pasangan
              </>
            )}
          </Button>
          <Button size="lg" className="w-full" onClick={handleContinue}>
            Buka Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
