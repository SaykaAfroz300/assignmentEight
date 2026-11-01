import type { Metadata } from "next";
import StudioDetailsClient from "@/components/studios/StudioDetailsClient";

export const metadata: Metadata = {
  title: "Studio Specifications & Booking",
  description:
    "Inspect full workspace specifications, lighting and acoustic amenities, live slot availability, and book instantly.",
};

export default async function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudioDetailsClient studioId={id} />;
}

