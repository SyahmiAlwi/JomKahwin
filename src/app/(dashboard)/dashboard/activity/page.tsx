"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ChevronDown } from "lucide-react";
import { useWedding } from "@/components/providers/wedding-provider";
import { createClient } from "@/lib/supabase/client";
import { type ActivityLogRow, timeAgoMS } from "@/lib/activity-log";

const PAGE_SIZE = 20;

const ENTITY_ICONS: Record<string, string> = {
  event: "📅",
  guest: "👥",
  checklist: "✅",
  budget: "💰",
  vendor: "🏪",
  timetable: "🕐",
};

const ENTITY_COLORS: Record<string, string> = {
  event: "bg-rose-100 text-rose-700",
  guest: "bg-blue-100 text-blue-700",
  checklist: "bg-green-100 text-green-700",
  budget: "bg-amber-100 text-amber-700",
  vendor: "bg-purple-100 text-purple-700",
  timetable: "bg-sky-100 text-sky-700",
};

export default function ActivityPage() {
  const { weddingId, members, isLoading: weddingLoading } = useWedding();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    data: activities = [],
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ["activity_log", weddingId],
    enabled: !!weddingId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("wedding_id", weddingId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ActivityLogRow[];
    },
  });

  const visible = activities.slice(0, visibleCount);
  const hasMore = activities.length > visibleCount;

  const getMember = (userId: string) =>
    members.find((m) => m.user_id === userId);

  if (weddingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Log Aktiviti</h1>
          <p className="text-muted-foreground">Semua perubahan yang dibuat dalam perancangan perkahwinan anda.</p>
        </div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          variant="gradient"
          className="p-6 border-none shadow-xl shadow-primary/10 relative overflow-hidden"
        >
          <Activity className="absolute right-6 top-6 h-24 w-24 text-white/10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm uppercase tracking-widest font-medium">Jumlah Aktiviti</p>
              <h2 className="text-4xl font-bold text-white font-heading">{activities.length}</h2>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activity list */}
      {activitiesLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/50">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-heading font-bold text-foreground mb-2">Tiada Aktiviti Lagi</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Setiap kali anda menambah atau mengemaskini data, ia akan direkodkan di sini.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((activity, index) => {
            const member = getMember(activity.user_id);
            const name = member?.full_name ?? "Pengguna";
            const initial = name.charAt(0).toUpperCase();
            const entityIcon = ENTITY_ICONS[activity.entity_type] ?? "📋";
            const entityColor = ENTITY_COLORS[activity.entity_type] ?? "bg-muted text-muted-foreground";

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="p-4 flex items-center gap-4 border-border/40 bg-white/80 hover:shadow-md transition-shadow">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                    {member?.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-foreground text-sm truncate">{name}</span>
                      <span className="text-muted-foreground text-sm">{activity.action}</span>
                      {activity.entity_name && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityColor}`}>
                          {entityIcon} {activity.entity_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{timeAgoMS(activity.created_at)}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Muat Lebih Banyak ({activities.length - visibleCount} lagi)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
