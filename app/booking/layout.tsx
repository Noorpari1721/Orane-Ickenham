import type { ReactNode } from "react";
import { BookingProvider } from "@/context/BookingContext";

export default function BookingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BookingProvider>
      <main className="min-h-screen bg-[#F8F5F0]">
        {children}
      </main>
    </BookingProvider>
  );
}
