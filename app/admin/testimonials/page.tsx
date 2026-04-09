import { getAllTestimonials } from "@/lib/actions/testimonials";
import { TestimonialsManagerClient } from "./testimonials-manager-client";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return <TestimonialsManagerClient initialTestimonials={testimonials} />;
}
