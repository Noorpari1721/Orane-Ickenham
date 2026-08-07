import Link from "next/link";

export default function CTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#111111] py-28"
    >

      {/* Background Effect */}

      <div className="absolute inset-0 bg-gradient-to-r from-[#C49A45]/10 via-transparent to-[#C49A45]/10" />


      <div className="relative mx-auto max-w-5xl px-6 text-center">


        {/* Heading */}

        <div className="mx-auto mb-5 h-[2px] w-20 bg-[#C49A45]" />


        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-[#C49A45]">
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


        {/* Buttons */}

        <div className="mt-12 flex flex-wrap justify-center gap-5">


          <Link
            href="/booking"
            className="rounded-full bg-[#C49A45] px-10 py-4 font-medium text-white transition duration-300 hover:scale-105 hover:bg-[#A67C2E]"
          >
            Book Appointment
          </Link>


          <Link
            href="tel:01895217151"
            className="rounded-full border border-white/30 px-10 py-4 text-white transition duration-300 hover:border-[#C49A45] hover:bg-white/10"
          >
            Call Salon
          </Link>


        </div>


      </div>


    </section>
  );
}