"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import UserMenu, { Avatar } from "./UserMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { NAV_LINKS, USER_MENU_LINKS } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isPending, logout } = useCurrentUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on route change and lock body scroll while it's open.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer after navigation
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass border-x-0 border-t-0 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={isActive(link.href)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2.5 sm:flex">
            {isPending ? (
              <span className="skeleton-brand h-10 w-24 rounded-full" aria-hidden="true" />
            ) : user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <>
                <Link href="/login" id="nav-login" className="btn-outline-brand btn-sm">
                  Login
                </Link>
                <Link href="/register" id="nav-register" className="btn-brand btn-brand-sm">
                  Register
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            id="mobile-menu-button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-base-content/15 bg-base-content/5 lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - var(--header-h))" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-y-auto border-t border-base-content/10 bg-base-100/95 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block rounded-xl px-4 py-3.5 text-lg font-semibold transition ${
                      isActive(link.href) ? "bg-primary/12 text-primary" : "hover:bg-base-content/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="my-4 h-px bg-base-content/10" />

              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 px-4">
                    <Avatar user={user} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-base-content/60">{user.email}</p>
                    </div>
                  </div>
                  {USER_MENU_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-xl px-4 py-3 font-medium hover:bg-base-content/5">
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl px-4 py-3 text-left font-medium text-error hover:bg-error/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-1">
                  <Link href="/login" className="btn-outline-brand">
                    Login
                  </Link>
                  <Link href="/register" className="btn-brand">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
