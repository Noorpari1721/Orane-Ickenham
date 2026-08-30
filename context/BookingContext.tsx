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

const createEmptyCustomer = (): Customer => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
});

const createInitialState = (): BookingState => ({
  step: 1,
  category: "",
  service: null,
  services: [],
  treatment: null,
  staff: null,
  date: null,
  time: "",
  customer: createEmptyCustomer(),

  consultationStatus: null,
  consultationCompleted: false,
  consultationResponses: {},

  completed: false,
  editingReview: false,
});

const BookingContext = createContext<
  BookingContextType | undefined
>(undefined);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBooking] =
    useState<BookingState>(createInitialState);

  const nextStep = () => {
    setBooking((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 7),
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
      step: Math.min(Math.max(step, 1), 7),
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

  const resetConsultationState = () => ({
    consultationStatus: null,
    consultationCompleted: false,
    consultationResponses: {},
  });

  const setService = (service: Service) => {
    setBooking((prev) => ({
      ...prev,
      service,
      services: [service],
      treatment: null,
      staff: null,
      date: null,
      time: "",
      ...resetConsultationState(),
    }));
  };

  const toggleService = (service: Service) => {
    setBooking((prev) => {
      const exists = prev.services.some(
        (item) => item.id === service.id
      );

      const services = exists
        ? prev.services.filter(
            (item) => item.id !== service.id
          )
        : [...prev.services, service];

      return {
        ...prev,
        services,
        service:
          services.length > 0
            ? services[0]
            : null,
        treatment: null,
        staff: null,
        date: null,
        time: "",
        ...resetConsultationState(),
      };
    });
  };

  const removeService = (serviceId: number) => {
    setBooking((prev) => {
      const services = prev.services.filter(
        (item) => item.id !== serviceId
      );

      return {
        ...prev,
        services,
        service:
          services.length > 0
            ? services[0]
            : null,
        treatment: null,
        staff: null,
        date: null,
        time: "",
        ...resetConsultationState(),
      };
    });
  };

  const clearServices = () => {
    setBooking((prev) => ({
      ...prev,
      service: null,
      services: [],
      treatment: null,
      staff: null,
      date: null,
      time: "",
      ...resetConsultationState(),
    }));
  };

  const setTreatment = (treatment: Treatment) => {
    setBooking((prev) => ({
      ...prev,
      treatment,
    }));
  };

  const setStaff = (staff: Staff | null) => {
    setBooking((prev) => ({
      ...prev,
      staff,
    }));
  };

  const setDate = (date: Date) => {
    setBooking((prev) => ({
      ...prev,
      date,
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
    setBooking(createInitialState());
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
        toggleService,
        removeService,
        clearServices,
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
