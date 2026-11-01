import type { Metadata } from "next";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MyBookingsClient from "@/components/bookings/MyBookingsClient";

export const metadata: Metadata = {
  title: "My Bookings",
  description:
    "View your studio reservations, status badges, cancel pending slots, or download PDF booking invoices.",
};

export default function MyBookingsPage() {
  return (
    <PrivateRoute>
      <MyBookingsClient />
    </PrivateRoute>
  );
}

