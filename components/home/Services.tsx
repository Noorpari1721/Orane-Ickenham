import Image from "next/image";

const services = [
  {
    title: "Head Spa",
    image: "/images/services/head-spa.jpg",
    description:
      "Relaxing head spa treatments designed to refresh your scalp and provide deep relaxation.",
  },
  {
    title: "Nails",
    image: "/images/services/nails.jpg",
    description:
      "Elegant nail treatments with beautiful finishes tailored to your style.",
  },
  {
    title: "Lashes",
    image: "/images/services/lashes.jpg",
    description:
      "Professional lash treatments to enhance your natural beauty.",
  },
  {
    title: "Facial",
    image: "/images/services/facial.jpg",
    description:
      "Luxury facial treatments using professional techniques for glowing skin.",
  },
  {
    title: "Massage",
    image: "/images/services/massage.jpg",
    description:
      "Relaxing massage experiences created to help you unwind.",
  },
  {
    title: "Beauty Treatments",
    image: "/images/services/beauty.jpg",
    description:
      "Complete beauty care services delivered with precision and attention.",
  },
];

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

          {services.map((service) => (

            <div
              key={service.title}
              className="group overflow-hidden rounded-[30px] bg-[#F8F5F2] transition duration-500 hover:-translate-y-3 hover:shadow-xl"
            >

              <div className="relative aspect-[4/3] overflow-hidden">

                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />


                <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#C49A45] transition-all duration-500 group-hover:w-full" />

              </div>



              <div className="p-8">

                <h3 className="text-2xl font-medium text-[#1A1A1A]">
                  {service.title}
                </h3>


                <p className="mt-4 leading-7 text-gray-600">
                  {service.description}
                </p>


              </div>


            </div>

          ))}

        </div>


      </div>


    </section>
  );
}