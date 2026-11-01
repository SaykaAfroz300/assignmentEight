import { ObjectId, type Db } from "mongodb";

export interface StudioDocument {
  _id?: ObjectId;
  title: string;
  category: "Photo Studio" | "Film Stage" | "Podcast Lounge" | "Music Suite" | "Art Workshop";
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  overview: string;
  areaSqFt: number;
  openingHour: number;
  closingHour: number;
  rating: number;
  reviewCount: number;
  ownerEmail: string;
  ownerName: string;
  ownerAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDocument {
  _id?: ObjectId;
  invoiceNumber: string;
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  studioImage: string;
  studioLocation: string;
  hourlyRate: number;
  securityDeposit: number;
  hostName: string;
  hostEmail: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  endHour: number; // 1-24
  hours: number;
  projectType: string;
  guestCount: number;
  notes: string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDocument {
  _id?: ObjectId;
  studioId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  rating: number;
  comment: string;
  projectType: string;
  createdAt: string;
}

export interface WishlistDocument {
  _id?: ObjectId;
  userEmail: string;
  studioId: string;
  createdAt: string;
}

export const INITIAL_STUDIOS: StudioDocument[] = [
  {
    _id: new ObjectId("67f100000000000000000101"),
    title: "Aperture Loft & Dual-Corner Infinity Cyc",
    category: "Photo Studio",
    hourlyRate: 95,
    securityDeposit: 200,
    maxCapacity: 18,
    location: "SoHo Creative District, New York, NY",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Cyclorama wall",
      "Natural light",
      "Lighting kit",
      "Makeup station",
      "Backdrop rolls",
      "Wi-Fi",
      "Air conditioning",
      "Step-free access",
    ],
    overview:
      "A sun-drenched 2,400 sq ft daylight loft paired with a freshly painted 24x20 ft two-wall infinity cyclorama. South-facing 14-foot industrial windows come with motorized blackout shades so your crew can switch from golden natural light to total strobe control in under 60 seconds. Includes Profoto D2 strobes, C-stands, V-flats, and a dedicated hair & makeup vanity room.",
    areaSqFt: 2400,
    openingHour: 7,
    closingHour: 22,
    rating: 4.95,
    reviewCount: 38,
    ownerEmail: "host@studiospace.io",
    ownerName: "Elena Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-09-12T10:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000102"),
    title: "Stage 04 — Acoustic Cinema Soundstage & Pre-Lit Grid",
    category: "Film Stage",
    hourlyRate: 185,
    securityDeposit: 450,
    maxCapacity: 35,
    location: "Arts District, Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Soundproofing",
      "Green screen",
      "Cyclorama wall",
      "Lighting kit",
      "Green room",
      "Parking",
      "Air conditioning",
      "Step-free access",
    ],
    overview:
      "NC-22 rated soundstage engineered for dialogue film production, music videos, and commercial tabletop shoots. Features a 22-foot motorized pipe grid pre-hung with Arri SkyPanel S60-C units, 400A 3-phase camlock power, elephant doors with drive-in loading bay access, and a private talent green room with steamer and wardrobe racks.",
    areaSqFt: 4200,
    openingHour: 6,
    closingHour: 23,
    rating: 4.92,
    reviewCount: 29,
    ownerEmail: "host@studiospace.io",
    ownerName: "Marcus Sterling",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-09-18T11:30:00.000Z",
    updatedAt: "2026-10-18T11:30:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000103"),
    title: "Velvet Frequency — 4K Multi-Cam Podcast Lounge",
    category: "Podcast Lounge",
    hourlyRate: 75,
    securityDeposit: 120,
    maxCapacity: 8,
    location: "East Austin, Austin, TX",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Broadcast mics",
      "Soundproofing",
      "Lighting kit",
      "Studio monitors",
      "Green room",
      "Kitchenette",
      "Wi-Fi",
      "Air conditioning",
    ],
    overview:
      "Walk in with an SD card or SSD and walk out with broadcast-ready 4K video and isolated multitrack stems. Equipped with four Shure SM7B microphones on low-profile boom arms, Rodecaster Pro II, three Sony FX3 cinema cameras with an ATEM Mini Extreme ISO switcher, and customizable RGB architectural wall slats.",
    areaSqFt: 680,
    openingHour: 8,
    closingHour: 22,
    rating: 4.98,
    reviewCount: 54,
    ownerEmail: "host@studiospace.io",
    ownerName: "Elena Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-09-22T14:15:00.000Z",
    updatedAt: "2026-10-20T14:15:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000104"),
    title: "Analog Horizon — Dolby Atmos Mastering & Tracking Suite",
    category: "Music Suite",
    hourlyRate: 115,
    securityDeposit: 250,
    maxCapacity: 12,
    location: "Berry Hill, Nashville, TN",
    imageUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Soundproofing",
      "Studio monitors",
      "Instruments",
      "Broadcast mics",
      "Green room",
      "Kitchenette",
      "Parking",
      "Wi-Fi",
    ],
    overview:
      "Floating-floor control room and iso live booth designed by Walters-Storyk acoustic architects. Anchored by a 32-channel API 1608 console, Barefoot Footprint01 & Genelec monitoring, Universal Audio Apollo x16 interfaces, a tuned Yamaha C7 grand piano, and a curated locker of Neumann, Coles, and Royer microphones.",
    areaSqFt: 1450,
    openingHour: 9,
    closingHour: 24,
    rating: 4.94,
    reviewCount: 41,
    ownerEmail: "host@studiospace.io",
    ownerName: "Devon Brooks",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-09-25T09:00:00.000Z",
    updatedAt: "2026-10-22T09:00:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000105"),
    title: "Kiln & Canvas — Industrial Makerspace & Sculpture Loft",
    category: "Art Workshop",
    hourlyRate: 58,
    securityDeposit: 150,
    maxCapacity: 20,
    location: "Bushwick, Brooklyn, NY",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Natural light",
      "Step-free access",
      "Kitchenette",
      "Wi-Fi",
      "Air conditioning",
      "Parking",
    ],
    overview:
      "A 1,900 sq ft raw concrete workshop built for messy, ambitious fabrication, large-scale painting, set building, and creative workshops. Equipped with commercial ventilation hoods, utility slop sinks, heavy-duty butcher-block workbenches, H-frame easels, freight elevator access, and overhead skylight bays.",
    areaSqFt: 1900,
    openingHour: 8,
    closingHour: 21,
    rating: 4.88,
    reviewCount: 22,
    ownerEmail: "host@studiospace.io",
    ownerName: "Sora Takahashi",
    ownerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-09-29T16:40:00.000Z",
    updatedAt: "2026-10-23T16:40:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000106"),
    title: "Solaris Glasshouse — Editorial Daylight & Lookbook Studio",
    category: "Photo Studio",
    hourlyRate: 110,
    securityDeposit: 200,
    maxCapacity: 15,
    location: "Silver Lake, Los Angeles, CA",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Natural light",
      "Backdrop rolls",
      "Makeup station",
      "Lighting kit",
      "Kitchenette",
      "Wi-Fi",
      "Air conditioning",
      "Parking",
    ],
    overview:
      "Architectural mid-century daylight sanctuary with limewashed walls, travertine plinths, and modular designer furniture curated for fashion lookbooks, brand campaigns, and lifestyle commercial shoots. Includes 9-foot Savage seamless paper rolls in 12 tones, Aputure 600d Pro continuous lights, and a private courtyard.",
    areaSqFt: 1750,
    openingHour: 7,
    closingHour: 20,
    rating: 4.91,
    reviewCount: 31,
    ownerEmail: "host@studiospace.io",
    ownerName: "Elena Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-10-02T12:00:00.000Z",
    updatedAt: "2026-10-24T12:00:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000107"),
    title: "ChromaDome — LED Volume & Virtual Production Stage",
    category: "Film Stage",
    hourlyRate: 240,
    securityDeposit: 500,
    maxCapacity: 30,
    location: "Fulton Market, Chicago, IL",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Green screen",
      "Soundproofing",
      "Lighting kit",
      "Green room",
      "Parking",
      "Wi-Fi",
      "Air conditioning",
      "Step-free access",
    ],
    overview:
      "Turnkey virtual production and chroma stage featuring a 30-foot curved ROE Visual 1.9mm pitch LED wall alongside a 20-foot pre-lit chroma green cove. Ideal for car commercials, tabletop cinematography, and Unreal Engine in-camera VFX workflows.",
    areaSqFt: 3600,
    openingHour: 7,
    closingHour: 23,
    rating: 4.89,
    reviewCount: 19,
    ownerEmail: "host@studiospace.io",
    ownerName: "Marcus Sterling",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-10-05T15:00:00.000Z",
    updatedAt: "2026-10-25T15:00:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000108"),
    title: "Echo Chamber — Fireside Roundtable Podcast & Vodcast Set",
    category: "Podcast Lounge",
    hourlyRate: 68,
    securityDeposit: 100,
    maxCapacity: 6,
    location: "Capitol Hill, Seattle, WA",
    imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Broadcast mics",
      "Soundproofing",
      "Studio monitors",
      "Lighting kit",
      "Kitchenette",
      "Wi-Fi",
      "Air conditioning",
    ],
    overview:
      "Warm walnut acoustic paneling, cognac leather club chairs, and three interchangeable set backdrops designed for founder interviews, narrative podcasts, and YouTube video essays. Includes Electro-Voice RE20 and Shure SM7dB mics, teleprompter glass, and espresso bar access.",
    areaSqFt: 540,
    openingHour: 8,
    closingHour: 21,
    rating: 4.86,
    reviewCount: 24,
    ownerEmail: "host@studiospace.io",
    ownerName: "Devon Brooks",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-10-08T10:00:00.000Z",
    updatedAt: "2026-10-26T10:00:00.000Z",
  },
  {
    _id: new ObjectId("67f100000000000000000109"),
    title: "SubBass Sanctuary — Synth Lab & Vocal Production Room",
    category: "Music Suite",
    hourlyRate: 88,
    securityDeposit: 180,
    maxCapacity: 8,
    location: "Wynwood, Miami, FL",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Soundproofing",
      "Studio monitors",
      "Instruments",
      "Broadcast mics",
      "Air conditioning",
      "Wi-Fi",
      "Parking",
    ],
    overview:
      "Tuned writing and vocal production suite featuring ATC SCM25A Pro midfield monitors, a patchbay-wired wall of vintage analog synthesizers (Prophet-6, Juno-106, Moog Subsequent 37), and a dead-quiet vocal booth with Sony C800G-style tube condenser chain.",
    areaSqFt: 820,
    openingHour: 10,
    closingHour: 24,
    rating: 4.90,
    reviewCount: 27,
    ownerEmail: "host@studiospace.io",
    ownerName: "Devon Brooks",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-10-12T18:00:00.000Z",
    updatedAt: "2026-10-27T18:00:00.000Z",
  },
];

export const INITIAL_REVIEWS: ReviewDocument[] = [
  {
    studioId: "67f100000000000000000101",
    userName: "Maya Lin",
    userEmail: "maya@ editorialframes.com",
    rating: 5,
    comment: "The infinity cyc was spotless on arrival and the Profoto strobes saved us bringing a whole grip truck into SoHo. Best natural light window bank in the city.",
    projectType: "Fashion Editorial",
    createdAt: "2026-10-18T15:20:00.000Z",
  },
  {
    studioId: "67f100000000000000000101",
    userName: "Julian Vance",
    userEmail: "julian@kinetikfilms.io",
    rating: 5,
    comment: "Motorized blackout shades worked like a charm when we switched from daylight portraits to our product strobe setup. Load-in was effortless.",
    projectType: "Commercial Campaign",
    createdAt: "2026-10-21T19:00:00.000Z",
  },
  {
    studioId: "67f100000000000000000102",
    userName: "Carlos Mendez",
    userEmail: "carlos@indieframe.org",
    rating: 5,
    comment: "Zero outside street noise even during rush hour. Pre-hung SkyPanels on the motorized grid cut our lighting setup time by two hours.",
    projectType: "Commercial Shoot",
    createdAt: "2026-10-19T11:10:00.000Z",
  },
  {
    studioId: "67f100000000000000000103",
    userName: "Hannah O'Connor",
    userEmail: "hannah@founderhour.fm",
    rating: 5,
    comment: "Plugged in our SSD, recorded three 60-minute episodes back-to-back with live camera switching, and had clean ISO tracks ready for edit the same afternoon.",
    projectType: "Video Podcast",
    createdAt: "2026-10-24T17:45:00.000Z",
  },
];

let seeded = false;

/** Automatically seeds the initial studio catalog if the collection is empty. */
export async function seedDatabaseIfNeeded(db: Db) {
  if (seeded) return;
  seeded = true;
  try {
    const studiosCol = db.collection<StudioDocument>("studios");
    const count = await studiosCol.countDocuments();
    if (count === 0) {
      await studiosCol.insertMany(INITIAL_STUDIOS);
      const reviewsCol = db.collection<ReviewDocument>("reviews");
      if ((await reviewsCol.countDocuments()) === 0) {
        await reviewsCol.insertMany(INITIAL_REVIEWS);
      }
    }
  } catch (err) {
    seeded = false;
    console.warn("[StudioSpace] Could not auto-seed database:", err);
  }
}

