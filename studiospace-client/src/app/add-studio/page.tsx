import type { Metadata } from "next";
import PrivateRoute from "@/components/auth/PrivateRoute";
import StudioForm from "@/components/studios/StudioForm";

export const metadata: Metadata = {
  title: "Add New Studio",
  description:
    "List your photography cyc wall, soundstage, podcast room, music suite, or art workshop on StudioSpace.",
};

export default function AddStudioPage() {
  return (
    <PrivateRoute>
      <StudioForm mode="create" />
    </PrivateRoute>
  );
}

