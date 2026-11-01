import type { Metadata } from "next";
import PrivateRoute from "@/components/auth/PrivateRoute";
import StudioForm from "@/components/studios/StudioForm";

export const metadata: Metadata = {
  title: "Update Studio Listing",
  description: "Edit your creative workspace specifications, hourly rate, and amenities.",
};

export default async function EditStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PrivateRoute>
      <StudioForm mode="edit" studioId={id} />
    </PrivateRoute>
  );
}

