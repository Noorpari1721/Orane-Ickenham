"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);

  const previous = () =>
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );

  const testimonial = testimonials[current];

  return (
    <section className="bg-[#F8F5F2] py-28">
      <div className="mx-auto max-w-5xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">

          <div className="mx-auto mb-5 h-[2px] w-20 bg-[#A67C2E]"></div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.45em] text-[#A67C2E]">
            CLIENT LOVE
          </p>

          <h2 className="text-4xl font-medium text-[#1A1A1A] md:text-6xl">
            What Our Clients Say
          </h2>

        </div>

        {/* Testimonial Card */}

        <div className="rounded-[36px] border border-white/50 bg-white p-10 shadow-xl md:p-16">

          <div className="mb-8 flex justify-center gap-2">
            {[...Array(testimonial.rating)].map((_, index) => (
              <Star
                key={index}
                size={24}
                fill="#A67C2E"
                color="#A67C2E"
              />
            ))}
          </div>

          <p className="mx-auto max-w-3xl text-center text-2xl font-light leading-relaxed text-gray-700 md:text-3xl">
            â€œ{testimonial.review}â€
          </p>

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-medium text-[#1A1A1A]">
              {testimonial.name}
            </h3>

            <p className="mt-2 text-[#A67C2E]">
              {testimonial.service}
            </p>
          </div>

        </div>

        {/* Controls */}

        <div className="mt-10 flex items-center justify-center gap-8">

          <button
            onClick={previous}
            className="rounded-full border border-[#A67C2E] p-3 transition hover:bg-[#A67C2E] hover:text-white"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-3 w-3 rounded-full transition ${
                  current === index
                    ? "bg-[#A67C2E]"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="rounded-full border border-[#A67C2E] p-3 transition hover:bg-[#A67C2E] hover:text-white"
          >
            <ChevronRight size={22} />
          </button>

        </div>

      </div>
    </section>
  );
}
