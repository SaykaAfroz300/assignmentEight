import { Camera, Clapperboard, Mic2, Music4, Palette, type LucideIcon } from "lucide-react";

export const SITE = {
  name: "StudioSpace",
  tagline: "Book the room. Make the thing.",
  description:
    "StudioSpace is a peer-to-peer marketplace where creators discover, compare and instantly book photography cyc walls, film stages, podcast lounges, music suites and art workshops.",
  mission:
    "We give every creator access to the right room at the right hour, and give hosts a fair way to turn idle square footage into income.",
} as const;

export type StudioCategory = {
  value: string; // stored in MongoDB and used in ?category=
  label: string; // plural label shown on category cards
  blurb: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
};

/** Single source of truth for categories (Add form, filters, home cards, footer). */
export const CATEGORIES: StudioCategory[] = [
  {
    value: "Photo Studio",
    label: "Photo Studios",
    blurb: "Cyc walls, natural light lofts and product sets.",
    icon: Camera,
    accent: "from-amber-400/30 to-orange-500/10",
  },
  {
    value: "Film Stage",
    label: "Sound Stages",
    blurb: "Acoustic-treated stages with grid lighting and green screens.",
    icon: Clapperboard,
    accent: "from-rose-400/30 to-fuchsia-500/10",
  },
  {
    value: "Podcast Lounge",
    label: "Podcast Rooms",
    blurb: "Plug-and-record rooms with broadcast mics and multi-cam.",
    icon: Mic2,
    accent: "from-sky-400/30 to-indigo-500/10",
  },
  {
    value: "Music Suite",
    label: "Music Suites",
    blurb: "Control rooms, live rooms and vocal booths with backline.",
    icon: Music4,
    accent: "from-violet-400/30 to-purple-500/10",
  },
  {
    value: "Art Workshop",
    label: "Art Workshops",
    blurb: "Ventilated, messy-friendly spaces for makers and painters.",
    icon: Palette,
    accent: "from-emerald-400/30 to-teal-500/10",
  },
];

export const AMENITIES = [
  "Wi-Fi",
  "Air conditioning",
  "Parking",
  "Green screen",
  "Soundproofing",
  "Natural light",
  "Cyclorama wall",
  "Lighting kit",
  "Backdrop rolls",
  "Makeup station",
  "Green room",
  "Kitchenette",
  "Instruments",
  "Studio monitors",
  "Broadcast mics",
  "Step-free access",
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
] as const;

export const USER_MENU_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "layout" },
  { href: "/add-studio", label: "Add New Studio", icon: "plus" },
  { href: "/my-listings", label: "My Studio Listings", icon: "list" },
  { href: "/my-bookings", label: "My Bookings", icon: "calendar" },
] as const;
