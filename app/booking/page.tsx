"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import BookingShell from "@/components/booking/BookingShell";

import Step1Services from "@/components/booking/steps/Step1Services";
import Step2Date from "@/components/booking/steps/Step2Date";
import Step3Time from "@/components/booking/steps/Step3Time";
import Step4Customer from "@/components/booking/steps/Step4Customer";
import Step5Consultation from "@/components/booking/steps/Step5Consultation";
import Step6Review from "@/components/booking/steps/Step6Review";
import Step7Payment from "@/components/booking/steps/Step7Payment";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

export default function BookingPage() {
  const {
    booking,
    updateBooking,
  } = useBooking();

  const initializedFromUrl = useRef(false);

  /*
   * Home Services routing
   *
   * Supported URLs:
   *
   * /booking?category=packages
   *
   * /booking?category=packages&service=123
   *
   * The category must always be respected instead of
   * allowing Step1Services to fall back to Japanese Head Spa.
   */
  useEffect(() => {
    if (initializedFromUrl.current) {
      return;
    }

    initializedFromUrl.current = true;

    const params = new URLSearchParams(
      window.location.search
    );

    const categoryId =
      params.get("category")?.trim() || "";

    const serviceIdValue =
      params.get("service")?.trim() || "";

    if (!categoryId) {
      return;
    }

    const category = serviceCategories.find(
      (item) => item.id === categoryId
    );

    if (!category) {
      return;
    }

    /*
     * Category only:
     * open the requested category and keep the user
     * on Step 1.
     */
    if (!serviceIdValue) {
      updateBooking({
        category: category.id,
        service: null,
        services: [],
        treatment: null,
        staff: null,
        date: null,
        time: "",
        step: 1,
        completed: false,
        editingReview: false,
      });

      return;
    }

    /*
     * Category + treatment:
     * open the requested category and preserve the
     * treatment selected from Home Services.
     */
    const serviceId = Number(serviceIdValue);

    if (!Number.isInteger(serviceId)) {
      updateBooking({
        category: category.id,
        service: null,
        services: [],
        treatment: null,
        staff: null,
        date: null,
        time: "",
        step: 1,
        completed: false,
        editingReview: false,
      });

      return;
    }

    const selectedService = category.services.find(
      (service) => service.id === serviceId
    );

    if (!selectedService) {
      updateBooking({
        category: category.id,
        service: null,
        services: [],
        treatment: null,
        staff: null,
        date: null,
        time: "",
        step: 1,
        completed: false,
        editingReview: false,
      });

      return;
    }

    updateBooking({
      category: category.id,
      service: selectedService,
      services: [selectedService],
      treatment: null,
      staff: null,
      date: null,
      time: "",
      step: 1,
      completed: false,
      editingReview: false,
    });
  }, [updateBooking]);

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
        return <Step1Services />;

      case 2:
        return <Step2Date />;

      case 3:
        return <Step3Time />;

      case 4:
        return <Step4Customer />;

      case 5:
        return <Step5Consultation />;

      case 6:
        return <Step6Review />;

      case 7:
        return <Step7Payment />;

      default:
        return <Step1Services />;
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
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
      >
        {renderStep()}
      </motion.div>
    </BookingShell>
  );
}
