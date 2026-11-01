# StudioSpace Server — Peer-to-Peer Creative Studio Marketplace API

REST API backend for **StudioSpace** (Variant: `B14-A8-Cat_Harry`), built with **Express 5**, **TypeScript**, **MongoDB Native Driver**, **Zod**, and **HTTPOnly Cookie JWT Authentication**.

## Key Features

- **Challenge 1 — JWT Security with HTTPOnly Cookies:** Exchanges verified BetterAuth sessions for signed JWTs stored exclusively in `httpOnly` cookies (`studiospace_jwt`) and guards all mutating endpoints (`POST /api/studios`, `PUT/PATCH /api/studios/:id`, `DELETE /api/studios/:id`, `POST /api/bookings`, `PATCH /api/bookings/:id/*`, `POST /api/wishlist/toggle`) with `401 Unauthorized` enforcement.
- **Challenge 2 — Booking Double-Booking Prevention:** Uses MongoDB interval overlap operators (`startHour: { $lt: endHour }`, `endHour: { $gt: startHour }`) against existing `"Confirmed"` bookings on the same studio and date, rejecting collisions with `409 Conflict`.
- **Dynamic Featured & Filtered Catalog:** Serves `.limit(6)` top-rated/newest featured studios for the Home page and full text/category/price/capacity/amenity filtering for `/studios`.
- **Host Ownership Protection:** Enforces strict `ownerEmail` verification before updating or deleting any studio document in MongoDB.
- **Saved Studios Wishlist & Reviews:** Persists user wishlists and studio ratings/reviews in MongoDB with automatic rating recalculation.

## API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Health check & server timestamp |
| `POST` | `/api/auth/token` | Session Cookie | Exchanges BetterAuth session for HTTPOnly JWT cookie |
| `GET` | `/api/auth/me` | JWT Cookie | Returns current authenticated user |
| `POST` | `/api/auth/logout` | Public | Clears HTTPOnly JWT cookie |
| `GET` | `/api/studios/featured` | Public | Top 6 featured studios (`.limit(6)`) |
| `GET` | `/api/studios` | Public | Search, category, price, capacity & sort filters |
| `GET` | `/api/studios/mine` | JWT Cookie | Logged-in host's studio listings |
| `GET` | `/api/studios/:id` | Public | Full studio details, reviews & booked time slots |
| `POST` | `/api/studios` | JWT Cookie | Create a new studio in MongoDB `studios` collection |
| `PUT/PATCH` | `/api/studios/:id` | JWT Cookie | Update host-owned studio listing |
| `DELETE` | `/api/studios/:id` | JWT Cookie | Delete host-owned studio listing |
| `POST` | `/api/studios/:id/reviews` | JWT Cookie | Add creator review & recalculate rating |
| `GET` | `/api/bookings` | JWT Cookie | List user's bookings (`?role=renter` or `?role=host`) |
| `GET` | `/api/bookings/studio/:studioId` | Public | Active booked slots for a studio |
| `POST` | `/api/bookings` | JWT Cookie | Create booking (`Pending`) with overlap check |
| `PATCH` | `/api/bookings/:id/cancel` | JWT Cookie | Cancel a `Pending` booking |
| `PATCH` | `/api/bookings/:id/status` | JWT Cookie | Update status (`Confirmed`, `Completed`, `Cancelled`) |
| `GET` | `/api/wishlist` | JWT Cookie | Get user's saved studios from MongoDB |
| `POST` | `/api/wishlist/toggle` | JWT Cookie | Toggle studio in user's MongoDB wishlist |

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your `MONGODB_URI` and `JWT_SECRET`.
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

