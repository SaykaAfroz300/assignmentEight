import { Suspense } from "react";
import type { Metadata } from "next";
import ExploreStudiosClient from "@/components/studios/ExploreStudiosClient";
import BrandLoader from "@/components/ui/BrandLoader";

export const metadata: Metadata = {
  title: "Explore Creative Studios",
  description:
    "Browse and filter photography cyc walls, cinema sound stages, podcast lounges, music suites, and art workshops.",
};

export default function ExploreStudiosPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen label="Loading studio catalog…" />}>
      <ExploreStudiosClient />
    </Suspense>
  );
}

