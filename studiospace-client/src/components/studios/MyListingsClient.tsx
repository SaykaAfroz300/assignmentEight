"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  PlusCircle,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import StudioCardSkeleton from "@/components/ui/StudioCardSkeleton";
import { api } from "@/lib/api";
import type { Studio } from "@/lib/types";

export default function MyListingsClient() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchMyStudios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ studios: Studio[] }>("/studios/mine");
      setStudios(res.studios ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load your studio listings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load host listings on mount
    void fetchMyStudios();
  }, [fetchMyStudios]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api<{ message: string }>(`/studios/${deleteTarget._id}`, {
        method: "DELETE",
      });
      setStudios((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success(res.message || "Studio deleted from your listings.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete studio.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="bg-spotlight min-h-[80dvh] py-12 sm:py-16">
      <div className="container-page">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-2">
            <span className="section-eyebrow">Host Studio Manager</span>
            <h1 className="section-title">
              My <span className="text-gradient">Studio Listings</span>
            </h1>
            <p className="section-subtitle">
              Manage your listed creative workspaces, update hourly rates & equipment, or remove
              inactive rooms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-base-content/15 bg-base-200 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table view"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-[image:var(--brand-gradient)] text-[#1c1203]"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <List size={14} />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-label="Cards view"
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "cards"
                    ? "bg-[image:var(--brand-gradient)] text-[#1c1203]"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <LayoutGrid size={14} />
                Cards
              </button>
            </div>

            <Link href="/add-studio" className="btn-brand">
              <PlusCircle size={18} />
              Add New Studio
            </Link>
          </div>
        </div>

        {loading ? (
          <StudioCardSkeleton count={3} />
        ) : studios.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            eyebrow="No Studios Listed Yet"
            title="You haven't listed any creative spaces yet"
            description="Turn your photo loft, soundstage, podcast room, or music suite into hourly production income."
            actionLabel="Add Your First Studio"
            actionHref="/add-studio"
          />
        ) : viewMode === "table" ? (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-base-content/10 bg-base-300/60 text-xs font-bold uppercase tracking-wider text-base-content/65">
                  <tr>
                    <th className="px-6 py-4">Studio Workspace</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Rate & Deposit</th>
                    <th className="px-5 py-4">Capacity</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/10">
                  {studios.map((studio) => (
                    <tr
                      key={studio._id}
                      className="transition hover:bg-base-content/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={studio.imageUrl}
                            alt={studio.title}
                            className="h-14 w-20 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/studios/${studio._id}`}
                              className="line-clamp-1 font-display text-base font-bold text-base-content hover:text-primary"
                            >
                              {studio.title}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-base-content/60">
                              <MapPin size={12} className="text-primary" />
                              <span className="truncate">{studio.location}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {studio.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-display text-base font-bold">
                          ${studio.hourlyRate}
                        </span>
                        <span className="text-xs text-base-content/60"> / hr</span>
                        <p className="text-xs text-base-content/55">
                          Deposit: ${studio.securityDeposit}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold">
                          <Users size={14} className="text-primary" />
                          {studio.maxCapacity} crew
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          {Number(studio.rating || 5).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/studios/${studio._id}`}
                            title="View public studio page"
                            className="grid size-9 place-items-center rounded-full border border-base-content/15 text-base-content/75 transition hover:border-primary hover:text-primary"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <Link
                            href={`/studios/edit/${studio._id}`}
                            className="btn-outline-brand btn-sm"
                          >
                            <Edit3 size={14} />
                            Update
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(studio)}
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-error/35 bg-error/10 px-4 text-xs font-semibold text-error transition hover:bg-error hover:text-error-content"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <article
                key={studio._id}
                className="card-surface flex h-full flex-col justify-between overflow-hidden p-4"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={studio.imageUrl}
                      alt={studio.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold">
                      {studio.category}
                    </span>
                  </div>
                  <h2 className="mt-4 line-clamp-1 font-display text-lg font-bold">
                    {studio.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-base-content/65">
                    <MapPin size={13} className="text-primary" />
                    {studio.location}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-display text-xl font-extrabold text-primary">
                      ${studio.hourlyRate}{" "}
                      <span className="text-xs font-normal text-base-content/60">/ hr</span>
                    </span>
                    <span className="text-xs text-base-content/60">
                      Max {studio.maxCapacity} crew
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-base-content/10 pt-4">
                  <Link
                    href={`/studios/edit/${studio._id}`}
                    className="btn-outline-brand btn-sm flex-1"
                  >
                    <Edit3 size={14} />
                    Update
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(studio)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-error/35 bg-error/10 px-4 text-xs font-semibold text-error transition hover:bg-error hover:text-error-content"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Studio Listing?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.title}" from MongoDB? This action cannot be undone.`
            : ""
        }
        confirmLabel="Yes, Delete Studio"
        cancelLabel="Keep Listing"
        danger
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
