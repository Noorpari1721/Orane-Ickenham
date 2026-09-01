import Image from "next/image";

const reasons = [
  {
    title: "Experienced Professionals",
    description:
      "Our skilled beauty specialists provide expert treatments with care, precision and attention to detail.",
  },
  {
    title: "Luxury Experience",
    description:
      "Enjoy a calm and elegant salon environment designed for relaxation and confidence.",
  },
  {
    title: "Premium Products",
    description:
      "We use carefully selected professional products to deliver beautiful and lasting results.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-[#D4AF37] bg-[#1C1B19] py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(212,175,55,0.09),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(212,175,55,0.06),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="mb-5 h-[2px] w-20 bg-[#D4AF37]" />

        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-[#D4AF37]">
          WHY CHOOSE US
        </p>

        <div className="grid items-stretch gap-14 lg:grid-cols-2">

          <div className="relative aspect-[4/3] overflow-hidden rounded-[35px] lg:h-full lg:aspect-auto">
            <Image
              src="/images/why-choose-us.jpg"
              alt="Luxury Beauty Salon Experience"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>

            <h2 className="text-4xl font-medium leading-tight text-white md:text-6xl">
              Your Beauty,
              <br />
              Our Passion
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/60">
              At Orane Ickenham, every treatment is designed to give you a
              relaxing luxury experience with professional care and attention.
            </p>

            <div className="mt-10 space-y-7">

              {reasons.map((reason) => (
                <div key={reason.title}>

                  <div className="mb-3 h-[2px] w-10 bg-[#D4AF37]" />

                  <h3 className="text-2xl font-medium text-white">
                    {reason.title}
                  </h3>

                  <p className="mt-2 leading-7 text-white/60">
                    {reason.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}