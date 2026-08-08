"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import type {
  BookingContextType,
  BookingState,
  Customer,
  Service,
  Treatment,
  Staff,
} from "@/types/booking";

const emptyCustomer: Customer = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

const initialState: BookingState = {
  step: 1,
  category: "",
  service: null,
  treatment: null,
  staff: null,
  date: null,
  time: "",
  customer: emptyCustomer,
  completed: false,
  editingReview: false,
};

const BookingContext = createContext<
  BookingContextType | undefined
>(undefined);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBooking] =
    useState<BookingState>(initialState);

  const nextStep = () => {
    setBooking((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 8),
    }));
  };

  const previousStep = () => {
    setBooking((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setBooking((prev) => ({
      ...prev,
      step: Math.min(Math.max(step, 1), 8),
    }));
  };

  const updateBooking = (
    data: Partial<BookingState>
  ) => {
    setBooking((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const setService = (service: Service) => {
    setBooking((prev) => ({
      ...prev,
      service,
      treatment: null,
    }));
  };

  const setTreatment = (
    treatment: Treatment
  ) => {
    setBooking((prev) => ({
      ...prev,
      treatment,
    }));
  };

  const setStaff = (staff: Staff) => {
    setBooking((prev) => ({
      ...prev,
      staff,
    }));
  };

  const setDate = (date: Date) => {
    const safeDate = new Date(date);

    safeDate.setHours(12, 0, 0, 0);

    setBooking((prev) => ({
      ...prev,
      date: safeDate,
      time: "",
    }));
  };

  const setTime = (time: string) => {
    setBooking((prev) => ({
      ...prev,
      time,
    }));
  };

  const updateCustomer = (
    customer: Partial<Customer>
  ) => {
    setBooking((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        ...customer,
      },
    }));
  };

  const resetBooking = () => {
    setBooking(initialState);
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        nextStep,
        previousStep,
        goToStep,
        updateBooking,
        setService,
        setTreatment,
        setStaff,
        setDate,
        setTime,
        updateCustomer,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider."
    );
  }

  return context;
}

