import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";
import { RoomsSection } from "@/components/landing/rooms-section";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { WaveDivider } from "@/components/ui/wave-divider";

// Below-the-fold sections — loaded lazily to improve initial bundle
const PackagesSection = dynamic(() =>
  import("@/components/landing/packages-section").then((m) => ({ default: m.PackagesSection }))
);
const SurfSection = dynamic(() =>
  import("@/components/landing/surf-section").then((m) => ({ default: m.SurfSection }))
);
const TestimonialsSection = dynamic(() =>
  import("@/components/landing/testimonials-section").then((m) => ({ default: m.TestimonialsSection }))
);
const GallerySection = dynamic(() =>
  import("@/components/landing/gallery-section").then((m) => ({ default: m.GallerySection }))
);
const BlogSection = dynamic(() =>
  import("@/components/landing/blog-section").then((m) => ({ default: m.BlogSection }))
);
const LocationSection = dynamic(() =>
  import("@/components/landing/location-section").then((m) => ({ default: m.LocationSection }))
);
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { getHotelSettings } from "@/lib/actions/settings";

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

// Format HH:MM to human-readable (e.g. "15:00" → "3pm")
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

export default async function HomePage() {
  const [{ rooms, services, packages, totalBeds, roomTypes }, settings] =
    await Promise.all([getLandingData(), getHotelSettings()]);
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />
      <main>
        <HeroSection />
        <WaveDivider color="fill-background" />
        <RoomsSection
          rooms={rooms}
          totalBeds={totalBeds}
          roomTypes={roomTypes}
          checkInTime={formatTime(settings.check_in_time)}
          checkOutTime={formatTime(settings.check_out_time)}
        />
        <PackagesSection packages={packages} />
        <SurfSection services={services} />
        <TestimonialsSection />
        <GallerySection />
        <BlogSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}
