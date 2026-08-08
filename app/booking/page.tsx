"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import BookingShell from "@/components/booking/BookingShell";
import Step1Category from "@/components/booking/steps/Step1Category";
import Step2Service from "@/components/booking/steps/Step2Service";
import Step3Staff from "@/components/booking/steps/Step3Staff";
import Step4Calendar from "@/components/booking/steps/Step4Calendar";
import Step5Time from "@/components/booking/steps/Step5Time";
import Step6Customer from "@/components/booking/steps/Step6Customer";
import Step7Review from "@/components/booking/steps/Step7Review";
import { useBooking } from "@/context/BookingContext";

export default function BookingPage() {
  const { booking } = useBooking();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [booking.step]);

  const renderStep = () => {
    switch (booking.step) {
      case 1:
        return <Step1Category />;

      case 2:
        return <Step2Service />;

      case 3:
        return <Step3Staff />;

      case 4:
        return <Step4Calendar />;

      case 5:
        return <Step5Time />;

      case 6:
        return <Step6Customer />;

      case 7:
        return <Step7Review />;

      default:
        return <Step1Category />;
    }
  };

  return (
    <BookingShell>
      <motion.div
        key={booking.step}
        initial={{
          opacity: 0,
          y: 35,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -25,
          scale: 0.985,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {renderStep()}
      </motion.div>
    </BookingShell>
  );
}

