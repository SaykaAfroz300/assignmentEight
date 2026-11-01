import type { Metadata } from "next";
import PrivateRoute from "@/components/auth/PrivateRoute";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your StudioSpace dashboard: profile, listings and bookings at a glance.",
};

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <DashboardOverview />
    </PrivateRoute>
  );
}
