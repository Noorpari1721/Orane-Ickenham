"use client";


import BackToDashboard from "@/components/admin/BackToDashboard";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Save,
  Settings2,
  Store,
} from "lucide-react";

type SettingsTab =
  | "salon"
  | "hours"
  | "booking"
  | "payments"
  | "notifications";

type WorkingHour = {
  dayOfWeek: number;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const tabs: {
  id: SettingsTab;
  label: string;
  icon: typeof Store;
}[] = [
  {
    id: "salon",
    label: "Salon Information",
    icon: Store,
  },
  {
    id: "hours",
    label: "Opening Hours",
    icon: Clock3,
  },
  {
    id: "booking",
    label: "Booking Settings",
    icon: CalendarDays,
  },
  {
    id: "payments",
    label: "Payment Settings",
    icon: CreditCard,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
];

const defaultHours: WorkingHour[] = [
  {
    dayOfWeek: 1,
    day: "Monday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 2,
    day: "Tuesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 3,
    day: "Wednesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 4,
    day: "Thursday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 5,
    day: "Friday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 6,
    day: "Saturday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 0,
    day: "Sunday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "17:00",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("salon");

  const [saved, setSaved] = useState(false);

  const [loadingHours, setLoadingHours] =
    useState(false);

  const [savingHours, setSavingHours] =
    useState(false);

  const [hoursError, setHoursError] =
    useState("");

  const [salon, setSalon] = useState({
    name: "ORANE ICKENHAM",
    email: "oraneickenham@gmail.com",
    phone: "+44 20 0000 0000",
    address:
      "Ickenham, London, United Kingdom",
  });

  const [hours, setHours] =
    useState<WorkingHour[]>(
      defaultHours
    );

  const [booking, setBooking] = useState({
    advanceDays: "30",
    cancellationHours: "24",
    slotInterval: "30",
    bufferTime: "10",
  });

  const [payments, setPayments] = useState({
    stripe: true,
    cash: true,
    requirePayment: false,
  });

  const [notifications, setNotifications] =
    useState({
      bookingConfirmation: true,
      bookingReminder: true,
      cancellation: true,
      paymentReceipt: true,
    });

  useEffect(() => {
    void loadHours();
  }, []);

  async function loadHours() {
    try {
      setLoadingHours(true);
      setHoursError("");

      const response = await fetch(
        "/api/admin/settings/hours",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load opening hours."
        );
      }

      if (
        Array.isArray(data.hours) &&
        data.hours.length === 7
      ) {
        setHours(data.hours);
      }
    } catch (error) {
      setHoursError(
        error instanceof Error
          ? error.message
          : "Unable to load opening hours."
      );
    } finally {
      setLoadingHours(false);
    }
  }

  function updateHour(
    dayOfWeek: number,
    changes: Partial<WorkingHour>
  ) {
    setHours((current) =>
      current.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  async function saveHours() {
    try {
      setSavingHours(true);
      setHoursError("");

      const response = await fetch(
        "/api/admin/settings/hours",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            hours,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save opening hours."
        );
      }

      setHours(data.hours);
      showSaved();
    } catch (error) {
      setHoursError(
        error instanceof Error
          ? error.message
          : "Unable to save opening hours."
      );
    } finally {
      setSavingHours(false);
    }
  }

  function showSaved() {
    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      2500
    );
  }

  function handleSave() {
    if (activeTab === "hours") {
      void saveHours();
      return;
    }

    showSaved();
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-[1500px]">

          <BackToDashboard />


          <header className="mb-8">

            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Management
            </p>

            <h1 className="mt-2 text-3xl font-light sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Manage salon information, opening hours, bookings and notifications.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[270px_1fr]">

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-3 flex items-center gap-3 px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                  <Settings2
                    size={17}
                    className="text-[#D4AF37]"
                  />
                </div>

                <div>
                  <p className="text-sm">
                    Admin Settings
                  </p>

                  <p className="text-[10px] text-white/65">
                    ORANE ICKENHAM
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "text-white/75 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={17} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03]">

              <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                    Configuration
                  </p>

                  <h2 className="mt-1 text-xl font-light">
                    {tabs.find(
                      (tab) =>
                        tab.id === activeTab
                    )?.label}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    savingHours ||
                    loadingHours
                  }
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e0bd45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saved ? (
                    <Check size={17} />
                  ) : (
                    <Save size={17} />
                  )}

                  {saved
                    ? "Saved"
                    : savingHours
                      ? "Saving..."
                      : "Save Changes"}
                </button>
              </div>

              <div className="p-5 sm:p-6">

                {activeTab === "salon" && (
                  <SalonSection
                    salon={salon}
                    setSalon={setSalon}
                  />
                )}

                {activeTab === "hours" && (
                  <HoursSection
                    hours={hours}
                    loading={loadingHours}
                    saving={savingHours}
                    error={hoursError}
                    updateHour={updateHour}
                    saveHours={saveHours}
                  />
                )}

                {activeTab === "booking" && (
                  <BookingSection
                    booking={booking}
                    setBooking={setBooking}
                  />
                )}

                {activeTab === "payments" && (
                  <PaymentSection
                    payments={payments}
                    setPayments={setPayments}
                  />
                )}

                {activeTab ===
                  "notifications" && (
                  <NotificationSection
                    notifications={
                      notifications
                    }
                    setNotifications={
                      setNotifications
                    }
                  />
                )}

              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SalonSection({
  salon,
  setSalon,
}: {
  salon: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  setSalon: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      phone: string;
      address: string;
    }>
  >;
}) {
  return (
    <div className="space-y-6">
      <SectionIntro
        title="Salon Information"
        description="Basic information displayed across your salon administration system."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Salon Name"
          value={salon.name}
          onChange={(value) =>
            setSalon((current) => ({
              ...current,
              name: value,
            }))
          }
        />

        <Field
          label="Email Address"
          type="email"
          value={salon.email}
          onChange={(value) =>
            setSalon((current) => ({
              ...current,
              email: value,
            }))
          }
        />

        <Field
          label="Phone Number"
          value={salon.phone}
          onChange={(value) =>
            setSalon((current) => ({
              ...current,
              phone: value,
            }))
          }
        />

        <Field
          label="Address"
          value={salon.address}
          onChange={(value) =>
            setSalon((current) => ({
              ...current,
              address: value,
            }))
          }
        />
      </div>

      <InfoBox>
        Salon information is currently managed locally in the admin interface. Opening hours are connected directly to the database.
      </InfoBox>
    </div>
  );
}

function HoursSection({
  hours,
  loading,
  saving,
  error,
  updateHour,
  saveHours,
}: {
  hours: WorkingHour[];
  loading: boolean;
  saving: boolean;
  error: string;
  updateHour: (
    dayOfWeek: number,
    changes: Partial<WorkingHour>
  ) => void;
  saveHours: () => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <SectionIntro
        title="Opening Hours"
        description="Control when customers can book appointments at the salon."
      />

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-black/10">
          <p className="text-sm text-white/70">
            Loading opening hours...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hours.map((item) => (
            <div
              key={item.dayOfWeek}
              className="rounded-2xl border border-white/10 bg-black/10 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3 md:w-44">
                  <button
                    type="button"
                    onClick={() =>
                      updateHour(
                        item.dayOfWeek,
                        {
                          isOpen:
                            !item.isOpen,
                        }
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      item.isOpen
                        ? "bg-[#D4AF37]"
                        : "bg-white/15"
                    }`}
                    aria-label={
                      item.isOpen
                        ? `Close ${item.day}`
                        : `Open ${item.day}`
                    }
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        item.isOpen
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>

                  <div>
                    <p className="text-sm">
                      {item.day}
                    </p>

                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60">
                      {item.isOpen
                        ? "Open"
                        : "Closed"}
                    </p>
                  </div>
                </div>

                {item.isOpen ? (
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <TimeField
                      label="Opening"
                      value={item.openTime}
                      onChange={(value) =>
                        updateHour(
                          item.dayOfWeek,
                          {
                            openTime:
                              value,
                          }
                        )
                      }
                    />

                    <TimeField
                      label="Closing"
                      value={
                        item.closeTime
                      }
                      onChange={(value) =>
                        updateHour(
                          item.dayOfWeek,
                          {
                            closeTime:
                              value,
                          }
                        )
                      }
                    />
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white/60">
                    Closed all day
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <InfoBox>
        Opening hours are saved through the admin hours API and persisted in the database.
      </InfoBox>

      <button
        type="button"
        onClick={() =>
          void saveHours()
        }
        disabled={saving || loading}
        className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-5 py-3 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/15 disabled:opacity-50"
      >
        <Save size={16} />
        {saving
          ? "Saving Hours..."
          : "Save Opening Hours"}
      </button>
    </div>
  );
}

function BookingSection({
  booking,
  setBooking,
}: {
  booking: {
    advanceDays: string;
    cancellationHours: string;
    slotInterval: string;
    bufferTime: string;
  };
  setBooking: React.Dispatch<
    React.SetStateAction<{
      advanceDays: string;
      cancellationHours: string;
      slotInterval: string;
      bufferTime: string;
    }>
  >;
}) {
  return (
    <div className="space-y-6">
      <SectionIntro
        title="Booking Settings"
        description="Configure general appointment rules for the salon."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Advance Booking Window (days)"
          type="number"
          value={booking.advanceDays}
          onChange={(value) =>
            setBooking((current) => ({
              ...current,
              advanceDays: value,
            }))
          }
        />

        <Field
          label="Cancellation Notice (hours)"
          type="number"
          value={
            booking.cancellationHours
          }
          onChange={(value) =>
            setBooking((current) => ({
              ...current,
              cancellationHours:
                value,
            }))
          }
        />

        <SelectField
          label="Appointment Slot Interval"
          value={booking.slotInterval}
          onChange={(value) =>
            setBooking((current) => ({
              ...current,
              slotInterval: value,
            }))
          }
          options={[
            ["15", "15 minutes"],
            ["30", "30 minutes"],
            ["60", "60 minutes"],
          ]}
        />

        <Field
          label="Buffer Time Between Appointments (minutes)"
          type="number"
          value={booking.bufferTime}
          onChange={(value) =>
            setBooking((current) => ({
              ...current,
              bufferTime: value,
            }))
          }
        />
      </div>

      <InfoBox>
        These settings currently control the admin configuration interface. Booking-rule persistence can be connected when the booking engine is finalized.
      </InfoBox>
    </div>
  );
}

function PaymentSection({
  payments,
  setPayments,
}: {
  payments: {
    stripe: boolean;
    cash: boolean;
    requirePayment: boolean;
  };
  setPayments: React.Dispatch<
    React.SetStateAction<{
      stripe: boolean;
      cash: boolean;
      requirePayment: boolean;
    }>
  >;
}) {
  return (
    <div className="space-y-6">
      <SectionIntro
        title="Payment Settings"
        description="Choose which payment methods are available for salon bookings."
      />

      <div className="space-y-3">
        <ToggleRow
          title="Stripe"
          description="Accept online card payments through Stripe."
          enabled={payments.stripe}
          onChange={(enabled) =>
            setPayments((current) => ({
              ...current,
              stripe: enabled,
            }))
          }
        />

        <ToggleRow
          title="Cash at Salon"
          description="Allow customers to pay when they arrive."
          enabled={payments.cash}
          onChange={(enabled) =>
            setPayments((current) => ({
              ...current,
              cash: enabled,
            }))
          }
        />

        <ToggleRow
          title="Require Payment at Booking"
          description="Require online payment before confirming an appointment."
          enabled={
            payments.requirePayment
          }
          onChange={(enabled) =>
            setPayments((current) => ({
              ...current,
              requirePayment:
                enabled,
            }))
          }
        />
      </div>

      <InfoBox>
        Stripe availability here is an admin preference. Actual online payment processing will use the payment integration configured for the booking system.
      </InfoBox>
    </div>
  );
}

function NotificationSection({
  notifications,
  setNotifications,
}: {
  notifications: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    cancellation: boolean;
    paymentReceipt: boolean;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<{
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      cancellation: boolean;
      paymentReceipt: boolean;
    }>
  >;
}) {
  return (
    <div className="space-y-6">
      <SectionIntro
        title="Notifications"
        description="Choose which customer notification events are enabled."
      />

      <div className="space-y-3">
        <ToggleRow
          title="Booking Confirmation"
          description="Send confirmation after a booking is created."
          enabled={
            notifications.bookingConfirmation
          }
          onChange={(enabled) =>
            setNotifications(
              (current) => ({
                ...current,
                bookingConfirmation:
                  enabled,
              })
            )
          }
        />

        <ToggleRow
          title="Booking Reminder"
          description="Send reminders before upcoming appointments."
          enabled={
            notifications.bookingReminder
          }
          onChange={(enabled) =>
            setNotifications(
              (current) => ({
                ...current,
                bookingReminder:
                  enabled,
              })
            )
          }
        />

        <ToggleRow
          title="Cancellation Notification"
          description="Notify when an appointment is cancelled."
          enabled={
            notifications.cancellation
          }
          onChange={(enabled) =>
            setNotifications(
              (current) => ({
                ...current,
                cancellation:
                  enabled,
              })
            )
          }
        />

        <ToggleRow
          title="Payment Receipt"
          description="Send a receipt after a successful payment."
          enabled={
            notifications.paymentReceipt
          }
          onChange={(enabled) =>
            setNotifications(
              (current) => ({
                ...current,
                paymentReceipt:
                  enabled,
              })
            )
          }
        />
      </div>

      <InfoBox>
        Notification preferences are currently held in the admin interface and can be connected to email or SMS delivery when those services are configured.
      </InfoBox>
    </div>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-light">
        {title}
      </h3>

      <p className="mt-1 max-w-2xl text-sm text-white/70">
        {description}
      </p>
    </div>
  );
}

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-white/70">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-white/70">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/55 focus:border-[#D4AF37]/30"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="text-xs text-white/70">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/30"
      >
        {options.map(
          ([optionValue, labelText]) => (
            <option
              key={optionValue}
              value={optionValue}
              className="bg-[#111111]"
            >
              {labelText}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-white/60">
        {label}
      </label>

      <input
        type="time"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37]/30"
      />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/10 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="text-sm text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/70">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#D4AF37]"
            : "bg-white/15"
        }`}
        aria-label={
          enabled
            ? `Disable ${title}`
            : `Enable ${title}`
        }
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
