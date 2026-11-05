# StudioSpace — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform

**Assignment Variant:** `B14-A8-Cat_Harry`  
**Live Website URL:** https://assignmenteight-studiospace-client.vercel.app/
StudioSpace is a high-performance peer-to-peer marketplace built for creators, filmmakers, photographers, podcasters, and musicians. Studio hosts can list their creative rooms—from photography infinity cyc lofts and acoustic cinema soundstages to 4K podcast lounges, Dolby Atmos music suites, and industrial art workshops—while fellow creators discover, filter, inspect dynamic slot availability, and book studio hours with transparent pricing.

---

## Key Platform Features

- **Dynamic Studio Marketplace & Multi-Faceted Filtering:** Browse top-rated featured studios fetched dynamically from MongoDB using `.limit(6)` on the Home page, or explore the full catalog at `/studios` with live search, category pills (`Photo Studio`, `Film Stage`, `Podcast Lounge`, `Music Suite`, `Art Workshop`), hourly rate caps, minimum crew capacity, amenity filters, and sorting.
- **Challenge 1 — JWT Security with HTTPOnly Cookies:** Exchanges authenticated BetterAuth sessions for signed JWT tokens stored strictly in `httpOnly` cookies (`studiospace_jwt`) and guards all mutating Express endpoints (`POST /api/studios`, `PUT/PATCH /api/studios/:id`, `DELETE /api/studios/:id`, `POST /api/bookings`, `PATCH /api/bookings/:id/*`) with `401 Unauthorized` enforcement.
- **Challenge 2 — MongoDB Double-Booking Prevention:** Inspects live time-slot availability and verifies interval overlap (`startHour < endHour` and `endHour > startHour`) against existing `"Confirmed"` bookings in MongoDB before saving or confirming reservations, rejecting collisions with a clear `409 Conflict` error message and Sonner toast.
- **Challenge 3 — Full-System Cinema Dark & Daylight Light Theme:** Instant, flicker-free theme toggling (`studiodark` / `studiolight`) persisted in `localStorage` and synchronized across all cards, modals, forms, and Sonner notifications.
- **Full Host CRUD with ImgBB / Postimages Integration:** Studio hosts can publish new spaces (`/add-studio`), manage owned spaces in Table or Card view (`/my-listings`), update studio specs (`/studios/edit/[id]`), and remove listings via a custom confirmation modal dialog.
- **PDF Booking Invoice Generator & MongoDB Wishlist (Optional Differentiators):** Logged-in creators can heart/save favorite studios to their MongoDB wishlist and download itemized vector **PDF Booking Invoices** (`StudioSpace-Invoice-SS-*.pdf`) for confirmed reservations.

---

## Tech Stack

| Layer | Technology Selection |
| :--- | :--- |
| **Front-End** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, DaisyUI v5, Swiper.js, Motion, Lucide Icons, Sonner Toasts |
| **Authentication & Authorization** | BetterAuth (Email/Password + Google OAuth), MongoDB Adapter, Express JWT in `HTTPOnly` Cookies |
| **Back-End** | Express.js 5, TypeScript, MongoDB Native Driver, Zod Schema Validation, Helmet, Rate Limiting |

---

## Examiner Test Credentials

You can use the **Auto-Fill** button directly on the `/login` page or enter these credentials manually:

- **Examiner / Host Email:** `host@studiospace.io`
- **Password:** `StudioPass1`

*(Note: This account owns pre-seeded studio listings so you can immediately test **My Studio Listings**, **Update Studio**, **Delete Studio**, **Book Workspace Now**, **Double-Booking Prevention**, **Wishlist**, and **PDF Invoice Download**.)*

---

## Local Setup Steps

### Quick Start (Run Both Server & Client Together from Root)

```bash
npm.cmd run dev
```

Or run them separately:

### 1. Start the Express + MongoDB Backend (`studiospace-server`)

```bash
cd studiospace-server
npm install
cp .env.example .env
# Add your MONGODB_URI and JWT_SECRET in .env
npm run dev
```

### 2. Start the Next.js Client (`studiospace-client`)

```bash
cd studiospace-client
npm install
cp .env.example .env.local
# Add the same MONGODB_URI, BETTER_AUTH_SECRET, and API_URL=http://localhost:5000 in .env.local
npm run dev
```

Open `http://localhost:3000` in your browser.
