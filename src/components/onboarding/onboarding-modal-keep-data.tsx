"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";

export default function KeepDataModal() {
  const router = useRouter();
  const { state } = useOnboarding();
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
          Save contoh bajet anda?
        </h1>
        <p className="text-muted-foreground">
          Sambung dari sini atau start fresh dengan bajet kosong.
        </p>

        {/* Preview of demo items */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Your expenses so far:
          </p>
          {state.demoExpenses.map((expense, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <p className="text-foreground">{expense.category}</p>
              <p className="font-semibold text-primary">
                RM {expense.amount.toLocaleString("en-MY")}
              </p>
            </div>
          ))}
          <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-foreground">
            <p>Total</p>
            <p className="text-primary">
              RM {state.demoTotal.toLocaleString("en-MY")}
            </p>
          </div>
        </div>

        {/* Timer indicator */}
        {autoSelect && (
          <p className="text-xs text-muted-foreground text-center">
            Auto-selecting "Yes, Simpan" in a moment...
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant={selectedOption === "discard" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleDecision("discard")}
            disabled={autoSelect && selectedOption === "keep"}
          >
            No, Kosongkan
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleDecision("keep")}
            disabled={autoSelect && selectedOption !== "keep"}
          >
            Yes, Simpan!
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
