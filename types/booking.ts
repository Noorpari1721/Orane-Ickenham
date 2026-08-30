export interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
}

export interface Treatment {
  id: string;
  serviceId: string;
  name: string;
  duration: number;
  price: number;
}

export interface Staff {
  id: string;
  techNo?: string;
  name: string;
  role: string;
  experience?: string;
  specialties?: string[];
  status?: string;
  image: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export type ConsultationStatus =
  | "online"
  | "salon"
  | "existing-unchanged"
  | "update-required"
  | null;

export type ConsultationResponses = Record<
  string,
  string | boolean
>;

export interface BookingState {
  step: number;
  category: string;

  /*
   * Legacy single selected service.
   * Kept for compatibility with existing booking,
   * review and payment components.
   */
  service: Service | null;

  /*
   * Multi-service selection.
   */
  services: Service[];

  treatment: Treatment | null;
  staff: Staff | null;

  date: Date | null;
  time: string;

  customer: Customer;

  /*
   * Consultation decision for this booking.
   */
  consultationStatus: ConsultationStatus;

  /*
   * True only when the required consultation stage
   * has been completed or deliberately assigned to
   * the salon.
   */
  consultationCompleted: boolean;

  /*
   * Answers and consent acknowledgements collected
   * from the treatment-specific consultation form.
   */
  consultationResponses: ConsultationResponses;

  completed: boolean;
  editingReview: boolean;
}

export interface BookingContextType {
  booking: BookingState;

  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  updateBooking: (
    data: Partial<BookingState>
  ) => void;

  setService: (
    service: Service
  ) => void;

  toggleService: (
    service: Service
  ) => void;

  removeService: (
    serviceId: number
  ) => void;

  clearServices: () => void;

  setTreatment: (
    treatment: Treatment
  ) => void;

  setStaff: (
    staff: Staff
  ) => void;

  setDate: (
    date: Date
  ) => void;

  setTime: (
    time: string
  ) => void;

  updateCustomer: (
    customer: Partial<Customer>
  ) => void;

  resetBooking: () => void;
}