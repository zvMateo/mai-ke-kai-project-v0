import { HeroSection } from "@/components/landing/hero-section";
import { RoomsSection } from "@/components/landing/rooms-section";
import { SurfSection } from "@/components/landing/surf-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { LocationSection } from "@/components/landing/location-section";
import { Header } from "@/components/landing/header";
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

  return {
    rooms: rooms || [],
    services: services || [],
    totalBeds: beds?.length || 0,
    roomTypes: rooms?.length || 0,
  };
}

export default async function HomePage() {
  const { rooms, services, totalBeds, roomTypes } = await getLandingData();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-background">
      <Header locale={locale} />
      <main>
        <HeroSection />
        <RoomsSection
          rooms={rooms}
          totalBeds={totalBeds}
          roomTypes={roomTypes}
        />
        <SurfSection services={services} />
        <TestimonialsSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}
