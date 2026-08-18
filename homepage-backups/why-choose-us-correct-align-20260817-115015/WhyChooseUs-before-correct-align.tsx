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
    <section id="about" className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-14 lg:grid-cols-2">

          <div className="hidden lg:block" aria-hidden="true" />

          <div>
            <div className="mb-5 h-[2px] w-20 bg-[#C49A45]" />

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-[#C49A45]">
              WHY CHOOSE US
            </p>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">

              <div className="order-2 lg:order-1">
                <h2 className="text-4xl font-medium leading-tight text-[#1A1A1A] md:text-6xl">
                  Your Beauty,
                  <br />
                  Our Passion
                </h2>

                <p className="mt-6 text-lg leading-8 text-gray-600">
                  At Orane Ickenham, every treatment is designed to give you a
                  relaxing luxury experience with professional care and attention.
                </p>

                <div className="mt-10 space-y-7">
                  {reasons.map((reason) => (
                    <div key={reason.title}>
                      <div className="mb-3 h-[2px] w-10 bg-[#C49A45]" />

                      <h3 className="text-2xl font-medium text-[#1A1A1A]">
                        {reason.title}
                      </h3>

                      <p className="mt-2 leading-7 text-gray-600">
                        {reason.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 hidden lg:block">
                <div className="h-full overflow-hidden rounded-[35px]">
                  <Image
                    src="/images/why-choose-us.jpg"
                    alt="Luxury Beauty Salon Experience"
                    width={900}
                    height={1200}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}