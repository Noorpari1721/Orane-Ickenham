import Link from "next/link";

const MAP_QUERY =
  "87 High Road, Ickenham, UB10 8LH, United Kingdom";

export default function CTA() {
  const directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(MAP_QUERY);

  const mapUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(MAP_QUERY) +
    "&output=embed";

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#111111] py-20 md:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/10" />

      <div className="relative mx-auto max-w-[1600px] px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-12 xl:gap-16">

          {/* LEFT SIDE - CONTACT + MAP */}
          <div className="text-center lg:text-left">
            <div className="mb-5 h-[2px] w-20 bg-[#D4AF37] mx-auto lg:mx-0" />

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-[#D4AF37]">
              CONTACT US
            </p>

            <h2 className="text-4xl font-medium leading-tight text-white md:text-5xl">
              Visit Our
              <br />
              Luxury Salon
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300 mx-auto lg:mx-0">
              Experience premium beauty treatments in a relaxing and luxurious
              environment at Orane Ickenham.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
              <div>
                <p className="text-lg font-medium text-white">
                  Orane Ickenham
                </p>

                <p className="mt-2 text-gray-300">
                  87 High Road, Ickenham
                  <br />
                  UB10 8LH, United Kingdom
                </p>
              </div>

              <div className="border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Getting Here
                </p>

                <div className="space-y-3 text-sm leading-6 text-gray-300">
                  <p>
                    <span className="font-medium text-white">
                      Nearest Underground:
                    </span>{" "}
                    West Ruislip Station – 2 mins walk.
                  </p>

                  <p>
                    <span className="font-medium text-white">
                      West Ruislip Station:
                    </span>{" "}
                    U1, U10, 278, E7
                  </p>

                  <p>
                    <span className="font-medium text-white">
                      Ickenham Pump / High Road:
                    </span>{" "}
                    U1, 278
                  </p>
                </div>
              </div>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full border border-[#D4AF37] px-8 py-4 font-medium text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37] hover:text-white"
            >
              Get Directions
            </a>

            <div className="mt-10 overflow-hidden rounded-2xl border border-[#D4AF37]/40 shadow-2xl">
              <iframe
                title="Orane Ickenham Location"
                src={mapUrl}
                className="h-[380px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* RIGHT SIDE - CTA + SOCIAL */}
          <div className="flex flex-col lg:min-h-[680px] lg:border-l lg:border-white/10 lg:pl-10 xl:pl-14">

            {/* CTA */}
            <div className="text-center">
              <div className="mx-auto mb-5 h-[2px] w-20 bg-[#D4AF37]" />

              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-[#D4AF37]">
                BOOK YOUR VISIT
              </p>

              <h2 className="text-4xl font-medium leading-tight text-white md:text-6xl">
                Your Luxury Beauty
                <br />
                Experience Awaits
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300">
                Relax, refresh and enjoy premium beauty treatments delivered by
                experienced professionals in a luxurious salon environment.
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-5">
                <Link
                  href="/booking"
                  className="rounded-full bg-[#D4AF37] px-10 py-4 font-medium text-white transition duration-300 hover:scale-105 hover:bg-[#A67C2E]"
                >
                  Book Appointment
                </Link>

                <Link
                  href="tel:01895217151"
                  className="rounded-full border border-white/30 px-10 py-4 text-white transition duration-300 hover:border-[#D4AF37] hover:bg-white/10"
                >
                  Call Salon
                </Link>
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div className="mt-14 flex flex-1 items-center justify-center lg:mt-0">
              <div className="w-full max-w-xl border-t border-white/10 pt-8 text-center">
                <p className="mb-7 text-sm font-semibold uppercase tracking-[0.4em] text-[#D4AF37]">
                  FOLLOW ORANE ICKENHAM
                </p>

                <div className="flex items-center justify-center gap-10">

                  <a
                    href="https://www.instagram.com/oraneickenham?igsh=MWduanFxaG1saHRjeg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="group flex items-center justify-center transition duration-300 hover:scale-110"
                  >
                    <img
                      src="/images/icons/instagram-icon.png"
                      alt="Instagram"
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                    />
                  </a>

                  <a
                    href="https://www.facebook.com/share/18yfu5Wsm1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="group flex items-center justify-center transition duration-300 hover:scale-110"
                  >
                    <img
                      src="/images/icons/facebook-icon.png"
                      alt="Facebook"
                      className="h-24 w-24 object-contain md:h-28 md:w-28"
                    />
                  </a>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}