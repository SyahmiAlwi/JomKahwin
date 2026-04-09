"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding, Goal } from "@/lib/contexts/onboarding-context";
import { GOAL_OPTIONS } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";

export default function Screen2Goal() {
  const { setGoal, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState<Goal | null>(null);

  const handleSelect = (goal: Goal) => {
    setSelected(goal);
  };

  const handleContinue = () => {
    if (selected) {
      setGoal(selected);
      nextScreen();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={2} total={10} />
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
            Apa benda yang paling buat pening dalam merancang majlis?
          </h1>
          <p className="text-muted-foreground">Terus jujur, so we tailor JomKahwin untuk anda.</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {GOAL_OPTIONS.map((option) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleSelect(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected === option.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50 bg-background"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{option.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={nextScreen}>
            Eh, skip je
          </Button>
          <Button
            className="flex-1"
            onClick={handleContinue}
            disabled={!selected}
          >
            Seterusnya
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
