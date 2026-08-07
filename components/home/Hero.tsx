"use client";

import Button from "@/components/ui/Button";

export default function Hero() {
  const scrollToServices = () => {
    document.querySelector("#services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Video */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}

      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-4xl text-center text-white">

          <p className="mb-6 text-sm font-medium uppercase tracking-[0.45em] text-[#C49A45]">
            ORANE ICKENHAM • LUXURY BEAUTY SALON
          </p>

          <h1 className="text-4xl font-light leading-tight md:text-6xl lg:text-7xl">
            Beauty That
            <br />
            Inspires
            <span className="text-[#C49A45]"> Confidence</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-gray-200 md:text-lg">
            Discover expert nails, lashes, head spa, facials and beauty
            treatments in a luxurious setting where every appointment
            is designed around you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Button
              text="Book Appointment"
            />

            <button
              onClick={scrollToServices}
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-white/80
                bg-transparent
                px-8
                py-4
                text-sm
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white
                transition-all
                duration-300
                hover:scale-105
                hover:bg-white
                hover:text-black
              "
            >
              Explore Services
            </button>

          </div>

        </div>
      </div>

      {/* Scroll Indicator */}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white">
        ↓
      </div>
    </section>
  );
}