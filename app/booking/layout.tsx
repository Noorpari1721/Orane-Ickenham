import type { ReactNode } from "react";
import { BookingProvider } from "@/context/BookingContext";
import BookingNavbar from "@/components/layout/BookingNavbar";
import Footer from "@/components/layout/Footer";

export default function BookingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-[#050505]">

        <BookingNavbar />

        <div className="pt-[84px]">
          {children}
        </div>

        <Footer />

      </div>
    </BookingProvider>
  );
}
