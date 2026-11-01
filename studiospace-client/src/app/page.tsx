import HeroSlider from "@/components/home/HeroSlider";
import FeaturedStudios from "@/components/home/FeaturedStudios";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturedStudios />
      <CategoryShowcase />
      <HowBookingWorks />
      <HostGuarantee />
    </>
  );
}
