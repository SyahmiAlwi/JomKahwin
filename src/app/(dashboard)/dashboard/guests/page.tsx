"use client";

import { type ComponentType, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/custom-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Plus,
  MessageCircle,
  Phone,
  Users,
  User,
  Heart,
  Briefcase,
  UserPlus,
  Settings,
  Trash2,
  Edit2,
  Palette,
  Star,
  Home,
} from "lucide-react";
import {
  useGuests,
  useAddGuest,
  useUpdateGuest,
  useDeleteGuest,
  useUpdateGroup,
  useMoveGuests,
} from "@/lib/supabase/queries/guests";
import { useWedding } from "@/components/providers/wedding-provider";
import { useUser } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity-log";
import { useT } from "@/lib/i18n/language-context";

// ── Types ─────────────────────────────────────────────────────

type LucideIcon = ComponentType<{ size?: number; className?: string }>;

type Guest = {
  id: string;
  name: string;
  relation: string;
  group: string;
  rsvp: "hadir" | "tidak" | "pending";
  pax: number;
  phone: string;
};

type Group = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

// ── Constants ─────────────────────────────────────────────────

const DEFAULT_GROUPS: Group[] = [
  { id: "Keluarga Lelaki", label: "Keluarga L", icon: User, color: "text-blue-600 bg-blue-100 border-blue-200" },
  { id: "Keluarga Perempuan", label: "Keluarga P", icon: Heart, color: "text-pink-600 bg-pink-100 border-pink-200" },
  { id: "Kawan", label: "Kawan", icon: Users, color: "text-purple-600 bg-purple-100 border-purple-200" },
  { id: "Rakan Kerja", label: "Rakan Kerja", icon: Briefcase, color: "text-amber-600 bg-amber-100 border-amber-200" },
];

const COLOR_PRESETS = [
  { name: "Blue", class: "text-blue-600 bg-blue-100 border-blue-200" },
  { name: "Pink", class: "text-pink-600 bg-pink-100 border-pink-200" },
  { name: "Purple", class: "text-purple-600 bg-purple-100 border-purple-200" },
  { name: "Amber", class: "text-amber-600 bg-amber-100 border-amber-200" },
  { name: "Green", class: "text-green-600 bg-green-100 border-green-200" },
  { name: "Teal", class: "text-teal-600 bg-teal-100 border-teal-200" },
  { name: "Rose", class: "text-rose-600 bg-rose-100 border-rose-200" },
  { name: "Indigo", class: "text-indigo-600 bg-indigo-100 border-indigo-200" },
];

const ICON_PRESETS = [
  { name: "Users", icon: Users },
  { name: "User", icon: User },
  { name: "Heart", icon: Heart },
  { name: "Briefcase", icon: Briefcase },
  { name: "Star", icon: Star },
  { name: "Home", icon: Home },
];

/** Map well-known group names to icons; fallback to Users. */
const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  "Keluarga Lelaki": User,
  "Keluarga Perempuan": Heart,
  "Kawan": Users,
  "Rakan Kerja": Briefcase,
};
function getGroupIcon(name: string): LucideIcon {
  return GROUP_ICON_MAP[name] ?? Users;
}

// ── Component ─────────────────────────────────────────────────

export default function GuestListPage() {
  const { weddingId, isLoading: weddingLoading } = useWedding();
  const { user } = useUser();
  const t = useT();
  const [searchTerm, setSearchTerm] = useState("");

  // groups: start from defaults; updated when DB guests load
  const [localGroups, setLocalGroups] = useState<Group[]>(DEFAULT_GROUPS);

  // DB hooks
  const { data: dbGuests = [] } = useGuests();
  const addGuestMutation = useAddGuest();
  const updateGuestMutation = useUpdateGuest();
  const deleteGuestMutation = useDeleteGuest();
  const updateGroupMutation = useUpdateGroup();
  const moveGuestsMutation = useMoveGuests();

  // Derive groups from DB and merge with local state (preserves ordering + icons)
  const groups = useMemo<Group[]>(() => {
    if (!dbGuests.length) return localGroups;

    const dbGroupMap = new Map<string, Group>();
    dbGuests.forEach((g) => {
      if (g.group_name && !dbGroupMap.has(g.group_name)) {
        dbGroupMap.set(g.group_name, {
          id: g.group_name,
          label: g.group_name,
          icon: getGroupIcon(g.group_name),
          color: g.group_color ?? DEFAULT_GROUPS[0].color,
        });
      }
    });

    // Update existing local groups with DB color, append any new DB-only groups
    const merged = localGroups.map((g) => {
      const dbG = dbGroupMap.get(g.id);
      return dbG ? { ...g, color: dbG.color } : g;
    });
    dbGroupMap.forEach((dbG, id) => {
      if (!merged.find((g) => g.id === id)) merged.push(dbG);
    });
    return merged;
  }, [dbGuests, localGroups]);

  // Map DB rows to UI Guest shape
  const guests = useMemo<Guest[]>(
    () =>
      dbGuests.map((g) => ({
        id: g.id,
        name: g.name,
        relation: g.relation ?? "-",
        group: g.group_name ?? (groups[0]?.id ?? ""),
        rsvp: g.rsvp_status,
        pax: g.pax,
        phone: g.phone ?? "",
      })),
    [dbGuests, groups]
  );

  // Dialog states
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);

  // Form states
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: "", relation: "", phone: "", pax: 1, group: "",
  });
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editingGroup, setEditingGroup] = useState<Partial<Group> | null>(null);

  const { toast } = useToast();

  // ── Computed stats ───────────────────────────────────────────

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPax = guests.reduce((acc, g) => acc + (g.rsvp === "hadir" ? g.pax : 0), 0);
  const totalGuests = guests.length;

  const groupStats = groups.map((group) => {
    const gList = guests.filter((g) => g.group === group.id);
    const pax = gList.reduce((acc, g) => acc + (g.rsvp === "hadir" ? g.pax : 0), 0);
    return { ...group, count: pax, totalContacts: gList.length };
  });

  // ── Guest handlers ───────────────────────────────────────────

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGroup =
      groups.find((g) => g.id === (newGuest.group || groups[0]?.id)) ?? groups[0];
    const guestName = newGuest.name || t("sidebar.guest");
    try {
      await addGuestMutation.mutateAsync({
        name: guestName,
        relation: newGuest.relation || "-",
        phone: newGuest.phone || "",
        group_name: selectedGroup?.id ?? "Lain-lain",
        group_color: selectedGroup?.color ?? DEFAULT_GROUPS[0].color,
        pax: Number(newGuest.pax) || 1,
      });
      toast({ title: t("common.success"), description: t("guests.added"), variant: "success" });
      setNewGuest({ name: "", relation: "", phone: "", pax: 1, group: "" });
      setIsAddGuestOpen(false);
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "guest.add", entityType: "guest", entityName: guestName });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    const selectedGroup = groups.find((g) => g.id === editingGuest.group) ?? groups[0];
    try {
      await updateGuestMutation.mutateAsync({
        id: editingGuest.id,
        name: editingGuest.name,
        relation: editingGuest.relation,
        phone: editingGuest.phone,
        group_name: editingGuest.group,
        group_color: selectedGroup?.color,
        pax: editingGuest.pax,
        rsvp_status: editingGuest.rsvp,
      });
      toast({ title: t("common.updated"), description: t("guests.updated"), variant: "success" });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "guest.update", entityType: "guest", entityName: editingGuest.name });
      }
      setEditingGuest(null);
      setIsEditGuestOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  const handleDeleteGuest = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const guestToDelete = guests.find(g => g.id === id);
    try {
      await deleteGuestMutation.mutateAsync(id);
      toast({ title: t("common.deleted"), description: t("guests.deleted"), variant: "default" });
      if (weddingId && user) {
        const supabase = createClient();
        await logActivity({ supabase, weddingId, userId: user.id, action: "guest.delete", entityType: "guest", entityName: guestToDelete?.name });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  const openEditGuest = (e: React.MouseEvent, guest: Guest) => {
    e.stopPropagation();
    setEditingGuest({ ...guest });
    setIsEditGuestOpen(true);
  };

  const handleRsvpToggle = async (e: React.MouseEvent, guestId: string, currentRsvp: Guest["rsvp"]) => {
    e.stopPropagation();
    const cycle: Record<Guest["rsvp"], Guest["rsvp"]> = {
      pending: "hadir",
      hadir: "tidak",
      tidak: "pending",
    };
    try {
      await updateGuestMutation.mutateAsync({ id: guestId, rsvp_status: cycle[currentRsvp] });
    } catch (err: unknown) {
      toast({ title: t("common.error"), description: err instanceof Error ? err.message : t("common.tryAgain"), variant: "error" });
    }
  };

  // ── Group handlers ───────────────────────────────────────────

  const handleSaveGroup = async () => {
    if (!editingGroup?.label) return;

    const existing = groups.find((g) => g.id === editingGroup.id);
    if (existing) {
      // Edit existing group — bulk-update all guests in it
      try {
        await updateGroupMutation.mutateAsync({
          oldName: editingGroup.id as string,
          newName: editingGroup.label,
          newColor: editingGroup.color ?? "",
        });
        // Keep local groups in sync (id changes if the group was renamed)
        setLocalGroups((prev) =>
          prev.map((g) =>
            g.id === editingGroup.id
              ? { ...g, id: editingGroup.label!, label: editingGroup.label!, color: editingGroup.color ?? g.color, icon: editingGroup.icon ?? g.icon }
              : g
          )
        );
        toast({ title: t("common.updated"), description: t("guests.groupUpdated"), variant: "success" });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("common.error");
        toast({ title: t("common.error"), description: msg, variant: "error" });
      }
    } else {
      // New group — stored locally until first guest is added to it
      const newGroup: Group = {
        id: editingGroup.label,
        label: editingGroup.label,
        icon: editingGroup.icon ?? Users,
        color: editingGroup.color ?? COLOR_PRESETS[0].class,
      };
      setLocalGroups((prev) => [...prev, newGroup]);
      toast({ title: t("common.success"), description: t("guests.groupAdded"), variant: "success" });
    }
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (id: string) => {
    if (groups.length <= 1) {
      toast({
        title: t("common.error"),
        description: t("guests.mustHaveOneGroup"),
        variant: "error",
      });
      return;
    }
    const fallback = groups.find((g) => g.id !== id);
    if (!fallback) return;

    try {
      await moveGuestsMutation.mutateAsync({
        fromGroup: id,
        toGroup: fallback.id,
        toColor: fallback.color,
      });
      setLocalGroups((prev) => prev.filter((g) => g.id !== id));
      toast({ title: t("common.deleted"), description: t("guests.groupDeleted"), variant: "default" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast({ title: t("common.error"), description: msg, variant: "error" });
    }
  };

  // Resolves a group's display label, preferring translations for canonical
  // default groups (e.g. "Keluarga Lelaki") while falling back to the raw name.
  const groupLabel = (g: Group) => {
    const key = `group.${g.id}`;
    const translated = t(key);
    return translated === key ? g.label : translated;
  };

  // ── Render ───────────────────────────────────────────────────

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
          <h1 className="text-3xl font-heading font-bold text-foreground">{t("guests.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("guests.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddGuestOpen(true)}
            className="rounded-full px-6"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {t("guests.addButton")}
          </Button>
        </div>
      </div>

      {/* Main Stats - Total Pax */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => setIsManageGroupsOpen(true)}
        className="cursor-pointer group"
      >
        <Card
          variant="gradient"
          className="p-8 text-white relative overflow-hidden border-none shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-[1.01]"
        >
          <div className="relative z-10">
            <p className="text-white/80 font-medium mb-2 flex items-center gap-2">
              {t("guests.heroLabel")}
              <Settings className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <h2 className="text-5xl font-bold tracking-tight">
              {totalPax}{" "}
              <span className="text-2xl opacity-60 font-normal">{t("guests.contactCount", { total: totalGuests })}</span>
            </h2>
            <div className="mt-4 flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                {t("guests.chipTotalConfirmed")}
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 -skew-x-12 translate-x-12" />
        </Card>
      </motion.div>

      {/* Group Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {groupStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsManageGroupsOpen(true)}
              className="cursor-pointer"
            >
              <Card
                className={`p-4 border ${stat.color.replace("text-", "border-").split(" ")[2]} bg-white hover:shadow-lg transition-all h-full hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-5 w-5 ${stat.color.split(" ")[0]}`} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stat.totalContacts}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium truncate mb-0.5">
                    {groupLabel(stat)}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color.split(" ")[0]}`}>
                    {stat.count}
                    <span className="text-xs text-muted-foreground ml-1 font-medium">{t("guests.pax").toLowerCase()}</span>
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t("guests.searchPlaceholder")}
          className="pl-10 h-12 rounded-2xl bg-white border-border/50 focus:ring-primary/20 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Guest List */}
      <div className="space-y-3">
        {filteredGuests.map((guest, index) => {
          const groupInfo = groups.find((g) => g.id === guest.group) ?? groups[0];
          return (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-lg transition-all border-border/40 group bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${groupInfo?.color.split(" ")[1]} ${groupInfo?.color.split(" ")[0]}`}
                  >
                    {guest.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">
                      {guest.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${groupInfo?.color.replace("text-", "bg-").split(" ")[0]}`}
                        />
                        {groupInfo ? groupLabel(groupInfo) : ""}
                      </span>
                      <span className="text-border">•</span>
                      <span>{guest.relation}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Pax */}
                <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pl-16 md:pl-0">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                      {t("guests.pax")}
                    </p>
                    <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full text-foreground font-bold">
                      <Users className="h-3 w-3" />
                      {guest.pax}
                    </div>
                  </div>

                  {/* RSVP toggle — click to cycle pending → hadir → tidak → pending */}
                  <button
                    onClick={(e) => handleRsvpToggle(e, guest.id, guest.rsvp)}
                    title={t("guests.rsvp.tooltip")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 ${
                      guest.rsvp === "hadir"
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : guest.rsvp === "tidak"
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <span className="text-[10px]">
                      {guest.rsvp === "hadir" ? "✓" : guest.rsvp === "tidak" ? "✗" : "?"}
                    </span>
                    {guest.rsvp === "hadir" ? t("guests.rsvp.attending") : guest.rsvp === "tidak" ? t("guests.rsvp.notAttending") : t("guests.rsvp.pending")}
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.open(`https://wa.me/${guest.phone.replace(/\+/g, "")}`)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-foreground hover:bg-green-50 bg-green-50/50"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => window.open(`tel:${guest.phone}`)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-blue-600 hover:bg-blue-50 bg-blue-50/50"
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={(e) => openEditGuest(e, guest)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => handleDeleteGuest(e, guest.id)}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Add Guest Dialog ───────────────────────────────────── */}
      <Dialog isOpen={isAddGuestOpen} onClose={() => setIsAddGuestOpen(false)} title={t("guests.addDialog.title")}>
        <form onSubmit={handleAddGuest} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.fullName")}</label>
            <Input
              value={newGuest.name}
              onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
              placeholder={t("guests.namePlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.relation")}</label>
              <Input
                value={newGuest.relation}
                onChange={(e) => setNewGuest({ ...newGuest, relation: e.target.value })}
                placeholder={t("guests.relationPlaceholder")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.phone")}</label>
              <Input
                type="tel"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                placeholder="+601..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t("guests.inviteGroup")}
              </label>
              <div className="relative">
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  value={newGuest.group}
                  onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value })}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {groupLabel(g)}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.paxCount")}</label>
              <Input
                type="number"
                min="1"
                value={newGuest.pax}
                onChange={(e) => setNewGuest({ ...newGuest, pax: parseInt(e.target.value) })}
                placeholder="1"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={addGuestMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
          >
            {addGuestMutation.isPending ? t("common.saving") : t("guests.saveGuest")}
          </Button>
        </form>
      </Dialog>

      {/* ── Edit Guest Dialog ──────────────────────────────────── */}
      <Dialog
        isOpen={isEditGuestOpen}
        onClose={() => { setIsEditGuestOpen(false); setEditingGuest(null); }}
        title={t("guests.editDialog.title")}
      >
        {editingGuest && (
          <form onSubmit={handleUpdateGuest} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.fullName")}</label>
              <Input
                value={editingGuest.name}
                onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                placeholder={t("guests.namePlaceholder")}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.relation")}</label>
                <Input
                  value={editingGuest.relation}
                  onChange={(e) => setEditingGuest({ ...editingGuest, relation: e.target.value })}
                  placeholder={t("guests.relationPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.phone")}</label>
                <Input
                  type="tel"
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  placeholder="+601..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {t("guests.inviteGroup")}
                </label>
                <div className="relative">
                  <select
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={editingGuest.group}
                    onChange={(e) => setEditingGuest({ ...editingGuest, group: e.target.value })}
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {groupLabel(g)}
                      </option>
                    ))}
                  </select>
                  <Users className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.paxCount")}</label>
                <Input
                  type="number"
                  min="1"
                  value={editingGuest.pax}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, pax: parseInt(e.target.value) })
                  }
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t("guests.rsvp.label")}</label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                value={editingGuest.rsvp}
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    rsvp: e.target.value as "hadir" | "tidak" | "pending",
                  })
                }
              >
                <option value="pending">{t("guests.rsvp.pendingLong")}</option>
                <option value="hadir">{t("guests.rsvp.attendingLong")}</option>
                <option value="tidak">{t("guests.rsvp.notAttendingLong")}</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={updateGuestMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
            >
              {updateGuestMutation.isPending ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </form>
        )}
      </Dialog>

      {/* ── Manage Groups Dialog ───────────────────────────────── */}
      <Dialog
        isOpen={isManageGroupsOpen}
        onClose={() => { setIsManageGroupsOpen(false); setEditingGroup(null); }}
        title={
          editingGroup
            ? editingGroup.id
              ? t("guests.groupDialog.editTitle")
              : t("guests.groupDialog.addTitle")
            : t("guests.groupDialog.manageTitle")
        }
      >
        <div className="space-y-6">
          {editingGroup ? (
            /* Add / Edit Form View */
            <div className="space-y-4">
              <div className="bg-secondary/20 p-4 rounded-xl border border-secondary space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      {t("guests.groupNameLabel")}
                    </label>
                    <Input
                      value={editingGroup.label || ""}
                      onChange={(e) => setEditingGroup({ ...editingGroup, label: e.target.value })}
                      placeholder={t("guests.groupNamePlaceholder")}
                      className="bg-white"
                      autoFocus
                    />
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1">
                      <Palette className="h-3 w-3" /> {t("guests.themeColour")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setEditingGroup({ ...editingGroup, color: preset.class })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${preset.class.split(" ")[1]} ${editingGroup.color === preset.class ? "border-foreground scale-110 shadow-md" : "border-transparent"}`}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1">
                      <Star className="h-3 w-3" /> {t("guests.icon")}
                    </label>
                    <div className="flex gap-3">
                      {ICON_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setEditingGroup({ ...editingGroup, icon: preset.icon })}
                          className={`p-2 rounded-md border transition-all ${editingGroup.icon === preset.icon ? "bg-primary/10 border-primary text-primary" : "bg-white border-border text-muted-foreground hover:bg-muted"}`}
                          title={preset.name}
                        >
                          <preset.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveGroup}
                      disabled={!editingGroup.label || updateGroupMutation.isPending}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingGroup.id ? t("common.saveChanges") : t("guests.saveGroup")}
                    </Button>
                    <Button
                      onClick={() => setEditingGroup(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Group List View */
            <div className="space-y-2">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 bg-white border border-border/50 rounded-lg shadow-sm hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${group.color} bg-opacity-20`}>
                        <group.icon className={`h-4 w-4 ${group.color.split(" ")[0]}`} />
                      </div>
                      <span className="font-medium text-sm text-foreground">{groupLabel(group)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingGroup(group)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add New Group Row */}
                <button
                  onClick={() => setEditingGroup({ label: "", color: COLOR_PRESETS[0].class, icon: Users })}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-dashed border-border rounded-lg hover:bg-muted/30 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary group"
                >
                  <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{t("guests.addNewGroup")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
