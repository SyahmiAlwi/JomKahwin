"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProvider, useOnboarding } from "@/lib/contexts/onboarding-context";
import Screen1Welcome from "./screens/screen-1-welcome";
import Screen2Goal from "./screens/screen-2-goal";
import Screen3Pain from "./screens/screen-3-pain";
import Screen4PainCards from "./screens/screen-4-pain-cards";
import Screen5Solution from "./screens/screen-5-solution";
import Screen6Preferences from "./screens/screen-6-preferences";
import Screen7Permissions from "./screens/screen-7-permissions";
import Screen8Processing from "./screens/screen-8-processing";
import Screen9Demo from "./screens/screen-9-demo";
import Screen10Value from "./screens/screen-10-value";
import KeepDataModal from "@/components/onboarding/onboarding-modal-keep-data";

function OnboardingContent() {
  const router = useRouter();
  const { state } = useOnboarding();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If completed, show the keep/discard modal
  if (state.completed) {
    return <KeepDataModal />;
  }

  // Render the appropriate screen
  switch (state.currentScreen) {
    case 1:
      return <Screen1Welcome />;
    case 2:
      return <Screen2Goal />;
    case 3:
      return <Screen3Pain />;
    case 4:
      return <Screen4PainCards />;
    case 5:
      return <Screen5Solution />;
    case 6:
      return <Screen6Preferences />;
    case 7:
      return <Screen7Permissions />;
    case 8:
      return <Screen8Processing />;
    case 9:
      return <Screen9Demo />;
    case 10:
      return <Screen10Value />;
    default:
      return <Screen1Welcome />;
  }
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
