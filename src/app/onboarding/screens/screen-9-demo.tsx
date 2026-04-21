"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { BUDGET_CATEGORIES, DEFAULT_BUDGET_AMOUNTS } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Check } from "lucide-react";
import { useLanguage, useT } from "@/lib/i18n/language-context";

type BudgetItem = { id: string; emoji: string; labelKey: string; amount: number };

export default function Screen9Demo() {
  const { setDemoExpenses, nextScreen } = useOnboarding();
  const t = useT();
  const { lang } = useLanguage();
  const numLocale = lang === "ms" ? "ms-MY" : "en-GB";
  const [selected, setSelected] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const handleSelectCategory = (id: string) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
      const newAmounts = { ...amounts };
      delete newAmounts[id];
      setAmounts(newAmounts);
    } else if (selected.length < 3) {
      setSelected((prev) => [...prev, id]);
      setAmounts((prev) => ({
        ...prev,
        [id]: DEFAULT_BUDGET_AMOUNTS[id] || 0,
      }));
    }
  };

  const handleAmountChange = (id: string, value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10) || 0;
    setAmounts((prev) => ({
      ...prev,
      [id]: num,
    }));
  };

  const handleContinue = () => {
    const expenses = selected.map((id) => {
      const cat = BUDGET_CATEGORIES.find((c) => c.id === id);
      return {
        category: cat ? t(cat.labelKey) : id,
        amount: amounts[id] || 0,
      };
    });
    setDemoExpenses(expenses);
    nextScreen();
  };

  const totalExpenses = Object.values(amounts).reduce((sum, val) => sum + val, 0);
  const totalBudget = 50000;
  const remaining = totalBudget - totalExpenses;

  const selectedCategories: BudgetItem[] = BUDGET_CATEGORIES.filter((cat) =>
    selected.includes(cat.id)
  ).map((cat) => ({
    ...cat,
    amount: amounts[cat.id] || DEFAULT_BUDGET_AMOUNTS[cat.id] || 0,
  }));

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={9} total={10} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-6 overflow-y-auto"
      >
        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {t("onb.s9.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("onb.s9.subtitle")}
          </p>
        </div>

        {/* Category Grid */}
        {selected.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {BUDGET_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    selected.includes(cat.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <p className="text-xs font-medium text-foreground line-clamp-2">
                    {t(cat.labelKey)}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Selected Categories with Amount Inputs */}
        {selected.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t("onb.s9.editAmounts", { count: Math.max(0, 3 - selected.length) })}
            </p>
            {selectedCategories.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.emoji}</span>
                  <p className="font-medium text-sm text-foreground flex-1">
                    {t(item.labelKey)}
                  </p>
                  {selected.includes(item.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="RM 0"
                  value={amounts[item.id]?.toLocaleString(numLocale) || ""}
                  onChange={(e) => handleAmountChange(item.id, e.target.value)}
                  className="text-right"
                />
              </motion.div>
            ))}

            {selected.length < 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelected([])}
              >
                {t("onb.s9.changeCategories")}
              </Button>
            )}
          </div>
        )}

        {/* Budget Summary */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3"
          >
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>{t("onb.s9.spent")}</span>
                <span>
                  {totalExpenses.toLocaleString(numLocale)} / {totalBudget.toLocaleString(numLocale)}
                </span>
              </div>
              <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((totalExpenses / totalBudget) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">{t("onb.s9.totalExpenses")}</p>
                <p className="font-bold text-primary">
                  RM {totalExpenses.toLocaleString(numLocale)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t("onb.s9.remaining")}</p>
                <p className={`font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  RM {remaining.toLocaleString(numLocale)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Continue Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          {t("onb.s9.viewSummary")}
        </Button>
      </motion.div>
    </div>
  );
}
