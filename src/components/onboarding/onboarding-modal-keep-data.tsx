"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { useLanguage, useT } from "@/lib/i18n/language-context";

export default function KeepDataModal() {
  const router = useRouter();
  const { state } = useOnboarding();
  const t = useT();
  const { lang } = useLanguage();
  const numLocale = lang === "ms" ? "ms-MY" : "en-GB";
  const [selectedOption, setSelectedOption] = useState<"keep" | "discard" | null>(null);
  const [autoSelect, setAutoSelect] = useState(false);

  // Auto-select "keep" after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSelect(true);
      setSelectedOption("keep");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDecision = (option: "keep" | "discard") => {
    // Store decision in localStorage if needed
    if (option === "keep") {
      localStorage.setItem("onboarding_demo_expenses", JSON.stringify(state.demoExpenses));
    } else {
      localStorage.removeItem("onboarding_demo_expenses");
    }

    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg space-y-4"
      >
        {/* Headline */}
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {t("onb.keep.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("onb.keep.subtitle")}
        </p>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            {t("onb.keep.expensesSoFar")}
          </p>
          {state.demoExpenses.map((expense, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <p className="text-foreground">{expense.category}</p>
              <p className="font-semibold text-primary">
                RM {expense.amount.toLocaleString(numLocale)}
              </p>
            </div>
          ))}
          <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-foreground">
            <p>{t("onb.keep.total")}</p>
            <p className="text-primary">
              RM {state.demoTotal.toLocaleString(numLocale)}
            </p>
          </div>
        </div>

        {autoSelect && (
          <p className="text-xs text-muted-foreground text-center">
            {t("onb.keep.autoSelect")}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant={selectedOption === "discard" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleDecision("discard")}
            disabled={autoSelect && selectedOption === "keep"}
          >
            {t("onb.keep.no")}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleDecision("keep")}
            disabled={autoSelect && selectedOption !== "keep"}
          >
            {t("onb.keep.yes")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
