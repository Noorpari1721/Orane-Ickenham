import Image from "next/image";

const galleryImages = [
  {
    src: "/images/gallery/head-spa-1.jpg",
    alt: "Luxury Head Spa Treatment",
  },
  {
    src: "/images/gallery/head-spa-2.jpg",
    alt: "Relaxing Head Spa Experience",
  },
  {
    src: "/images/gallery/nails-1.jpg",
    alt: "Luxury Nail Treatment",
  },
  {
    src: "/images/gallery/nails-2.jpg",
    alt: "Beautiful Nail Design",
  },
  {
    src: "/images/gallery/lashes-1.jpg",
    alt: "Professional Lash Treatment",
  },
  {
    src: "/images/gallery/facial.jpg",
    alt: "Luxury Facial Treatment",
  },
  {
    src: "/images/gallery/massage.jpg",
    alt: "Relaxing Massage Treatment",
  },
  {
    src: "/images/gallery/beauty.jpg",
    alt: "Luxury Beauty Treatment",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="bg-[#F8F5F2] py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <div className="mx-auto mb-5 h-[2px] w-20 bg-[#C49A45]" />

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.45em] text-[#C49A45]">
            OUR WORK
          </p>

          <h2 className="text-4xl font-medium text-[#1A1A1A] md:text-6xl">
            Beauty Created
            <br />
            With Precision
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore our latest beauty transformations and luxury salon
            experiences.
          </p>

        </div>


        {/* Gallery */}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {galleryImages.map((image) => (

            <div
              key={image.src}
              className="group relative overflow-hidden rounded-[30px]"
            >

              <div className="relative aspect-[4/3]">

                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

              </div>


              {/* Hover Overlay */}

              <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />


              {/* Gold Accent */}

              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#C49A45] transition-all duration-500 group-hover:w-full" />

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}