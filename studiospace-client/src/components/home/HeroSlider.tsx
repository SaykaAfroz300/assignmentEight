"use client";

import { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const SLIDES = [
  {
    id: "cyc-loft",
    tag: "PHOTOGRAPHY CYC WALLS & DAYLIGHT LOFTS",
    headline: "Book Iconic Daylight Lofts & Infinity Cyc Stages",
    highlight: "By the Hour.",
    subtext:
      "Step onto pre-lit cyclorama walls, south-facing editorial lofts, and commercial tabletop sets with Profoto strobes and grip packages ready on arrival.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1800&q=85",
    studioName: "Aperture Loft & Dual-Corner Infinity Cyc",
    location: "SoHo, New York",
    rate: "$95 / hr",
    rating: "4.95",
    categoryHref: "/studios?category=Photo+Studio",
  },
  {
    id: "sound-stage",
    tag: "ACOUSTIC CINEMA STAGES & LED VOLUMES",
    headline: "Soundproof Film Stages Engineered for",
    highlight: "Zero-Noise Dialogue.",
    subtext:
      "Reserve NC-22 rated cinema soundstages with motorized lighting grids, 3-phase camlock power, elephant drive-in bays, and private talent green rooms.",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1800&q=85",
    studioName: "Stage 04 — Acoustic Cinema Soundstage",
    location: "Arts District, Los Angeles",
    rate: "$185 / hr",
    rating: "4.92",
    categoryHref: "/studios?category=Film+Stage",
  },
  {
    id: "podcast-lounge",
    tag: "PLUG-AND-RECORD 4K PODCAST ROOMS",
    headline: "Walk In With Your Guest. Walk Out With",
    highlight: "4K Multitrack Master.",
    subtext:
      "Broadcast-ready podcast lounges outfitted with Shure SM7B chains, Rodecaster Pro II consoles, three Sony FX3 cinema angles, and live ISO switching.",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1800&q=85",
    studioName: "Velvet Frequency — 4K Podcast Lounge",
    location: "East Austin, Texas",
    rate: "$75 / hr",
    rating: "4.98",
    categoryHref: "/studios?category=Podcast+Lounge",
  },
  {
    id: "music-suite",
    tag: "DOLBY ATMOS & ANALOG TRACKING SUITES",
    headline: "Track, Mix & Master in World-Class",
    highlight: "Acoustic Control Rooms.",
    subtext:
      "Floating-floor recording suites with vintage analog consoles, Neumann & Coles mic lockers, tuned live booths, and backline instruments.",
    image:
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1800&q=85",
    studioName: "Analog Horizon — Dolby Atmos Suite",
    location: "Berry Hill, Nashville",
    rate: "$115 / hr",
    rating: "4.94",
    categoryHref: "/studios?category=Music+Suite",
  },
];

export default function HeroSlider() {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section aria-label="Featured studio showcase" className="bg-spotlight relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="container-page relative py-8 sm:py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-base-content/12 bg-base-200 shadow-2xl">
          <Swiper
            modules={[Autoplay, EffectFade, Navigation, Pagination]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            speed={850}
            autoplay={{ delay: 5500, disableOnInteraction: false }}
            onSwiper={setSwiperInstance}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="w-full"
          >
            {SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative grid min-h-[560px] items-center lg:min-h-[610px] lg:grid-cols-12">
                  {/* Full-bleed background visual with layered cinema gradient */}
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.studioName}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0a10]/95 via-[#0b0a10]/82 to-[#0b0a10]/45" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a10] via-transparent to-black/30" />
                  </div>

                  {/* Left Content Column */}
                  <div className="relative z-10 space-y-6 p-7 sm:p-12 lg:col-span-7 lg:p-16">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/15 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300 backdrop-blur-md">
                      <Sparkles size={14} />
                      {slide.tag}
                    </span>

                    <h1 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                      {slide.headline}{" "}
                      <span className="text-gradient">{slide.highlight}</span>
                    </h1>

                    <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                      {slide.subtext}
                    </p>

                    {/* Primary CTA Buttons linking to /studios */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <Link href="/studios" className="btn-brand">
                        <Compass size={18} />
                        Explore Studios
                      </Link>
                      <Link
                        href="/studios"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-white/15"
                      >
                        Host Your Space
                        <ArrowRight size={17} />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-medium text-white/75">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        Instant Hourly Reservations
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        Zero Double-Booking Guarantee
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        $1M Production Coverage
                      </span>
                    </div>
                  </div>

                  {/* Right Live Studio Telemetry Card */}
                  <div className="relative z-10 hidden p-12 lg:col-span-5 lg:flex lg:justify-end">
                    <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-black/55 p-6 text-white shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-300">
                        <span>Spotlight Set</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-emerald-300">
                          ● Live Availability
                        </span>
                      </div>
                      <h2 className="mt-3 font-display text-xl font-bold text-white">
                        {slide.studioName}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                        <MapPin size={14} className="text-amber-400" />
                        {slide.location}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-white/55">
                            Hourly Rate
                          </span>
                          <span className="font-display text-xl font-extrabold text-amber-300">
                            {slide.rate}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-white/55">
                            Creator Rating
                          </span>
                          <span className="inline-flex items-center gap-1 font-display text-xl font-extrabold text-white">
                            <Star size={16} className="fill-amber-400 text-amber-400" />
                            {slide.rating}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={slide.categoryHref}
                        className="mt-5 flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        <span>Browse matching category</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Bottom Controls Bar */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#0b0a10]/90 px-6 py-4 text-white backdrop-blur-xl sm:px-10">
            <div className="flex items-center gap-2">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => swiperInstance?.slideToLoop(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === idx
                      ? "w-9 bg-[image:var(--brand-gradient)]"
                      : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => swiperInstance?.slidePrev()}
                aria-label="Previous slide"
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-amber-400 hover:text-amber-300"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => swiperInstance?.slideNext()}
                aria-label="Next slide"
                className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-amber-400 hover:text-amber-300"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
