"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, ChevronDown, LayoutDashboard, ListChecks, LogOut, PlusCircle } from "lucide-react";
import { USER_MENU_LINKS } from "@/lib/constants";
import type { SessionUser } from "@/hooks/useCurrentUser";

const ICONS = {
  layout: LayoutDashboard,
  plus: PlusCircle,
  list: ListChecks,
  calendar: CalendarCheck,
} as const;

export function Avatar({ user, size = 40 }: { user: Pick<SessionUser, "name" | "image">; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (user.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatars can come from any host
      <img
        src={user.image}
        alt={user.name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="rounded-full object-cover ring-2 ring-primary/60"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-[image:var(--brand-gradient)] font-bold text-[#1c1203]"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </span>
  );
}

export default function UserMenu({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        id="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-base-content/15 bg-base-content/5 py-1 pl-1 pr-2.5 transition hover:border-primary"
      >
        <Avatar user={user} size={34} />
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl p-2 shadow-2xl"
          >
            <div className="flex items-center gap-3 rounded-xl bg-base-content/5 p-3">
              <Avatar user={user} size={44} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-base-content/60">{user.email}</p>
              </div>
            </div>
            <ul className="mt-2">
              {USER_MENU_LINKS.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-primary/12 hover:text-primary"
                    >
                      <Icon size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              id="logout-button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-base-content/10 px-3 py-2.5 text-sm font-medium text-error transition hover:bg-error/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
