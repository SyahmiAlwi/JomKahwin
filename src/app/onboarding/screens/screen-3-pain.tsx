"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { PAIN_POINTS_BY_GOAL, GOAL_HEADINGS_FOR_PAIN_INTRO } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Check } from "lucide-react";

export default function Screen3Pain() {
  const { state, setPainPoints, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  if (!state.goal) return null;

  const painPoints = PAIN_POINTS_BY_GOAL[state.goal];
  const heading = GOAL_HEADINGS_FOR_PAIN_INTRO[state.goal];

  const handleToggle = (point: string) => {
    setSelected((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  const handleContinue = () => {
    setPainPoints(selected);
    nextScreen();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={3} total={10} />
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
            Yang mana ni pernah happen?
          </h1>
          <p className="text-muted-foreground">{heading}</p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <AnimatePresence>
            {painPoints.map((point, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => handleToggle(point)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex gap-3 items-start ${
                  selected.includes(point)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-background"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all ${
                    selected.includes(point)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {selected.includes(point) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{point}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={nextScreen}>
            Eh, skip
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            Seterusnya
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
