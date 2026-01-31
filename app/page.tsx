import { HeroSection } from "@/components/landing/hero-section";
import { RoomsSection } from "@/components/landing/rooms-section";
import { SurfSection } from "@/components/landing/surf-section";
import { PackagesSection } from "@/components/landing/packages-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { LocationSection } from "@/components/landing/location-section";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

async function getLandingData() {
  const supabase = await createClient();

  // Fetch rooms with pricing
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("type");

  // Fetch services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .limit(4);

  // Fetch room stats
  const { data: beds } = await supabase
    .from("beds")
    .select("id")
    .eq("is_active", true);

  // Fetch surf packages
  const { data: packages } = await supabase
    .from("surf_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .limit(6);

  return {
    rooms: rooms || [],
    services: services || [],
    packages: packages || [],
    totalBeds: beds?.length || 0,
    roomTypes: rooms?.length || 0,
  };
}

export default async function HomePage() {
  const { rooms, services, packages, totalBeds, roomTypes } =
    await getLandingData();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />
      <main>
        <HeroSection />
        <RoomsSection
          rooms={rooms}
          totalBeds={totalBeds}
          roomTypes={roomTypes}
        />
        <PackagesSection packages={packages} />
        <SurfSection services={services} />
        <TestimonialsSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}
