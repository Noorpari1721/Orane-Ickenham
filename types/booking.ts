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

export interface BookingState {
  step: number;
  category: string;
  service: Service | null;
  treatment: Treatment | null;
  staff: Staff | null;
  date: Date | null;
  time: string;
  customer: Customer;
  completed: boolean;
  editingReview: boolean;
}

export interface BookingContextType {
  booking: BookingState;

  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  updateBooking: (data: Partial<BookingState>) => void;

  setService: (service: Service) => void;
  setTreatment: (treatment: Treatment) => void;
  setStaff: (staff: Staff) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;

  updateCustomer: (customer: Partial<Customer>) => void;

  resetBooking: () => void;
}
