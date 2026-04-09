"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { SOLUTION_MAPPING } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { CheckCircle2 } from "lucide-react";

export default function Screen5Solution() {
  const { state, nextScreen } = useOnboarding();

  if (!state.goal) return null;

  const solutions = SOLUTION_MAPPING[state.goal];

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={5} total={10} />
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
            Macam mana JomKahwin selesaikan masalah ni?
          </h1>
          <p className="text-muted-foreground">
            Kami paham pain points anda. Tengok solutions kami:
          </p>
        </div>

        {/* Solution Pairs */}
        <div className="space-y-3">
          {solutions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-xl border border-border bg-white/50 p-4 space-y-2"
            >
              {/* Pain */}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Problem
              </p>
              <p className="text-sm text-foreground">{item.pain}</p>

              {/* Arrow */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-lg">→</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Solution */}
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-foreground">{item.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Button */}
        <Button size="lg" className="w-full" onClick={nextScreen}>
          Jom Tengok Demo
        </Button>
      </motion.div>
    </div>
  );
}
