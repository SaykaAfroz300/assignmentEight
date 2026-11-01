import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Scene Not Found",
  description: "The page you were looking for isn't on this set.",
};

/** Custom 404 with an inline studio illustration: spotlight, clapperboard and a "404" slate. */
export default function NotFound() {
  return (
    <section className="bg-spotlight relative overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-page relative grid min-h-[78dvh] items-center gap-10 py-16 lg:grid-cols-2">
        <div className="animate-fade-up space-y-6 text-center lg:text-left">
          <span className="section-eyebrow">Error 404</span>
          <h1 className="section-title">
            Cut! This scene <span className="text-gradient">isn&apos;t on set.</span>
          </h1>
          <p className="section-subtitle mx-auto lg:mx-0">
            The page you&apos;re looking for was moved, wrapped, or never got greenlit. Head back to the lobby and find a
            studio that&apos;s ready for its close-up.
          </p>
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link href="/" id="not-found-home" className="btn-brand">
              <ArrowLeft size={18} />
              Return to Home
            </Link>
            <Link href="/studios" className="btn-outline-brand">
              <Compass size={18} />
              Explore Studios
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md animate-float" aria-hidden="true">
          <svg viewBox="0 0 400 360" className="h-auto w-full drop-shadow-2xl">
            <defs>
              <linearGradient id="nf-brand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb02e" />
                <stop offset="100%" stopColor="#ff6b4a" />
              </linearGradient>
              <linearGradient id="nf-beam" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#ffb02e" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffb02e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Spotlight rig */}
            <rect x="170" y="8" width="60" height="14" rx="7" fill="#3a3548" />
            <path d="M178 22h44l22 38h-88z" fill="#2a2536" />
            <circle cx="200" cy="64" r="16" fill="url(#nf-brand)" />
            <path d="M184 72 L90 330 H310 L216 72Z" fill="url(#nf-beam)" />
            {/* Floor */}
            <ellipse cx="200" cy="330" rx="130" ry="16" fill="#ffb02e" opacity="0.14" />
            {/* Clapperboard */}
            <g transform="translate(110 150)">
              <rect x="0" y="40" width="180" height="120" rx="12" fill="#1f1b2b" stroke="#ffb02e" strokeWidth="3" />
              <g transform="rotate(-14 0 40)">
                <rect x="0" y="6" width="180" height="34" rx="8" fill="#2c2740" stroke="#ffb02e" strokeWidth="3" />
                <path d="M20 6l22 34M62 6l22 34M104 6l22 34M146 6l22 34" stroke="#ffb02e" strokeWidth="9" />
              </g>
              <text x="90" y="118" textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="54" fill="url(#nf-brand)">
                404
              </text>
              <text x="90" y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" letterSpacing="3" fill="#a9a3bd">
                SCENE MISSING
              </text>
            </g>
            {/* Sparkles */}
            <g fill="#ffb02e">
              <circle cx="60" cy="120" r="3" />
              <circle cx="345" cy="150" r="4" />
              <circle cx="320" cy="60" r="2.5" />
              <circle cx="82" cy="240" r="2.5" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
