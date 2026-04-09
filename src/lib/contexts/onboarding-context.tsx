"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Goal = "bajet" | "jemputan" | "tarikh" | "tugasan" | "vendor";
export type Permission = "notifications" | "camera" | "contacts";

export interface OnboardingState {
  currentScreen: number;
  goal: Goal | null;
  painPoints: string[];
  preferences: string[];
  demoExpenses: Array<{ category: string; amount: number }>;
  demoTotal: number;
  completed: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  setGoal: (goal: Goal) => void;
  setPainPoints: (points: string[]) => void;
  setPreferences: (prefs: string[]) => void;
  setDemoExpenses: (expenses: Array<{ category: string; amount: number }>) => void;
  goToScreen: (screen: number) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    currentScreen: 1,
    goal: null,
    painPoints: [],
    preferences: [],
    demoExpenses: [],
    demoTotal: 0,
    completed: false,
  });

  const setGoal = useCallback((goal: Goal) => {
    setState((prev) => ({ ...prev, goal }));
  }, []);

  const setPainPoints = useCallback((points: string[]) => {
    setState((prev) => ({ ...prev, painPoints: points }));
  }, []);

  const setPreferences = useCallback((prefs: string[]) => {
    setState((prev) => ({ ...prev, preferences: prefs }));
  }, []);

  const setDemoExpenses = useCallback((expenses: Array<{ category: string; amount: number }>) => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    setState((prev) => ({ ...prev, demoExpenses: expenses, demoTotal: total }));
  }, []);

  const goToScreen = useCallback((screen: number) => {
    setState((prev) => ({ ...prev, currentScreen: Math.max(1, Math.min(10, screen)) }));
  }, []);

  const nextScreen = useCallback(() => {
    setState((prev) => ({ ...prev, currentScreen: Math.min(10, prev.currentScreen + 1) }));
  }, []);

  const prevScreen = useCallback(() => {
    setState((prev) => ({ ...prev, currentScreen: Math.max(1, prev.currentScreen - 1) }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, completed: true, currentScreen: 11 }));
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
    }
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setGoal,
        setPainPoints,
        setPreferences,
        setDemoExpenses,
        goToScreen,
        nextScreen,
        prevScreen,
        completeOnboarding,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
