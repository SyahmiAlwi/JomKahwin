"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { X, Check } from "lucide-react";

const PAIN_CARDS = [
  "Quotation vendor baru datang, cortisol level terus naik!",
  "Aku & pasangan disagree pasal bajet, gaduh je lepas tu",
  "Alamak dah overbudget! Tak sedar sampaila dah terlambat!",
  "Checklist berlambak, aku taktahu start dari mana",
  "RSVP Guest list besar gedabak. Siapa confirm siapa pending??? Keliru.",
];

export default function Screen4PainCards() {
  const { nextScreen } = useOnboarding();
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentCardIdx < PAIN_CARDS.length - 1) {
      setCurrentCardIdx((prev) => prev + 1);
    } else {
      nextScreen();
    }
  };

  const handleSkip = () => {
    nextScreen();
  };

  const progress = currentCardIdx + 1;
  const total = PAIN_CARDS.length;
  const isLast = currentCardIdx === PAIN_CARDS.length - 1;

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={4} total={10} />
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
            Pain point bila merancang majlis?
          </h1>
          <p className="text-muted-foreground">
            Swipe kanan (✓) kalau relate, kiri (✗) kalau tak
          </p>
        </div>

        {/* Card Counter */}
        <p className="text-sm font-medium text-muted-foreground text-center">
          {progress}/{total}
        </p>

        {/* Cards */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 p-6 flex items-center justify-center text-center shadow-lg"
            >
              <p className="text-lg text-foreground leading-relaxed">
                "{PAIN_CARDS[currentCardIdx]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Swipe Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16"
            onClick={() => handleSwipe("left")}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-16 h-16"
            onClick={() => handleSwipe("right")}
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Button */}
        <Button variant="ghost" className="w-full" onClick={handleSkip}>
          Eh skip je
        </Button>
      </motion.div>
    </div>
  );
}
