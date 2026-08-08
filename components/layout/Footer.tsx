"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] text-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 lg:grid-cols-4">


        {/* Brand */}

        <div>
          <h3 className="text-3xl font-semibold tracking-[0.3em]">
            ORANE
          </h3>

          <div className="mt-4 h-[2px] w-16 bg-[#C49A45]" />

          <p className="mt-6 leading-7 text-gray-400">
            Luxury beauty treatments designed to help you relax,
            refresh and feel confident.
          </p>


          <div className="mt-8 flex gap-4">

            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-sm font-semibold transition duration-300 hover:-translate-y-1 hover:border-[#C49A45] hover:text-[#C49A45]"
            >
              IG
            </a>


            <a
              href="#"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-sm font-semibold transition duration-300 hover:-translate-y-1 hover:border-[#C49A45] hover:text-[#C49A45]"
            >
              FB
            </a>

          </div>

        </div>



        {/* Navigation */}

        <div>

          <h4 className="mb-6 text-lg font-medium">
            Explore
          </h4>


          <ul className="space-y-4 text-gray-400">

            {[
              ["Home", "/#home"],
              ["About", "/#about"],
              ["Services", "/#services"],
              ["Gallery", "/#gallery"],
              ["Book Appointment", "/booking"],
            ].map(([name, link]) => (

              <li key={name}>

                <Link
                  href={link}
                  className="transition duration-300 hover:pl-2 hover:text-[#C49A45]"
                >
                  {name}
                </Link>

              </li>

            ))}

          </ul>

        </div>



        {/* Contact */}

        <div>

          <h4 className="mb-6 text-lg font-medium">
            Contact
          </h4>


          <div className="space-y-5 text-gray-400">


            <a
              href="tel:01895217151"
              className="flex gap-4 transition hover:text-[#C49A45]"
            >
              <Phone
                size={20}
                className="text-[#C49A45]"
              />

              <span>
                01895 217151
              </span>

            </a>



            <a
              href="mailto:oraneickenham@gmail.com"
              className="flex gap-4 transition hover:text-[#C49A45]"
            >
              <Mail
                size={20}
                className="text-[#C49A45]"
              />

              <span>
                oraneickenham@gmail.com
              </span>

            </a>



            <div className="flex gap-4">

              <MapPin
                size={20}
                className="text-[#C49A45]"
              />

              <span>
                Ickenham,
                <br />
                United Kingdom
              </span>

            </div>


          </div>


        </div>




        {/* Hours */}

        <div>

          <h4 className="mb-6 text-lg font-medium">
            Opening Hours
          </h4>


          <div className="flex gap-4 text-gray-400">

            <Clock
              size={20}
              className="text-[#C49A45]"
            />


            <div>
              <p>
                Monday - Saturday
              </p>

              <p>
                10:00 AM - 7:00 PM
              </p>

              <p className="mt-3 text-[#C49A45]">
                Sunday Closed
              </p>
            </div>


          </div>

        </div>


      </div>



      {/* Bottom */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 md:flex-row md:justify-between">

          <p>
            Â© {new Date().getFullYear()} ORANE Ickenham. All rights reserved.
          </p>

          <p>
            Luxury Beauty Salon
          </p>

        </div>

      </div>


    </footer>
  );
}
