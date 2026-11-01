import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/icons/BrandIcons";
import { CATEGORIES, NAV_LINKS, SITE } from "@/lib/constants";

const SOCIALS = [
  { label: "X (formerly Twitter)", href: "https://x.com", Icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-base-content/10 bg-base-200/60">
      <div className="absolute inset-x-0 top-0 h-px bg-[image:var(--brand-gradient)] opacity-60" aria-hidden="true" />
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-base-content/65">{SITE.mission}</p>
          <ul className="flex items-center gap-2.5">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-base-content/15 text-base-content/75 transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  <Icon size={17} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-base-content">Quick Links</h2>
          <ul className="space-y-3 text-sm text-base-content/65">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/add-studio" className="transition hover:text-primary">
                Host Your Space
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Popular categories">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-base-content">Popular Categories</h2>
          <ul className="space-y-3 text-sm text-base-content/65">
            {CATEGORIES.map((c) => (
              <li key={c.value}>
                <Link href={`/studios?category=${encodeURIComponent(c.value)}`} className="transition hover:text-primary">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-base-content">Studio Drops</h2>
          <p className="mb-4 text-sm leading-relaxed text-base-content/65">
            New rooms, host tips and member-only rates. One short email a month.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-base-content/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-base-content/55 sm:flex-row">
          <p>© {new Date().getFullYear()} StudioSpace. All rights reserved.</p>
          <p>
            By using StudioSpace you agree to our <span className="text-base-content/80 underline-offset-4 hover:underline">Terms of Service</span> and{" "}
            <span className="text-base-content/80 underline-offset-4 hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
