"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/user-provider";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!user) {
      // Not authenticated → go to login
      router.push("/login");
    } else {
      // Authenticated → let dashboard handle onboarding check
      router.push("/dashboard");
    }
  }, [user, isLoading, router, mounted]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
