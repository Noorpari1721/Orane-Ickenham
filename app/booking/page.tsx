"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import BookingShell from "@/components/booking/BookingShell";

import Step1Category from "@/components/booking/steps/Step1Category";
import Step2Service from "@/components/booking/steps/Step2Service";
import Step4Calendar from "@/components/booking/steps/Step4Calendar";
import Step5Time from "@/components/booking/steps/Step5Time";
import Step6Customer from "@/components/booking/steps/Step6Customer";
import Step7Review from "@/components/booking/steps/Step7Review";
import Step7Payment from "@/components/booking/steps/Step7Payment";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

export default function BookingPage() {
  const { booking, updateBooking } = useBooking();

  const initializedFromUrl = useRef(false);

  /*
   * BOOKING ENTRY FLOW
   *
   * Generic booking:
   * /booking
   * -> Step 1
   *
   * Service-specific booking:
   * /booking?category=...&service=...
   * -> selected category + service
   * -> Step 3 (Date)
   *
   * The URL initialization runs once per page mount.
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

    /*
     * No service-specific URL:
     * keep the normal booking flow starting at Step 1.
     */
    if (!categoryId || !serviceIdValue) {
      return;
    }

    const category = serviceCategories.find(
      (item) => item.id === categoryId
    );

    if (!category) {
      return;
    }

    const serviceId = Number(serviceIdValue);

    if (!Number.isInteger(serviceId)) {
      return;
    }

    const selectedService = category.services.find(
      (service) => service.id === serviceId
    );

    if (!selectedService) {
      return;
    }

    /*
     * Service-specific booking:
     * category + service are already selected.
     * Start directly from Date selection.
     */
    updateBooking({
      category: category.id,
      service: selectedService,
      treatment: null,
      staff: null,
      date: null,
      time: "",
      step: 3,
      completed: false,
      editingReview: false,
    });
  }, [updateBooking]);

  /*
   * Scroll to the top whenever the booking step changes.
   */
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
        return <Step4Calendar />;

      case 4:
        return <Step5Time />;

      case 5:
        return <Step6Customer />;

      case 6:
        return <Step7Review />;

      case 7:
        return <Step7Payment />;

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