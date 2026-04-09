import { getActiveTestimonials } from "@/lib/actions/testimonials";
import { TestimonialsSectionClient } from "./testimonials-section-client";

export async function TestimonialsSection() {
  const testimonials = await getActiveTestimonials();

  return <TestimonialsSectionClient dbTestimonials={testimonials} />;
}
