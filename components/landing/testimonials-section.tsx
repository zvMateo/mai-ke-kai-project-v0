"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  ExternalLink,
} from "lucide-react";

// Google Reviews - Mai Ke Kai Surf House
const testimonials = [
  {
    id: 1,
    name: "Yessi Mujica",
    rating: 5,
    text: "El mejor hostel para hospedarte en Tamarindo!!Los dueños unos genios, las chicas que trabajan muy amables y atentas, Paula la mejor 🤭Cerca de todo, facil acceso a pie.Muy comodo los espacios, me sentí como en casa.Super agradecida y sin dudas volveré aquí 🤙🏼✨",
    date: "Diciembre 2025",
  },
  {
    id: 2,
    name: "David Elmore",
    rating: 5,
    text: "Esta casa y laso personas que viven y trabajan ahi son increibles. Los jefes son perfecto. Atmosfera estaba muy bien.  Cerca de la playa. Yo puedo caminar en diez minutos. Y esta cerca del Mercado de local y mas el Banco esta a Cinco minutos  de la casa.",
    date: "Diciembre 2025",
  },
  {
    id: 3,
    name: "Sara Garutti",
    rating: 5,
    text: "Excelente lugar para hospedarse! Está cerca de todo y los dueños y toda persona que trabaja en el hostel son super amables. El lugar está siempre limpio y lleno de buenas vibras 🙌",
    date: "Diciembre 2025",
  },
  {
    id: 4,
    name: "Dani Vidrio",
    rating: 5,
    text: "Es un hostal increible, está super cerca de todo, son muy amables y el lugar es demasiado lindo y cómodo para estar ahíTomé una clase de surf con ellos y me encantó, el maestro es muy bueno y me divertí muchisimo",
    date: "Diciembre 2025",
  },
  {
    id: 5,
    name: "Serena Pasetti",
    rating: 5,
    text: "El lugar es increíble, tiene un jardín precioso y una terraza super amplia dónde se puede hacer ejercicio.Queda cerca del centro y de la playa.Ofrecen clases de surf y excursiones buenísimas, que están a mejor precio que en otros lados. Sin dudas, volvería a hospedarme ahí en mi vuelta a tamarindo!",
    date: "Agosto 2025",
  },
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Mai+Ke+Kai+Surf+House/@10.2971219,-85.8411847,17z/data=!4m20!1m10!3m9!1s0x8f9e39527f1021e3:0xa5529cf38cffffed!2sMai+Ke+Kai+Surf+House!5m2!4m1!1i2!8m2!3d10.2971219!4d-85.8386098!16s%2Fg%2F11v18fnt6n!3m8!1s0x8f9e39527f1021e3:0xa5529cf38cffffed!5m2!4m1!1i2!8m2!3d10.2971219!4d-85.8386098!16s%2Fg%2F11v18fnt6n?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D";
const GOOGLE_RATING = 4.9;
const GOOGLE_REVIEWS_COUNT = 213;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary",
    "bg-seafoam",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-emerald-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % testimonials.length),
    []
  );
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Lo Que Dicen Nuestros Huéspedes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Únete a cientos de viajeros felices que encontraron su paraíso del
            surf con nosotros.
          </p>

          {/* Google Rating Badge */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-md border hover:shadow-lg transition-shadow"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-label="Google">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">
                {GOOGLE_RATING}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(GOOGLE_RATING)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {GOOGLE_REVIEWS_COUNT} reseñas
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>

        {/* Featured Testimonial */}
        <div
          className="max-w-4xl mx-auto mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-seafoam/10">
            <CardContent className="p-8 md:p-12">
              <Quote className="w-12 h-12 text-primary/20 mb-6" />
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                "{testimonials[current].text}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(
                      testimonials[current].name
                    )}`}
                  >
                    {getInitials(testimonials[current].name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonials[current].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[current].date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === current ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mini Reviews Grid */}
        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((review) => (
            <Card key={review.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(review.name)}`}
                  >
                    {getInitials(review.name)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>*/}

        {/* CTA to Google */}
        <div className="text-center mt-10">
          <Button variant="outline" asChild className="gap-2">
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
              Ver todas las reseñas en Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
