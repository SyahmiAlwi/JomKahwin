"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/contexts/onboarding-context";
import { PAIN_POINT_KEYS_BY_GOAL, GOAL_HEADING_KEYS } from "@/lib/onboarding-utils";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n/language-context";

export default function Screen3Pain() {
  const { state, setPainPoints, nextScreen } = useOnboarding();
  const t = useT();
  const [selected, setSelected] = useState<string[]>([]);

  if (!state.goal) return null;

  const painKeys = PAIN_POINT_KEYS_BY_GOAL[state.goal];
  const heading = t(GOAL_HEADING_KEYS[state.goal]);

  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-6"
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {t("onb.s3.title")}
          </h1>
          <p className="text-muted-foreground">{heading}</p>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {painKeys.map((key, idx) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => handleToggle(key)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex gap-3 items-start ${
                  selected.includes(key)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-background"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all ${
                    selected.includes(key)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {selected.includes(key) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">{t(key)}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={nextScreen}>
            {t("onb.s3.skipSoft")}
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            {t("onb.s3.next")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
