import Image from "next/image"; import Link from "next/link"; import {   ArrowLeft,   ArrowRight,   Clock3,   PoundSterling, } from "lucide-react"; import { serviceCategories } from "@/data/services"; import { NailsCatalogue, PedicureCatalogue, WaxingThreadingCatalogue } from "@/components/ServiceFilters/ServiceCatalogueFilters";  type PageProps = {   params: Promise<{     category: string;   }>; };  export default async function ServiceCategoryPage({   params, }: PageProps) {   const { category } = await params;    const serviceCategory = serviceCategories.find(     (item) => item.id === category   );    if (!serviceCategory) {     return (       <main className="min-h-screen bg-[#11100f] px-6 py-24 text-white">         <div className="mx-auto max-w-3xl text-center">           <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">             ORANE ICKENHAM           </p>            <h1 className="mt-6 font-serif text-5xl font-light">             Service Not Found           </h1>            <p className="mt-5 text-white/60">             The service you are looking for is currently unavailable.           </p>            <Link             href="/#services"             className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-medium text-black"           >             <ArrowLeft size={16} />             Back to Services           </Link>         </div>       </main>     );   }    return (     <main className="min-h-screen bg-[#11100f] text-white">       <section className="relative overflow-hidden">         <div className="absolute inset-0">           <Image             src={serviceCategory.image}             alt={serviceCategory.title}             fill             priority             sizes="100vw"             className="object-cover"           />            <div className="absolute inset-0 bg-black/70" />           <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#11100f]" />         </div>          <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-6 pb-20 pt-32">           <Link             href="/#services"             className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-white/70 transition hover:text-[#D4AF37]"           >             <ArrowLeft size={16} />             Back to Services           </Link>            <div className="max-w-4xl">             <p className="text-sm font-medium uppercase tracking-[0.45em] text-[#D4AF37]">               ORANE ICKENHAM             </p>              <h1 className="mt-5 font-serif text-5xl font-light leading-tight md:text-7xl">               {serviceCategory.title}             </h1>              <p className="mt-7 max-w-3xl text-base leading-8 text-white/70 md:text-lg">               {serviceCategory.description}             </p>              <div className="mt-8 flex flex-wrap items-center gap-4">               <span className="rounded-full border border-white/15 bg-black/30 px-5 py-2 text-sm text-white/70 backdrop-blur-md">                 {serviceCategory.services.length} treatments               </span>                <Link                 href={`/booking?category=${encodeURIComponent(                   serviceCategory.id                 )}`}                 className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-medium text-black transition hover:scale-105"               >                 Book Appointment                 <ArrowRight size={16} />               </Link>             </div>           </div>         </div>       </section>        <section className="bg-[#11100f] px-6 py-24">         <div className="mx-auto max-w-6xl">           <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">             <div>               <p className="text-sm uppercase tracking-[0.4em] text-[#D4AF37]">                 TREATMENT CATALOGUE               </p>                <h2 className="mt-4 font-serif text-4xl font-light md:text-5xl">                 Explore Your Treatment               </h2>                <p className="mt-4 max-w-2xl text-white/55">                 Discover each treatment, what to expect, its duration and                 current price before choosing your appointment.               </p>             </div>              <div className="shrink-0 rounded-full border border-[#D4AF37]/40 px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">               Catalog             </div>           </div>            <div className="mt-10">
            {serviceCategory.id === "nails" ? (
              <NailsCatalogue services={serviceCategory.services} />
            ) : serviceCategory.id === "pedicure" ? (
              <PedicureCatalogue services={serviceCategory.services} />) : serviceCategory.id === "waxing-threading" ? (
              <WaxingThreadingCatalogue services={serviceCategory.services} />
            ) : serviceCategory.id === "massage" ? (
              <div className="space-y-5">
                {[
                  {
                    number: "01",
                    title: "Swedish Full Body Massage",
                    services: serviceCategory.services.filter((service) =>
                      service.name
                        .toLowerCase()
                        .startsWith("swedish full body massage")
                    ),
                  },
                  {
                    number: "02",
                    title: "Deep Tissue Massage",
                    services: serviceCategory.services.filter((service) =>
                      service.name
                        .toLowerCase()
                        .startsWith("deep tissue massage")
                    ),
                  },
                  {
                    number: "03",
                    title: "Indian Head Massage",
                    services: serviceCategory.services.filter((service) =>
                      service.name
                        .toLowerCase()
                        .startsWith("indian head massage")
                    ),
                  },
                ]
                  .filter((group) => group.services.length > 0)
                  .map((group) => (
                    <article
                      key={group.title}
                      className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/[0.055] md:p-8"
                    >
                      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-5 lg:w-[48%]">
                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37] sm:flex">
                            {group.number}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-serif text-2xl font-light text-white md:text-3xl">
                              {group.title}
                            </h3>

                            {group.services[0]?.description && (
                              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
                                {group.services[0].description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-full lg:w-[48%]">
                          {group.services.map((service, variantIndex) => (
                            <div
                              key={service.id}
                              className={`flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between ${
                                variantIndex < group.services.length - 1
                                  ? "border-b border-white/10"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-5 text-sm text-white/70">
                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <Clock3
                                    size={15}
                                    className="text-[#D4AF37]"
                                  />
                                  {service.duration}
                                </span>

                                <span className="h-5 w-px bg-white/15" />

                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                  <PoundSterling
                                    size={15}
                                    className="text-[#D4AF37]"
                                  />
                                  {service.price}
                                </span>
                              </div>

                              <Link
                                href={`/booking?category=${encodeURIComponent(
                                  serviceCategory.id
                                )}&service=${service.id}`}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03]"
                              >
                                Book Now
                                <ArrowRight size={15} />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}

                {serviceCategory.services
                  .filter(
                    (service) =>
                      ![
                        "swedish full body massage",
                        "deep tissue massage",
                        "indian head massage",
                      ].some((prefix) =>
                        service.name.toLowerCase().startsWith(prefix)
                      )
                  )
                  .map((service, index) => (
                    <article
                      key={service.id}
                      className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/[0.055] md:p-8"
                    >
                      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-5">
                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37] sm:flex">
                            {String(index + 4).padStart(2, "0")}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-serif text-2xl font-light text-white md:text-3xl">
                              {service.name}
                            </h3>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
                              {service.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/60">
                              <span className="inline-flex items-center gap-2">
                                <Clock3
                                  size={15}
                                  className="text-[#D4AF37]"
                                />
                                {service.duration}
                              </span>

                              <span className="inline-flex items-center gap-2">
                                <PoundSterling
                                  size={15}
                                  className="text-[#D4AF37]"
                                />
                                {service.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/booking?category=${encodeURIComponent(
                            serviceCategory.id
                          )}&service=${service.id}`}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03]"
                        >
                          Book Now
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="space-y-5">
                {serviceCategory.services.map((service, index) => (
                  <article
                    key={service.id}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/[0.055] md:p-8"
                  >
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 gap-5">
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 text-xs text-[#D4AF37] sm:flex">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-serif text-2xl font-light text-white md:text-3xl">
                            {service.name}
                          </h3>

                          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
                            {service.description}
                          </p>

                          <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/60">
                            <span className="inline-flex items-center gap-2">
                              <Clock3
                                size={15}
                                className="text-[#D4AF37]"
                              />
                              {service.duration}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <PoundSterling
                                size={15}
                                className="text-[#D4AF37]"
                              />
                              {service.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/booking?category=${encodeURIComponent(
                          serviceCategory.id
                        )}&service=${service.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03]"
                      >
                        Book Now
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div></section>        <section className="border-t border-[#D4AF37] bg-[#1C1B19] px-6 py-20 text-center text-white">         <div className="mx-auto max-w-3xl">           <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#C49A45]">             READY WHEN YOU ARE           </p>            <h2 className="mt-5 font-serif text-4xl font-light md:text-5xl">             Reserve Your Appointment           </h2>            <p className="mx-auto mt-5 max-w-xl leading-7 text-white/65">             Choose your preferred treatment and continue to our appointment             booking experience.           </p>            <Link             href={`/booking?category=${encodeURIComponent(               serviceCategory.id             )}`}             className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-black transition duration-300 hover:bg-[#e2c45a] hover:scale-105"           >             Book Appointment             <ArrowRight size={16} />           </Link>         </div>       </section>     </main>   ); }

