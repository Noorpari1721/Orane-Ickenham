"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import { useBooking } from "@/context/BookingContext";
import { serviceCategories } from "@/data/services";

type Answer = string | boolean;

type Question = {
  id: string;
  text: string;
};

type FormDefinition = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  consents: string[];
};

const FORM_DEFINITIONS: Record<string, FormDefinition> = {
  lashes: {
    id: "lashes",
    title: "Eyelash Extension Consultation & Consent",
    description:
      "Please answer the following questions so we can provide your treatment safely.",
    questions: [
      {
        id: "eye-infection",
        text: "Eye infection, conjunctivitis, stye, swelling or irritation?",
      },
      {
        id: "sensitive-eyes",
        text: "Sensitive/watery eyes or dry-eye condition?",
      },
      {
        id: "adhesive-allergy",
        text: "Known allergy/sensitivity to adhesives, acrylates, latex or cosmetics?",
      },
      {
        id: "previous-lash-reaction",
        text: "Previous reaction to lash extensions/lash adhesive?",
      },
      {
        id: "eye-surgery",
        text: "Recent eye surgery/procedure or medical treatment involving the eyes?",
      },
      {
        id: "lash-loss",
        text: "Alopecia or unusual eyelash loss?",
      },
      {
        id: "medication-condition",
        text: "Taking medication or have a medical condition that may affect today's treatment?",
      },
      {
        id: "pregnant-breastfeeding",
        text: "Pregnant or breastfeeding?",
      },
      {
        id: "contact-lenses",
        text: "Wearing contact lenses today?",
      },
    ],
    consents: [
      "I confirm the information provided is complete and accurate.",
      "I understand that irritation or an allergic reaction can occur even if I have previously had lash extensions without problems.",
      "I understand results and retention vary between clients and cannot be guaranteed.",
      "I agree to follow the aftercare instructions provided.",
      "I will immediately tell my technician about discomfort, burning or irritation during treatment.",
      "I consent to receiving the eyelash extension treatment.",
      "I consent to Orane Ickenham recording relevant health/allergy information for treatment safety in accordance with its Privacy Policy.",
    ],
  },

  "waxing-threading": {
    id: "waxing-threading",
    title: "Waxing Consultation & Consent",
    description:
      "Please answer the following questions about your skin, medication and recent treatments.",
    questions: [
      {
        id: "skin-allergy",
        text: "Allergies or sensitive/reactive skin?",
      },
      {
        id: "eczema-psoriasis",
        text: "Eczema, psoriasis, dermatitis or other skin condition in the treatment area?",
      },
      {
        id: "broken-skin",
        text: "Cuts, wounds, bruising, sunburn, infection or irritated/broken skin?",
      },
      {
        id: "retinoids",
        text: "Using retinol, tretinoin, retinoids, strong acids or prescription acne products?",
      },
      {
        id: "recent-skin-treatment",
        text: "Recent chemical peel, laser, IPL, microneedling or other skin treatment?",
      },
      {
        id: "skin-medication",
        text: "Taking medication that may make your skin thin, sensitive or prone to bruising?",
      },
      {
        id: "diabetes-healing",
        text: "Diabetes or condition affecting skin healing?",
      },
      {
        id: "previous-wax-reaction",
        text: "Previous adverse reaction to waxing?",
      },
      {
        id: "wax-pregnancy",
        text: "Pregnant or breastfeeding?",
      },
    ],
    consents: [
      "I confirm I have disclosed relevant medical conditions, medications and skin treatments.",
      "I understand temporary redness, sensitivity, irritation, bruising, follicular reaction or ingrown hairs may occur.",
      "I understand skin lifting/damage can occur where skin is particularly sensitive or affected by certain medications/products.",
      "I agree to follow the waxing aftercare provided.",
      "I consent to the waxing treatment.",
      "I consent to Orane Ickenham recording relevant health information for treatment safety in accordance with its Privacy Policy.",
    ],
  },

  facials: {
    id: "facials",
    title: "Facial Consultation & Consent",
    description:
      "Please answer the following questions about your skin, skincare and relevant medical information.",
    questions: [
      {
        id: "facial-allergy",
        text: "Allergies or known cosmetic/skincare sensitivities?",
      },
      {
        id: "facial-skin-condition",
        text: "Eczema, psoriasis, dermatitis, rosacea or other skin condition?",
      },
      {
        id: "facial-infection",
        text: "Active infection, cold sores, open wounds or sunburn?",
      },
      {
        id: "facial-retinoids",
        text: "Using retinol, tretinoin, retinoids, strong acids or acne medication?",
      },
      {
        id: "facial-procedures",
        text: "Recent Botox, fillers, chemical peel, laser, IPL or microneedling?",
      },
      {
        id: "facial-medication",
        text: "Taking medication that may affect your skin?",
      },
      {
        id: "facial-reaction",
        text: "Previous reaction to a facial or skincare product?",
      },
      {
        id: "facial-pregnancy",
        text: "Pregnant or breastfeeding?",
      },
      {
        id: "facial-medical-condition",
        text: "Any medical condition currently under medical supervision relevant to your treatment?",
      },
    ],
    consents: [
      "I confirm the information provided is complete and accurate.",
      "I understand temporary redness, sensitivity, dryness, irritation or breakouts may occur following a facial.",
      "I understand individual skin responses and treatment results cannot be guaranteed.",
      "I will tell my therapist immediately if I experience excessive burning, pain or discomfort.",
      "I agree to follow the aftercare provided.",
      "I consent to receiving the facial treatment.",
      "I consent to Orane Ickenham recording relevant health information for treatment safety in accordance with its Privacy Policy.",
    ],
  },

  massage: {
    id: "massage",
    title: "Massage Consultation & Consent",
    description:
      "Please answer the following questions so your therapist can assess your treatment safely.",
    questions: [
      {
        id: "massage-pregnancy",
        text: "Are you pregnant or possibly pregnant?",
      },
      {
        id: "massage-circulation",
        text: "Heart condition, high/low blood pressure or circulatory problems?",
      },
      {
        id: "massage-dvt",
        text: "DVT, thrombosis, blood clots or varicose veins?",
      },
      {
        id: "massage-injury",
        text: "Recent surgery, fracture, injury, sprain or muscular injury?",
      },
      {
        id: "massage-bones",
        text: "Back, neck, joint problems or osteoporosis?",
      },
      {
        id: "massage-neurological",
        text: "Diabetes, epilepsy or neurological condition?",
      },
      {
        id: "massage-cancer",
        text: "Cancer or currently/recently receiving cancer treatment?",
      },
      {
        id: "massage-unwell",
        text: "Fever, infection or currently feeling unwell?",
      },
      {
        id: "massage-skin",
        text: "Skin infection, rash, open wounds, bruising or inflammation?",
      },
      {
        id: "massage-swelling",
        text: "Swelling, numbness or unexplained pain?",
      },
      {
        id: "massage-oils",
        text: "Allergies/sensitivity to oils, fragrances or skincare products?",
      },
      {
        id: "massage-medication",
        text: "Taking medication or under medical supervision for a condition relevant to today's treatment?",
      },
    ],
    consents: [
      "I confirm that the information provided is complete and accurate and I have disclosed relevant medical conditions, medications, injuries and pregnancy.",
      "I understand massage at Orane Ickenham is a wellness/beauty treatment and not medical treatment or physiotherapy.",
      "I understand that temporary muscular tenderness, soreness, tiredness or other individual reactions may occasionally occur after massage.",
      "I understand that the therapist may modify, postpone or refuse treatment where there is a potential contraindication or safety concern.",
      "I will immediately tell my therapist if I experience pain, dizziness, excessive discomfort, breathing difficulty or feel unwell during treatment.",
      "I understand I can ask for the treatment or pressure to be changed or stopped at any time.",
      "I agree to follow the aftercare advice provided.",
      "I voluntarily consent to receiving the massage treatment.",
      "I consent to Orane Ickenham recording relevant health information for treatment safety in accordance with its Privacy Policy.",
    ],
  },
};

const CONSULTATION_CATEGORY_IDS = new Set([
  "lashes",
  "waxing-threading",
  "facials",
  "massage",
]);

function getSelectedServices(booking: any) {
  return booking.services?.length
    ? booking.services
    : booking.service
      ? [booking.service]
      : [];
}

function getRequiredForms(services: any[]) {
  const ids = new Set<string>();

  for (const service of services) {
    const category = serviceCategories.find((candidate) =>
      candidate.services.some(
        (candidateService) =>
          candidateService.id === service.id
      )
    );

    if (
      category &&
      CONSULTATION_CATEGORY_IDS.has(category.id)
    ) {
      ids.add(category.id);
    }
  }

  return Array.from(ids)
    .map((id) => FORM_DEFINITIONS[id])
    .filter(Boolean);
}

export default function Step5Consultation() {
  const {
    booking,
    updateBooking,
  } = useBooking();

  const selectedServices = getSelectedServices(booking);

  const requiredForms = useMemo(
    () => getRequiredForms(selectedServices),
    [selectedServices]
  );

  const [answers, setAnswers] = useState<
    Record<string, Answer>
  >(
    (booking.consultationResponses ?? {}) as Record<
      string,
      Answer
    >
  );

  const [details, setDetails] = useState(
    ""
  );

  const [error, setError] = useState("");

  const isSalon =
    booking.consultationStatus === "salon";

  const isExistingUnchanged =
    booking.consultationStatus ===
    "existing-unchanged";

  const shouldCompleteWithoutForm =
    isSalon ||
    isExistingUnchanged ||
    requiredForms.length === 0;

  useEffect(() => {
    if (
      shouldCompleteWithoutForm &&
      !booking.consultationCompleted
    ) {
      updateBooking({
        consultationCompleted: true,
      });
    }
  }, [
    shouldCompleteWithoutForm,
    booking.consultationCompleted,
    updateBooking,
  ]);

  const setAnswer = (
    key: string,
    value: Answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  const isFormComplete = (
    form: FormDefinition
  ) => {
    const questionsComplete =
      form.questions.every(
        (question) =>
          answers[
            `${form.id}.${question.id}`
          ] === true ||
          answers[
            `${form.id}.${question.id}`
          ] === false
      );

    const consentsComplete =
      form.consents.every(
        (_, index) =>
          answers[
            `${form.id}.consent.${index}`
          ] === true
      );

    return questionsComplete && consentsComplete;
  };

  const completeConsultation = () => {
    if (shouldCompleteWithoutForm) {
      updateBooking({
        consultationCompleted: true,
      });
      return;
    }

    const incompleteForm =
      requiredForms.find(
        (form) => !isFormComplete(form)
      );

    if (incompleteForm) {
      setError(
        `Please complete all questions and consent confirmations in the ${incompleteForm.title} form.`
      );
      return;
    }

    const responseData = {
      ...answers,
      "general-details": details,
    };

    updateBooking({
      consultationResponses: responseData,
      consultationCompleted: true,
    });

    setError("");
  };

  const yesDetailsNeeded = requiredForms.some(
    (form) =>
      form.questions.some(
        (question) =>
          answers[
            `${form.id}.${question.id}`
          ] === true
      )
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#D4AF37]">
          Step Five
        </p>

        <h2 className="mt-4 text-4xl font-light text-white md:text-5xl">
          Consultation & Consent
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-white/75">
          Please complete the consultation information
          relevant to your selected treatment.
        </p>
      </div>

      {isSalon && (
        <div className="mt-10 rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-4 sm:p-7">
          <div className="flex items-start gap-4">
            <CheckCircle2
              className="mt-1 shrink-0 text-[#D4AF37]"
              size={24}
            />

            <div>
              <h3 className="text-xl font-light text-white">
                Consultation at the Salon
              </h3>

              <p className="mt-3 leading-7 text-white/55">
                You have chosen to complete your
                consultation at Orane Ickenham before
                your treatment. No online consultation
                form is required.
              </p>
            </div>
          </div>
        </div>
      )}

      {isExistingUnchanged && (
        <div className="mt-10 rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-4 sm:p-7">
          <div className="flex items-start gap-4">
            <CheckCircle2
              className="mt-1 shrink-0 text-[#D4AF37]"
              size={24}
            />

            <div>
              <h3 className="text-xl font-light text-white">
                Consultation Information Confirmed
              </h3>

              <p className="mt-3 leading-7 text-white/55">
                You confirmed that your relevant
                consultation information remains unchanged.
              </p>
            </div>
          </div>
        </div>
      )}

      {!shouldCompleteWithoutForm &&
        requiredForms.length > 0 && (
          <div className="mt-10 space-y-8">
            {requiredForms.map((form) => (
              <section
                key={form.id}
                className="overflow-hidden rounded-[22px] sm:rounded-[28px] border border-white/10 bg-white/[0.035]"
              >
                <div className="border-b border-white/10 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
                      <ClipboardList size={21} />
                    </div>

                    <div>
                      <h3 className="text-xl font-light text-white sm:text-2xl">
                        ORANE ICKENHAM
                      </h3>

                      <p className="mt-2 text-lg text-[#D4AF37]">
                        {form.title}
                      </p>

                      <p className="mt-3 leading-6 text-white/70">
                        {form.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="space-y-5">
                    {form.questions.map(
                      (question, index) => {
                        const key =
                          `${form.id}.${question.id}`;

                        return (
                          <div
                            key={question.id}
                            className="rounded-2xl border border-white/10 bg-black/20 p-5"
                          >
                            <p className="text-sm leading-6 text-white/80">
                              {index + 1}.{" "}
                              {question.text}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              {[true, false].map(
                                (value) => (
                                  <button
                                    key={String(value)}
                                    type="button"
                                    onClick={() =>
                                      setAnswer(
                                        key,
                                        value
                                      )
                                    }
                                    className={`rounded-xl border px-4 py-3 text-sm transition-all ${
                                      answers[key] ===
                                      value
                                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-white"
                                        : "border-white/10 bg-white/[0.025] text-white/55 hover:border-[#D4AF37]/40"
                                    }`}
                                  >
                                    {value
                                      ? "Yes"
                                      : "No"}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <label className="block text-xs uppercase tracking-[0.2em] text-white/75">
                      If YES to any question,
                      please provide details
                    </label>

                    <textarea
                      rows={5}
                      value={details}
                      onChange={(event) =>
                        setDetails(
                          event.target.value
                        )
                      }
                      placeholder="Please provide relevant details..."
                      className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition focus:border-[#D4AF37]/60"
                    />

                    {!yesDetailsNeeded && (
                      <p className="mt-2 text-xs text-white/65">
                        If applicable, please provide
                        any relevant details.
                      </p>
                    )}
                  </div>

                  <div className="mt-7">
                    <div className="mb-5 flex items-center gap-3">
                      <ShieldCheck
                        size={20}
                        className="text-[#D4AF37]"
                      />

                      <h4 className="text-lg text-white">
                        Client Consent
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {form.consents.map(
                        (consent, index) => {
                          const key =
                            `${form.id}.consent.${index}`;

                          const checked =
                            answers[key] === true;

                          return (
                            <label
                              key={key}
                              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                                checked
                                  ? "border-[#D4AF37]/40 bg-[#D4AF37]/[0.07]"
                                  : "border-white/10 bg-black/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  setAnswer(
                                    key,
                                    event.target.checked
                                  )
                                }
                                className="mt-1 h-5 w-5 shrink-0 accent-[#D4AF37]"
                              />

                              <span className="text-sm leading-6 text-white/65">
                                {consent}
                              </span>
                            </label>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            <div className="rounded-[22px] sm:rounded-[28px] border border-[#D4AF37]/15 bg-[#D4AF37]/[0.04] p-6">
              <div className="flex items-start gap-4">
                <Check
                  size={20}
                  className="mt-1 shrink-0 text-[#D4AF37]"
                />

                <div>
                  <p className="font-medium text-white">
                    Treatment information
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Please make sure all information
                    provided is accurate. Your therapist
                    may discuss your answers with you
                    before treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {requiredForms.length === 0 &&
        !isSalon &&
        !isExistingUnchanged && (
          <div className="mt-10 rounded-[22px] sm:rounded-[28px] border border-white/10 bg-white/[0.035] p-4 sm:p-7">
            <div className="flex items-start gap-4">
              <CheckCircle2
                className="mt-1 text-[#D4AF37]"
                size={23}
              />

              <div>
                <h3 className="text-xl font-light text-white">
                  No Consultation Required
                </h3>

                <p className="mt-3 leading-7 text-white/70">
                  Your selected treatment does not
                  require an online consultation form.
                  You can continue with your booking.
                </p>
              </div>
            </div>
          </div>
        )}

      {error && (
        <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm leading-6 text-red-200">
          {error}
        </div>
      )}

      {!booking.consultationCompleted && (
        <button
          type="button"
          onClick={completeConsultation}
          className="mt-6 flex w-full items-center justify-center gap-3 sm:mt-8 rounded-full bg-[#D4AF37] px-4 py-3.5 sm:px-7 sm:py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2c45a]"
        >
          <CheckCircle2 size={19} />
          Confirm Consultation
        </button>
      )}

      {booking.consultationCompleted && (
        <div className="mt-8 flex items-center justify-center gap-3 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3.5 sm:px-7 sm:py-4 text-sm font-medium uppercase tracking-[0.15em] text-[#D4AF37]">
          <CheckCircle2 size={19} />
          Consultation Completed
        </div>
      )}
    </div>
  );
}
