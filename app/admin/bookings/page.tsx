"use client";


import BackToDashboard from "@/components/admin/BackToDashboard";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  X,
  UserRound,
  Sparkles,
  Clock3,
  PoundSterling,
} from "lucide-react";

type Customer = {
  id: string;
  customerNo: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
};

type Service = {
  id: string;
  serviceNo: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  active: boolean;
};

type Tech = {
  id: string;
  techNo: string;
  firstName: string;
  lastName: string;
  name?: string;
  status: "AVAILABLE" | "UNAVAILABLE";
};

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type Booking = {
  id: string;
  bookingNo: string;
  date: string;
  startTime: string;
  endTime: string | null;
  status: BookingStatus;
  notes: string | null;
  consultationStatus: string | null;
  customer: Customer;
  service: Service;
  services?: Service[];
  tech: Tech | null;
  payment: {
    id: string;
    paymentNo: string;
    amount: number;
    method: string;
    status: string;
  } | null;
};

const emptyForm = {
  customerId: "",
  serviceIds: [] as string[],
  techId: "",
  date: "",
  startTime: "",
  endTime: "",
  notes: "",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}
function getBookingServices(booking: Booking) {
  if (booking.services && booking.services.length > 0) {
    return booking.services;
  }

  return [booking.service];
}

function getBookingTotal(booking: Booking) {
  if (booking.payment?.amount != null) {
    return Number(booking.payment.amount);
  }

  return getBookingServices(booking).reduce(
    (total, service) => total + Number(service.price || 0),
    0
  );
}

function getBookingServiceNames(booking: Booking) {
  return getBookingServices(booking)
    .map((service) => service.name)
    .join(", ");
}

function getBookingDuration(booking: Booking) {
  return getBookingServices(booking).reduce(
    (total, service) => total + Number(service.duration || 0),
    0
  );
}

function getTechName(tech: Tech) {
  if (tech.name?.trim()) return tech.name;

  return `${tech.firstName ?? ""} ${tech.lastName ?? ""}`.trim() || "Unnamed Tech";
}

function getCustomerName(customer: Customer) {
  if (customer.name?.trim()) return customer.name;

  return `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "Unnamed Customer";
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("T")[0].split("-");

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )
  );
}

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addMinutesToTime(time: string, minutes: number) {
  if (!time || !Number.isFinite(minutes)) return "";

  const [hours, mins] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(mins)
  ) {
    return "";
  }

  const totalMinutes =
    hours * 60 + mins + minutes;

  const finalMinutes =
    ((totalMinutes % 1440) + 1440) % 1440;

  const finalHours = Math.floor(
    finalMinutes / 60
  );

  const finalMins = finalMinutes % 60;

  return `${String(finalHours).padStart(2, "0")}:${String(
    finalMins
  ).padStart(2, "0")}`;
}

function statusLabel(status: BookingStatus) {
  return status.replace("_", " ");
}

function statusClass(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]";
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";
    case "NO_SHOW":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [techs, setTechs] = useState<Tech[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<BookingStatus | "ALL">("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] =
    useState<Booking | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        bookingsResponse,
        customersResponse,
        servicesResponse,
        techsResponse,
      ] = await Promise.all([
        fetch("/api/admin/bookings", {
          cache: "no-store",
        }),
        fetch("/api/admin/customers", {
          cache: "no-store",
        }),
        fetch("/api/admin/services", {
          cache: "no-store",
        }),
        fetch("/api/admin/techs", {
          cache: "no-store",
        }),
      ]);

      const [
        bookingsData,
        customersData,
        servicesData,
        techsData,
      ] = await Promise.all([
        bookingsResponse.json(),
        customersResponse.json(),
        servicesResponse.json(),
        techsResponse.json(),
      ]);

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.error ||
            "Unable to load bookings."
        );
      }

      if (!customersResponse.ok) {
        throw new Error(
          customersData.error ||
            "Unable to load customers."
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData.error ||
            "Unable to load services."
        );
      }

      if (!techsResponse.ok) {
        throw new Error(
          techsData.error ||
            "Unable to load technicians."
        );
      }

      setBookings(bookingsData.bookings || []);
      setCustomers(customersData.customers || []);

      setServices(
        (servicesData.services || []).filter(
          (service: Service) => service.active
        )
      );

      setTechs(techsData.techs || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load booking data."
      );
    } finally {
      setLoading(false);
    }
  }  /*
   * Initial admin data fetch intentionally updates local state.
   * This effect is required to load bookings/customers/services/techs
   * when the admin page mounts.
   */
  /* eslint-disable react-hooks/set-state-in-effect */

  useEffect(() => {
    loadData();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /*
 * AUTOMATIC END TIME
 *
 * Whenever service OR start time changes,
 * calculate end time from service duration.
 */

/* eslint-disable react-hooks/set-state-in-effect *//*
   * AUTOMATIC END TIME
   *
   * Whenever service OR start time changes,
   * calculate end time from service duration.
   */
  useEffect(() => {
    if (form.serviceIds.length === 0) {
      setForm((current) => {
        if (!current.endTime) {
          return current;
        }

        return {
          ...current,
          endTime: "",
        };
      });

      return;
    }

    const selectedServices = services.filter(
      (service) =>
        form.serviceIds.includes(service.id)
    );

    if (selectedServices.length === 0) {
      return;
    }

    const totalDuration = selectedServices.reduce(
      (total, service) =>
        total + Number(service.duration || 0),
      0
    );

    setForm((current) => {
      const startTime =
        current.startTime || "09:00";

      const calculatedEndTime =
        addMinutesToTime(
          startTime,
          totalDuration
        );

      if (
        current.startTime === startTime &&
        current.endTime === calculatedEndTime
      ) {
        return current;
      }

      return {
        ...current,
        startTime,
        endTime: calculatedEndTime,
      };
    });
  }, [
    form.serviceIds,
    form.startTime,
    services,
  ]);
/* eslint-enable react-hooks/set-state-in-effect */
  function timeToMinutes(time: string) {
    if (!time) return -1;

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return -1;
    }

    return hours * 60 + minutes;
  }

  const selectedTech = techs.find(
    (tech) => tech.id === form.techId
  );

  const selectedTechUnavailable =
    selectedTech?.status === "UNAVAILABLE";

  const conflictingBooking = useMemo(() => {
    if (
      !form.techId ||
      !form.date ||
      !form.startTime
    ) {
      return null;
    }

    const start = timeToMinutes(
      form.startTime
    );

    const end = timeToMinutes(
      form.endTime || form.startTime
    );

    if (start < 0 || end < 0) {
      return null;
    }

    return (
      bookings.find((booking) => {
        if (
          booking.id ===
          editingBooking?.id
        ) {
          return false;
        }

        if (
          booking.tech?.id !==
          form.techId
        ) {
          return false;
        }

        if (
          booking.date.split("T")[0] !==
          form.date
        ) {
          return false;
        }

        if (
          booking.status !== "PENDING" &&
          booking.status !== "CONFIRMED"
        ) {
          return false;
        }

        const existingStart =
          timeToMinutes(
            booking.startTime
          );

        const existingEnd =
          timeToMinutes(
            booking.endTime ||
              booking.startTime
          );

        if (
          existingStart < 0 ||
          existingEnd < 0
        ) {
          return false;
        }

        return (
          start < existingEnd &&
          existingStart < end
        );
      }) || null
    );
  }, [
    bookings,
    editingBooking,
    form.techId,
    form.date,
    form.startTime,
    form.endTime,
  ]);

  const availabilityError =
    selectedTechUnavailable
      ? "This technician is currently unavailable."
      : conflictingBooking
        ? "This technician already has a booking at this time."
        : "";
  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      const customerName = getCustomerName(
        booking.customer
      );

      const techName = booking.tech
        ? getTechName(booking.tech)
        : "";

      const matchesSearch =
        !query ||
        [
          booking.bookingNo,
          customerName,
          booking.customer.email,
          booking.service.name,
          techName,
          booking.date,
          booking.startTime,
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [
    bookings,
    search,
    statusFilter,
  ]);

  /*
   * LOCAL DATE
   *
   * Do NOT use:
   * new Date().toISOString().split("T")[0]
   *
   * because that uses UTC and can produce the
   * wrong calendar day for UK/local time.
   */
  const todayString = getLocalDateString();

  const todayBookings = bookings.filter(
    (booking) =>
      booking.date.split("T")[0] === todayString
  );

  const confirmedCount =
    todayBookings.filter(
      (booking) =>
        booking.status === "CONFIRMED"
    ).length;

  const pendingCount =
    todayBookings.filter(
      (booking) =>
        booking.status === "PENDING"
    ).length;

  const todayRevenue =
    todayBookings
      .filter(
        (booking) =>
          booking.status !== "CANCELLED" &&
          booking.status !== "NO_SHOW"
      )
      .reduce(
        (total, booking) =>
          total +
          getBookingTotal(booking),
        0
      );

  function openNewBooking() {
    setEditingBooking(null);

    setForm({
      ...emptyForm,
      date: todayString,
    });

    setError("");
    setShowModal(true);
  }

  function openEditBooking(
    booking: Booking
  ) {
    setEditingBooking(booking);

    setForm({
      customerId: booking.customer.id,
      serviceIds:
        booking.services && booking.services.length > 0
          ? booking.services.map((service) => service.id)
          : [booking.service.id],
      techId: booking.tech?.id ?? "",
      date: booking.date.split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime ?? "",
      notes: booking.notes ?? "",
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingBooking(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof typeof emptyForm,
    value: string | string[]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
try {
      setSaving(true);
      setError("");

      const editing =
        Boolean(editingBooking);

      const response = await fetch(
        "/api/admin/bookings",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...(editing
              ? { id: editingBooking?.id }
              : {}),
            customerId: form.customerId,
            serviceIds: form.serviceIds,
            techId:
              form.techId || null,
            date: form.date,
            startTime: form.startTime,
            endTime:
              form.endTime || null,
            notes:
              form.notes || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save booking."
        );
      }

      if (editing) {
        setBookings((current) =>
          current.map((booking) =>
            booking.id === data.booking.id
              ? data.booking
              : booking
          )
        );
      } else {
        setBookings((current) => [
          ...current,
          data.booking,
        ]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save booking."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    booking: Booking,
    status: BookingStatus
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/bookings",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: booking.id,
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to change booking status."
        );
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === data.booking.id
            ? data.booking
            : item
        )
      );

      if (
        selectedBooking?.id ===
        data.booking.id
      ) {
        setSelectedBooking(
          data.booking
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change booking status."
      );
    }
  }

  async function deleteBooking(
    booking: Booking
  ) {
    const confirmed =
      window.confirm(
        `Delete booking ${booking.bookingNo}?`
      );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/bookings",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: booking.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete booking."
        );
      }

      setBookings((current) =>
        current.filter(
          (item) =>
            item.id !== booking.id
        )
      );

      if (
        selectedBooking?.id ===
        booking.id
      ) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete booking."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">

        <BackToDashboard />


        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
<p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Management
            </p>
<h1 className="mt-2 text-3xl font-light sm:text-4xl">
              Bookings
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Manage appointments, customers and Tech assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewBooking}
            className="flex w-fit items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e2c158]"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/50">
              Today
            </p>

            <p className="mt-3 text-3xl font-light">
              {todayBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/50">
              Confirmed
            </p>

            <p className="mt-3 text-3xl font-light">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/50">
              Pending
            </p>

            <p className="mt-3 text-3xl font-light">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/50">
              Revenue
            </p>

            <p className="mt-3 text-3xl font-light">
              {formatMoney(
                todayRevenue
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/65"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search customer, booking or service..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/65 focus:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4">
            <Filter
              size={17}
              className="text-white/70"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | BookingStatus
                    | "ALL"
                )
              }
              className="bg-transparent py-3 text-sm text-white/70 outline-none"
            >
              <option
                value="ALL"
                className="bg-[#111]"
              >
                All Statuses
              </option>

              <option
                value="PENDING"
                className="bg-[#111]"
              >
                Pending
              </option>

              <option
                value="CONFIRMED"
                className="bg-[#111]"
              >
                Confirmed
              </option>

              <option
                value="COMPLETED"
                className="bg-[#111]"
              >
                Completed
              </option>

              <option
                value="CANCELLED"
                className="bg-[#111]"
              >
                Cancelled
              </option>

              <option
                value="NO_SHOW"
                className="bg-[#111]"
              >
                No Show
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CalendarCheck
                size={20}
                className="text-[#D4AF37]"
              />

              <div>
                <h2 className="text-lg font-light">
                  Booking Directory
                </h2>

                <p className="mt-1 text-xs text-white/70">
                  {loading
                    ? "Loading bookings..."
                    : `${filteredBookings.length} bookings shown`}
                </p>
              </div>
            </div>
          </div>

          {!loading && (
            <div className="hidden border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-white/65 lg:grid lg:grid-cols-[100px_1.2fr_1.4fr_1fr_100px_1.4fr_120px_150px]">
              <span>Time</span>
              <span>Customer</span>
              <span>Service</span>
              <span>Tech</span>
              <span>Price</span>
              <span>Notes</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-sm text-white/70">
              Loading bookings from PostgreSQL...
            </div>
          ) : (
            <div className="divide-y divide-white/10">

              {filteredBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="grid gap-4 p-5 lg:grid-cols-[100px_1.2fr_1.4fr_1fr_100px_1.4fr_120px_150px] lg:items-center lg:px-6"
                  >
                    <div>
                      <p className="text-sm text-[#D4AF37]">
                        {booking.startTime}
                      </p>

                      <p className="mt-1 text-xs text-white/65">
                        {formatShortDate(
                          booking.date
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBooking(
                          booking
                        )
                      }
                      className="text-left"
                    >
                      <p className="text-sm">
                        {getCustomerName(
                          booking.customer
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/65">
                        {booking.bookingNo}
                      </p>
                    </button>

                    <div>
                      <p className="text-sm">
                        {getBookingServiceNames(booking)}
                      </p>

                      
                    </div>

                    <div>
                      <p className="text-sm">
                        {booking.tech
                          ? getTechName(
                              booking.tech
                            )
                          : "Unassigned"}
                      </p>

                      <p className="mt-1 text-xs text-white/65">
                        {booking.tech
                          ? "Tech"
                          : "No assignment"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm">
                        {formatMoney(
                          getBookingTotal(booking)
                        )}
                      </p>
                    </div>

                    <div className="min-w-0">
                      {booking.notes ? (
                        <p
                          className="max-w-[220px] truncate text-xs text-white/70"
                          title={booking.notes}
                        >
                          {booking.notes}
                        </p>
                      ) : (
                        <span className="text-xs text-white/55">
                          -
                        </span>
                      )}
                    </div>
                    <div className="min-w-[180px]">
                      <p className="text-xs uppercase tracking-[0.12em] text-white/65">
                        Consultation
                      </p>

                      <p className="mt-1 text-xs text-[#D4AF37]">
                        {booking.consultationStatus === "online"
                          ? "Online Consultation"
                          : booking.consultationStatus === "salon"
                          ? "Consultation at Salon"
                          : booking.consultationStatus === "existing-unchanged"
                          ? "Existing Consultation Confirmed"
                          : booking.consultationStatus === "update-required"
                          ? "Consultation Update Required"
                          : booking.consultationStatus || "Not specified"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs ${statusClass(
                        booking.status
                      )}`}
                    >
                      {statusLabel(
                        booking.status
                      )}
                    </span>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        title="View booking"
                        onClick={() =>
                          setSelectedBooking(
                            booking
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {booking.status ===
                        "PENDING" && (
                        <button
                          type="button"
                          onClick={() =>
                            changeStatus(
                              booking,
                              "CONFIRMED"
                            )
                          }
                          className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-xs text-[#D4AF37]"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}

              {filteredBookings.length ===
                0 && (
                <div className="p-12 text-center">
                  <CalendarCheck
                    size={32}
                    className="mx-auto text-white/55"
                  />

                  <p className="mt-4 text-sm text-white/50">
                    No bookings found.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  {editingBooking
                    ? "Edit Booking"
                    : "New Booking"}
                </p>

                <h2 className="mt-2 text-2xl font-light">
                  {editingBooking
                    ? "Update Appointment"
                    : "Create Appointment"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveBooking}
              className="space-y-5"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                    Customer
                  </label>

                  <select
                    required
                    value={
                      form.customerId
                    }
                    onChange={(event) =>
                      updateForm(
                        "customerId",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                  >
                    <option
                      value=""
                      className="bg-[#111]"
                    >
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                          className="bg-[#111]"
                        >
                          {getCustomerName(
                            customer
                          )}{" "}
                          {"\u00B7"}{" "}
                          {
                            customer.customerNo
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                    Service
                  </label>

                  <div className="space-y-3">
  <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
    {services.map((service) => {
      const selected =
        form.serviceIds.includes(service.id);

      return (
        <label
          key={service.id}
          className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition ${
            selected
              ? "border-[#D4AF37]/60 bg-[#D4AF37]/10"
              : "border-white/5 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => {
                setForm((current) => ({
                  ...current,
                  serviceIds:
                    current.serviceIds.includes(service.id)
                      ? current.serviceIds.filter(
                          (id) => id !== service.id
                        )
                      : [
                          ...current.serviceIds,
                          service.id,
                        ],
                }));
              }}
              className="h-4 w-4 accent-[#D4AF37]"
            />

            <div>
              <p className="text-sm">
                {service.name}
              </p>

              <p className="text-xs text-white/70">
                {service.duration} min {" · "}
                {formatMoney(Number(service.price))}
              </p>
            </div>
          </div>
        </label>
      );
    })}
  </div>

  {form.serviceIds.length > 0 && (
    <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">
      <p className="text-xs uppercase tracking-wider text-[#D4AF37]">
        Selected Services ({form.serviceIds.length})
      </p>

      <div className="mt-3 space-y-2">
        {services
          .filter((service) =>
            form.serviceIds.includes(service.id)
          )
          .map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{service.name}</span>

              <span className="text-white/50">
                {formatMoney(Number(service.price))}
              </span>
            </div>
          ))}
      </div>
    </div>
  )}
</div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                  Technician
                </label>

                <select
                  value={form.techId}
                  onChange={(event) =>
                    updateForm(
                      "techId",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                >
                  <option
                    value=""
                    className="bg-[#111]"
                  >
                    No technician assigned
                  </option>

                  {techs
                    .filter(
                      (tech) =>
                        tech.status ===
                        "AVAILABLE"
                    )
                    .map((tech) => (
                      <option
                        key={tech.id}
                        value={tech.id}
                        className="bg-[#111]"
                      >
                        {getTechName(
                          tech
                        )}{" "}
                        {"\u00B7"} Available
                      </option>
                    ))}
                </select>

                {availabilityError && (
                  <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    Warning: {availabilityError}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                    Date
                  </label>

                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      updateForm(
                        "date",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                    Start Time
                  </label>

                  <input
                    required
                    type="time"
                    value={form.startTime}
                    onChange={(event) => {
                      const newStartTime =
                        event.target.value;

                      const selectedService =
                        services.find(
                          (service) =>
                            form.serviceIds.includes(service.id)
                        );

                      const newEndTime =
                        selectedService
                          ? addMinutesToTime(
                              newStartTime,
                              Number(
                                selectedService.duration
                              )
                            )
                          : "";

                      setForm((current) => ({
                        ...current,
                        startTime: newStartTime,
                        endTime: newEndTime,
                      }));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                    End Time
                  </label>

                  <input
                    readOnly
                    type="time"
                    value={form.endTime}
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 outline-none"
                  />

                  <p className="mt-1 text-[11px] text-white/65">
                    Automatically calculated from service duration
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              {form.serviceIds.length > 0 && (
                <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">

                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37]">
                    <Sparkles size={15} />
                    Selected Service
                  </div>

                  {(() => {
                    const service =
                      services.find(
                        (item) =>
                          form.serviceIds.includes(item.id)
                      );

                    if (!service)
                      return null;

                    return (
                      <div className="mt-3 flex items-center justify-between">

                        <div>
                          <p className="text-sm">
                            {service.name}
                          </p>

                          <p className="mt-1 text-xs text-white/70">
                            {
                              service.duration
                            }{" "}
                            minutes
                          </p>
                        </div>

                        <p className="text-lg text-[#D4AF37]">
                          {formatMoney(
                            Number(
                              service.price
                            )
                          )}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-medium text-black transition hover:bg-[#e1c45b] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBooking
                      ? "Update Booking"
                      : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() =>
            setSelectedBooking(null)
          }
        >
          <div
            className="w-full max-w-xl rounded-t-3xl border border-white/10 bg-[#111] p-6 sm:rounded-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  Booking Details
                </p>

                <h2 className="mt-2 text-2xl font-light">
                  {
                    selectedBooking.bookingNo
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                className="rounded-lg p-2 text-white/70 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <UserRound
                  size={17}
                  className="text-[#D4AF37]"
                />

                <p className="mt-2 text-xs text-white/70">
                  Customer
                </p>

                <p className="mt-1 text-sm">
                  {getCustomerName(
                    selectedBooking.customer
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Sparkles
                  size={17}
                  className="text-[#D4AF37]"
                />

                <p className="mt-2 text-xs text-white/70">
                  Service
                </p>

                <p className="mt-1 text-sm">
                  {
                    selectedBooking
                      .service.name
                  }
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Clock3
                  size={17}
                  className="text-[#D4AF37]"
                />

                <p className="mt-2 text-xs text-white/70">
                  Appointment
                </p>

                <p className="mt-1 text-sm">
                  {formatShortDate(
                    selectedBooking.date
                  )}{" "}
                  {"\u00B7"}{" "}
                  {
                    selectedBooking
                      .startTime
                  }{" "}
                  -{" "}
                  {
                    selectedBooking
                      .endTime
                  }
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <PoundSterling
                  size={17}
                  className="text-[#D4AF37]"
                />

                <p className="mt-2 text-xs text-white/70">
                  Price
                </p>

                <p className="mt-1 text-sm">
                  {formatMoney(
                    Number(
                      selectedBooking
                        .service.price
                    )
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  openEditBooking(
                    selectedBooking
                  );
                  setSelectedBooking(
                    null
                  );
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                Edit Booking
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteBooking(
                    selectedBooking
                  )
                }
                className="flex-1 rounded-xl border border-red-400/20 px-4 py-3 text-sm text-red-300 hover:bg-red-400/10"
              >
                Delete Booking
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs uppercase tracking-wider text-white/65">
                Change Status
              </p>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "PENDING",
                    "CONFIRMED",
                    "COMPLETED",
                    "CANCELLED",
                    "NO_SHOW",
                  ] as BookingStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      changeStatus(
                        selectedBooking,
                        status
                      )
                    }
                    className={`rounded-lg border px-3 py-2 text-xs transition ${
                      selectedBooking.status ===
                      status
                        ? statusClass(
                            status
                          )
                        : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {statusLabel(
                      status
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



