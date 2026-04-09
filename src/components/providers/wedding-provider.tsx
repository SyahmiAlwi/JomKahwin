"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/user-provider";

export interface WeddingMember {
  user_id: string;
  joined_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface WeddingContextType {
  weddingId: string | null;
  inviteCode: string | null;
  members: WeddingMember[];
  isLoading: boolean;
  refreshWedding: () => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: userLoading } = useUser();
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWedding = useCallback(async () => {
    if (!user) {
      setWeddingId(null);
      setInviteCode(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get or create the user's wedding
      const { data: weddingRows, error: weddingErr } = await supabase.rpc(
        "get_or_create_wedding"
      );
      if (weddingErr) throw weddingErr;

      const wedding = Array.isArray(weddingRows) ? weddingRows[0] : weddingRows;
      if (!wedding) throw new Error("Failed to get or create wedding");

      setWeddingId(wedding.id as string);
      setInviteCode(wedding.invite_code as string);

      // Fetch members with user metadata
      const { data: memberRows, error: memberErr } = await supabase.rpc(
        "get_wedding_members",
        { p_wedding_id: wedding.id }
      );
      if (memberErr) {
        // Non-fatal — gracefully fall back to empty members
        console.warn("[WeddingProvider] get_wedding_members error:", memberErr.message);
        setMembers([]);
      } else {
        setMembers((memberRows as WeddingMember[]) ?? []);
      }
    } catch (err) {
      console.error("[WeddingProvider] fetchWedding error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading) {
      fetchWedding();
    }
  }, [userLoading, fetchWedding]);

  return (
    <WeddingContext.Provider
      value={{ weddingId, inviteCode, members, isLoading, refreshWedding: fetchWedding }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error("useWedding must be used within a WeddingProvider");
  }
  return context;
}
