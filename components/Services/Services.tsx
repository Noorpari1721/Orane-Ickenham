import Image from "next/image";

const services = [
  {
    title: "Hair",
    image: "/images/services/hair.jpg",
  },
  {
    title: "Nails",
    image: "/images/services/nails.jpg",
  },
  {
    title: "Lashes",
    image: "/images/services/lashes.jpg",
  },
  {
    title: "Facials",
    image: "/images/services/facial.jpg",
  },
  {
    title: "Massage",
    image: "/images/services/massage.jpg",
  },
  {
    title: "Beauty",
    image: "/images/services/beauty.jpg",
  },
];

export default function Services() {
  return (
    <section className="bg-[#F8F5F2] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 uppercase tracking-[0.4em] text-[#D4AF37]">
            Our Services
          </p>

          <h2 className="text-4xl font-light text-[#1A1A1A] md:text-6xl">
            Luxury Treatments
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Indulge in premium beauty treatments delivered by experienced
            professionals in a relaxing and luxurious environment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-light text-[#1A1A1A]">
                  {service.title}
                </h3>

                <div className="mt-4 h-[2px] w-12 bg-[#D4AF37] transition-all duration-500 group-hover:w-24"></div>

                <button className="mt-6 font-medium uppercase tracking-[0.15em] text-[#D4AF37] transition hover:text-black">
                  Learn More â†’
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
