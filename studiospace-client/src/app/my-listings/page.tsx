import type { Metadata } from "next";
import PrivateRoute from "@/components/auth/PrivateRoute";
import MyListingsClient from "@/components/studios/MyListingsClient";

export const metadata: Metadata = {
  title: "My Studio Listings",
  description: "Manage, update, or remove your listed studio spaces on StudioSpace.",
};

export default function MyListingsPage() {
  return (
    <PrivateRoute>
      <MyListingsClient />
    </PrivateRoute>
  );
}

