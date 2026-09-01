"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";

function capitalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(
      /\b\p{L}/gu,
      (letter) =>
        letter.toUpperCase()
    );
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function validatePhone(phone: string) {
  const cleaned =
    phone.replace(
      /[\s\-().]/g,
      ""
    );

  return /^(?:\+44|0)\d{9,10}$/.test(
    cleaned
  );
}

type ExistingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function Step4Customer() {
  const {
    booking,
    updateCustomer,
    updateBooking,
    nextStep,
  } = useBooking();

  const [errors, setErrors] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consultation: "",
    });

  const [checkingCustomer, setCheckingCustomer] =
    useState(false);

  const [existingCustomer, setExistingCustomer] =
    useState<ExistingCustomer | null>(
      null
    );

  const [customerCheckMessage, setCustomerCheckMessage] =
    useState("");

  const [consultationChoice, setConsultationChoice] =
    useState<
      "changed" | "unchanged" | ""
    >("");

  const checkedEmailRef =
    useRef("");

  const validate = () => {
    const nextErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consultation: "",
    };

    const firstName =
      booking.customer.firstName.trim();

    const lastName =
      booking.customer.lastName.trim();

    const email =
      booking.customer.email.trim();

    const phone =
      booking.customer.phone.trim();

    if (!firstName) {
      nextErrors.firstName =
        "Please enter your first name.";
    } else if (
      firstName.length < 2
    ) {
      nextErrors.firstName =
        "First name must be at least 2 characters.";
    }

    if (!lastName) {
      nextErrors.lastName =
        "Please enter your last name.";
    } else if (
      lastName.length < 2
    ) {
      nextErrors.lastName =
        "Last name must be at least 2 characters.";
    }

    if (!email) {
      nextErrors.email =
        "Please enter your email address.";
    } else if (
      !validateEmail(email)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone =
        "Please enter your phone number.";
    } else if (
      !validatePhone(phone)
    ) {
      nextErrors.phone =
        "Please enter a valid UK phone number.";
    }

    if (existingCustomer) {
      if (!consultationChoice) {
        nextErrors.consultation =
          "Please choose an option for your consultation information.";
      }
    } else if (
      !checkingCustomer &&
      customerCheckMessage &&
      !booking.consultationStatus
    ) {
      nextErrors.consultation =
        "Please choose how you would like to complete your consultation.";
    }

    setErrors(nextErrors);

    return !Object.values(
      nextErrors
    ).some(Boolean);
  };

  useEffect(() => {
    const handleContinue = () => {
      validate();
    };

    window.addEventListener(
      "booking-continue",
      handleContinue
    );

    return () => {
      window.removeEventListener(
        "booking-continue",
        handleContinue
      );
    };
  });

  useEffect(() => {
    const email =
      booking.customer.email
        .trim()
        .toLowerCase();

    if (!validateEmail(email)) {
      setExistingCustomer(null);
      setCustomerCheckMessage("");
      setConsultationChoice("");
      checkedEmailRef.current = "";

      updateBooking({
        consultationStatus: null,
      });

      return;
    }

    if (checkedEmailRef.current === email) {
      return;
    }

    const timeout = window.setTimeout(
      async () => {
        checkedEmailRef.current = email;

        setCheckingCustomer(true);
        setExistingCustomer(null);
        setCustomerCheckMessage("");
        setConsultationChoice("");

        updateBooking({
          consultationStatus: null,
        });

        try {
          const response = await fetch(
            `/api/booking/customer-check?email=${encodeURIComponent(
              email
            )}`
          );

          if (!response.ok) {
            throw new Error(
              "Customer check failed."
            );
          }

          const data =
            await response.json();

          if (
            data.exists &&
            data.customer
          ) {
            setExistingCustomer(
              data.customer
            );

            setCustomerCheckMessage(
              "We found your existing customer record."
            );
          } else {
            setExistingCustomer(null);

            setCustomerCheckMessage(
              "You are booking as a new customer."
            );
          }
        } catch {
          setExistingCustomer(null);

          setCustomerCheckMessage(
            "We could not check your customer record right now. You can continue with your booking."
          );
        } finally {
          setCheckingCustomer(false);
        }
      },
      600
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    booking.customer.email,
  ]);

  const selectExistingConsultation = (
    choice:
      | "changed"
      | "unchanged"
  ) => {
    setConsultationChoice(choice);

    updateBooking({
      consultationStatus:
        choice === "changed"
          ? "update-required"
          : "existing-unchanged",
    });

    if (errors.consultation) {
      setErrors((prev) => ({
        ...prev,
        consultation: "",
      }));
    }
  };

  const selectNewCustomerConsultation = (
    choice: "online" | "salon"
  ) => {
    updateBooking({
      consultationStatus: choice,
      consultationCompleted: choice === "salon",
    });

    if (errors.consultation) {
      setErrors((prev) => ({
        ...prev,
        consultation: "",
      }));
    }

    // Move directly to consultation step
    setTimeout(() => {
      nextStep();
    }, 0);
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 pl-12 text-white placeholder:text-white/65 outline-none transition-all duration-300 focus:border-[#D4AF37]/70 focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(212,175,55,.08)]";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Four
        </p>

        <h2 className="mt-4 text-3xl font-normal leading-tight text-white sm:text-4xl md:text-5xl">
          Your Details
        </h2>

        <p className="mt-5 text-white/75">
          Enter your details, then choose
          your consultation preference.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/75">
              First Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]"
              />

              <input
                type="text"
                autoComplete="given-name"
                placeholder="First Name"
                value={
                  booking.customer.firstName
                }
                onChange={(e) => {
                  updateCustomer({
                    firstName:
                      capitalizeWords(
                        e.target.value
                      ),
                  });

                  if (
                    errors.firstName
                  ) {
                    setErrors(
                      (prev) => ({
                        ...prev,
                        firstName: "",
                      })
                    );
                  }
                }}
                className={inputClass}
              />
            </div>

            {errors.firstName && (
              <p className="mt-2 text-sm text-red-300">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/75">
              Last Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]"
              />

              <input
                type="text"
                autoComplete="family-name"
                placeholder="Last Name"
                value={
                  booking.customer.lastName
                }
                onChange={(e) => {
                  updateCustomer({
                    lastName:
                      capitalizeWords(
                        e.target.value
                      ),
                  });

                  if (
                    errors.lastName
                  ) {
                    setErrors(
                      (prev) => ({
                        ...prev,
                        lastName: "",
                      })
                    );
                  }
                }}
                className={inputClass}
              />
            </div>

            {errors.lastName && (
              <p className="mt-2 text-sm text-red-300">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/75">
            Phone Number
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]"
            />

            <input
              type="tel"
              autoComplete="tel"
              placeholder="Phone Number"
              value={
                booking.customer.phone
              }
              onChange={(e) => {
                updateCustomer({
                  phone:
                    e.target.value,
                });

                if (
                  errors.phone
                ) {
                  setErrors(
                    (prev) => ({
                      ...prev,
                      phone: "",
                    })
                  );
                }
              }}
              className={inputClass}
            />
          </div>

          <p className="mt-2 text-xs text-white/65">
            UK number accepted,
            e.g. 07123 456789
          </p>

          {errors.phone && (
            <p className="mt-2 text-sm text-red-300">
              {errors.phone}
            </p>
          )}
        </div>

<div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/75">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]"
            />

            <input
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              value={
                booking.customer.email
              }
              onChange={(e) => {
                updateCustomer({
                  email:
                    e.target.value.toLowerCase(),
                });

                if (errors.email) {
                  setErrors(
                    (prev) => ({
                      ...prev,
                      email: "",
                    })
                  );
                }
              }}
              className={inputClass}
            />
          </div>

          {checkingCustomer && (
            <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <Loader2
                size={16}
                className="animate-spin text-[#D4AF37]"
              />

              Checking customer record...
            </div>
          )}

          {!checkingCustomer &&
            customerCheckMessage && (
              <div
                className={`mt-3 rounded-xl border px-4 py-3 text-sm leading-6 ${
                  existingCustomer
                    ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-white/75"
                    : "border-white/10 bg-white/[0.03] text-white/70"
                }`}
              >
                {existingCustomer && (
                  <div className="mb-1 flex items-center gap-2 text-[#D4AF37]">
                    <CheckCircle2
                      size={17}
                    />

                    <span className="font-medium">
                      Existing Customer
                    </span>
                  </div>
                )}

                <p>
                  {customerCheckMessage}
                </p>
              </div>
            )}

          {errors.email && (
            <p className="mt-2 text-sm text-red-300">
              {errors.email}
            </p>
          )}
        </div>

        {existingCustomer && (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-5">
            <p className="text-sm font-medium text-white">
              Has your consultation information changed?
            </p>

            <p className="mt-2 text-sm leading-6 text-white/70">
              If your relevant health, allergy or treatment information has changed, please choose Yes. Otherwise, choose No to confirm that your information remains unchanged.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  selectExistingConsultation(
                    "changed"
                  )
                }
                className={`rounded-xl border px-4 py-4 text-left text-sm transition-all duration-300 ${
                  consultationChoice ===
                  "changed"
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/75 hover:border-[#D4AF37]/40"
                }`}
              >
                <span className="block font-medium">
                  Yes, it has changed
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/75">
                  I need to review or update my consultation information.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  selectExistingConsultation(
                    "unchanged"
                  )
                }
                className={`rounded-xl border px-4 py-4 text-left text-sm transition-all duration-300 ${
                  consultationChoice ===
                  "unchanged"
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/75 hover:border-[#D4AF37]/40"
                }`}
              >
                <span className="block font-medium">
                  No, it is unchanged
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/75">
                  I confirm my relevant consultation information remains unchanged.
                </span>
              </button>
            </div>
          </div>
        )}

        {!existingCustomer &&
          !checkingCustomer &&
          customerCheckMessage && (
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-5">
              <p className="text-sm font-medium text-white">
                How would you like to complete your consultation?
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                You can complete your consultation online now, or skip it and complete it at the salon before your treatment.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    selectNewCustomerConsultation(
                      "online"
                    )
                  }
                  className={`rounded-xl border px-4 py-4 text-left text-sm transition-all duration-300 ${
                    booking.consultationStatus === "online"
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/75 hover:border-[#D4AF37]/40"
                  }`}
                >
                  <span className="block font-medium">
                    Complete Online
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/75">
                    Complete your consultation before your appointment.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectNewCustomerConsultation(
                      "salon"
                    )
                  }
                  className={`rounded-xl border px-4 py-4 text-left text-sm transition-all duration-300 ${
                    booking.consultationStatus === "salon"
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/75 hover:border-[#D4AF37]/40"
                  }`}
                >
                  <span className="block font-medium">
                    Skip & Complete at Salon
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/75">
                    You will be asked to complete your consultation before treatment.
                  </span>
                </button>
              </div>
            </div>
          )}

        {errors.consultation && (
          <p className="text-sm text-red-300">
            {errors.consultation}
          </p>
        )}

        

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/75">
            Special Requests
            <span className="ml-2 normal-case tracking-normal text-white/60">
              Optional
            </span>
          </label>

          <div className="relative">
            <FileText
              size={18}
              className="absolute left-4 top-5 text-[#D4AF37]"
            />

            <textarea
              placeholder="Anything you'd like us to know?"
              rows={5}
              value={
                booking.customer.notes
              }
              onChange={(e) =>
                updateCustomer({
                  notes:
                    capitalizeWords(
                      e.target.value
                    ),
                })
              }
              className={`${inputClass} resize-none pl-12`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 px-5 py-4">
          <p className="text-sm leading-6 text-white/70">
            Your details are used only to
            manage and confirm your appointment.
          </p>
        </div>
      </div>
    </div>
  );
}





