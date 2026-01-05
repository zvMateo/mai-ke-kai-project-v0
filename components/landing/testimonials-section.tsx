"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "California, USA",
    avatar: "/young-woman-smiling-beach-blonde.jpg",
    rating: 5,
    text: "Best surf trip ever! The staff was incredible, the vibes were perfect, and I caught my first green wave. Already planning my return!",
    date: "November 2024",
  },
  {
    id: 2,
    name: "Thomas K.",
    location: "Berlin, Germany",
    avatar: "/young-man-with-beard-smiling-outdoor.jpg",
    rating: 5,
    text: "Amazing location, super clean facilities, and the surf lessons were top-notch. The dorm was social but comfortable. 10/10 recommend!",
    date: "October 2024",
  },
  {
    id: 3,
    name: "Maria L.",
    location: "Barcelona, Spain",
    avatar: "/woman-with-dark-hair-smiling-tropical.jpg",
    rating: 5,
    text: "Came for a week, stayed for a month. The family room was perfect for us. Kids loved the beach and the catamaran tour was unforgettable.",
    date: "September 2024",
  },
  {
    id: 4,
    name: "James W.",
    location: "Sydney, Australia",
    avatar: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "As an intermediate surfer, I appreciated how they matched me with the right spots. Great waves, great people, great pura vida experience.",
    date: "August 2024",
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">What Our Guests Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join hundreds of happy travelers who found their surf paradise with us.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-seafoam/10">
            <CardContent className="p-8 md:p-12">
              <Quote className="w-12 h-12 text-primary/20 mb-6" />
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">"{testimonials[current].text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonials[current].avatar || "/placeholder.svg"}
                    alt={testimonials[current].name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[current].location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full bg-transparent">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === current ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full bg-transparent">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mini Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((review) => (
            <Card key={review.id} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={review.avatar || "/placeholder.svg"}
                    alt={review.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
