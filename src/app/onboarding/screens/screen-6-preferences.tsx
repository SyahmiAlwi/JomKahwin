"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { PREFERENCE_OPTIONS } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Check } from "lucide-react";

export default function Screen6Preferences() {
  const { setPreferences, nextScreen } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    setPreferences(selected);
    nextScreen();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      {/* Progress bar */}
      <div className="mb-8 mt-2">
        <ProgressBar current={6} total={10} />
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
            Apa yang paling urgent nak atur dulu?
          </h1>
          <p className="text-muted-foreground">
            Pilih yang penting untuk korang. Help us tailor your experience!
          </p>
        </div>

        {/* Grid of preferences */}
        <div className="grid grid-cols-2 gap-3">
          {PREFERENCE_OPTIONS.map((option) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleToggle(option.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                selected.includes(option.id)
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-2xl">{option.emoji}</div>
                <p className="font-semibold text-sm text-foreground">{option.label}</p>
              </div>

              {/* Checkmark indicator */}
              {selected.includes(option.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={nextScreen}>
            Skip je
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            Setup Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
