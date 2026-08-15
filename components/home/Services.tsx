import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/data/services";

export default function Services() {
  return (
    <section
      id="services"
      className="bg-white py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-5 h-[2px] w-20 bg-[#C49A45]" />

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.45em] text-[#C49A45]">
            OUR SERVICES
          </p>

          <h2 className="text-4xl font-medium text-[#1A1A1A] md:text-6xl">
            Luxury Beauty
            <br />
            Treatments
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Discover personalised beauty treatments designed around your
            comfort, confidence and style.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((service) => (
            <article
              key={service.id}
              className="group overflow-hidden rounded-[30px] bg-[#F8F5F2] transition duration-500 hover:-translate-y-3 hover:shadow-xl"
            >
              <Link
                href={`/services/${service.id}`}
                className="block"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/10" />

                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#C49A45] transition-all duration-500 group-hover:w-full" />
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="min-w-0 text-2xl font-medium text-[#1A1A1A]">
                      {service.title}
                    </h3>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C49A45]/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A752D] transition group-hover:bg-[#C49A45] group-hover:text-white">
                      Catalog
                      <ArrowRight size={12} />
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-gray-600">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                    <span className="text-sm text-gray-500">
                      {service.services.length} treatments
                    </span>

                    <span className="text-sm font-medium text-[#9A752D]">
                      Explore Services
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
