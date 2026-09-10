"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
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

const BOOKING_STORAGE_KEY = "orane-booking-state";

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

const serverBookingSnapshot = createInitialState();

const bookingListeners = new Set<() => void>();

let bookingStoreState = createInitialState();
let bookingStoreLoaded = false;

const restoreBookingState = (): BookingState => {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const saved = window.sessionStorage.getItem(
      BOOKING_STORAGE_KEY
    );

    if (!saved) {
      return createInitialState();
    }

    const parsed = JSON.parse(saved) as Partial<BookingState> & {
      date?: string | null;
    };

    const initialState = createInitialState();

    const restoredDate =
      parsed.date
        ? new Date(parsed.date)
        : null;

    const validDate =
      restoredDate &&
      !Number.isNaN(restoredDate.getTime())
        ? restoredDate
        : null;

    return {
      ...initialState,
      ...parsed,
      date: validDate,
      customer: {
        ...initialState.customer,
        ...(parsed.customer ?? {}),
      },
      services: Array.isArray(parsed.services)
        ? parsed.services
        : initialState.services,
      consultationResponses:
        parsed.consultationResponses &&
        typeof parsed.consultationResponses === "object"
          ? parsed.consultationResponses
          : initialState.consultationResponses,
    };
  } catch {
    return createInitialState();
  }
};

const getBookingSnapshot = (): BookingState => {
  if (
    typeof window !== "undefined" &&
    !bookingStoreLoaded
  ) {
    bookingStoreState = restoreBookingState();
    bookingStoreLoaded = true;
  }

  return bookingStoreState;
};

const getServerBookingSnapshot = (): BookingState =>
  serverBookingSnapshot;

const subscribeToBookingStore = (
  listener: () => void
) => {
  bookingListeners.add(listener);

  return () => {
    bookingListeners.delete(listener);
  };
};

const persistBookingState = (state: BookingState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      BOOKING_STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch {
    // Session storage can be unavailable in restricted browsers.
  }
};

type BookingUpdater =
  | BookingState
  | ((prev: BookingState) => BookingState);

const updateBookingStore = (
  updater: BookingUpdater
) => {
  const nextState =
    typeof updater === "function"
      ? updater(bookingStoreState)
      : updater;

  bookingStoreState = nextState;

  persistBookingState(nextState);

  bookingListeners.forEach((listener) => {
    listener();
  });
};

const clearPersistedBookingState = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      BOOKING_STORAGE_KEY
    );
  } catch {
    // Ignore unavailable session storage.
  }
};

const BookingContext = createContext<
  BookingContextType | undefined
>(undefined);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const booking = useSyncExternalStore(
    subscribeToBookingStore,
    getBookingSnapshot,
    getServerBookingSnapshot
  );

  const nextStep = () => {
    updateBookingStore((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 7),
    }));
  };

  const previousStep = () => {
    updateBookingStore((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    updateBookingStore((prev) => ({
      ...prev,
      step: Math.min(Math.max(step, 1), 7),
    }));
  };

  const updateBooking = (
    data: Partial<BookingState>
  ) => {
    updateBookingStore((prev) => ({
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
    updateBookingStore((prev) => ({
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
    updateBookingStore((prev) => {
      /*
       * MULTIPLE SERVICE BOOKING
       *
       * Clicking an already selected service adds another
       * instance of the same service.
       *
       * Example:
       * Japanese Head Spa
       * Japanese Head Spa
       * Japanese Head Spa
       *
       * This allows one customer to book the same treatment
       * for themselves and friends inside one checkout.
       */
      const services = [...prev.services, service];

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
    updateBookingStore((prev) => {
      /*
       * Remove only ONE instance.
       * This gives us quantity-style decrement behaviour.
       */
      const index = prev.services.findIndex(
        (item) => item.id === serviceId
      );

      const services =
        index === -1
          ? prev.services
          : prev.services.filter(
              (_, itemIndex) => itemIndex !== index
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
    updateBookingStore((prev) => ({
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
    updateBookingStore((prev) => ({
      ...prev,
      treatment,
    }));
  };

  const setStaff = (staff: Staff | null) => {
    updateBookingStore((prev) => ({
      ...prev,
      staff,
    }));
  };

  const setDate = (date: Date) => {
    updateBookingStore((prev) => ({
      ...prev,
      date,
      time: "",
    }));
  };

  const setTime = (time: string) => {
    updateBookingStore((prev) => ({
      ...prev,
      time,
    }));
  };

  const updateCustomer = (
    customer: Partial<Customer>
  ) => {
    updateBookingStore((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        ...customer,
      },
    }));
  };

  const resetBooking = () => {
    const initialState = createInitialState();

    bookingStoreState = initialState;
    clearPersistedBookingState();

    bookingListeners.forEach((listener) => {
      listener();
    });
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
