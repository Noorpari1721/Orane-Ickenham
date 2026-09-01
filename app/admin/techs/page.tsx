"use client";


import BackToDashboard from "@/components/admin/BackToDashboard";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Plus,
  Power,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type TechStatus = "AVAILABLE" | "UNAVAILABLE";

type Tech = {
  id: string;
  techNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  experience: number;
  specialties: string[];
  status: TechStatus;
};

type TechForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  specialties: string;
};

const emptyForm: TechForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "Beauty Therapist",
  experience: "0",
  specialties: "",
};

function getInitials(tech: Tech) {
  const first = tech.firstName?.charAt(0) || "";
  const last = tech.lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "TH";
}

function fullName(tech: Tech) {
  return `${tech.firstName} ${tech.lastName}`.trim();
}

export default function AdminTechsPage() {
  const [techs, setTechs] = useState<Tech[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] =
    useState<Tech | null>(null);

  const [form, setForm] =
    useState<TechForm>(emptyForm);

  async function loadTechs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/techs",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load technicians."
        );
      }

      setTechs(data.techs || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load technicians."
      );
    } finally {
      setLoading(false);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadTechs();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filteredTechs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return techs.filter((tech) => {
      const name =
        `${tech.firstName} ${tech.lastName}`
          .toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        tech.techNo
          .toLowerCase()
          .includes(query) ||
        (tech.email || "")
          .toLowerCase()
          .includes(query) ||
        (tech.phone || "")
          .toLowerCase()
          .includes(query) ||
        (tech.role || "")
          .toLowerCase()
          .includes(query) ||
        tech.specialties.some((item) =>
          item.toLowerCase().includes(query)
        );

      const matchesStatus =
        status === "All" ||
        tech.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [techs, search, status]);

  const availableCount = techs.filter(
    (tech) =>
      tech.status === "AVAILABLE"
  ).length;

  const unavailableCount =
    techs.length - availableCount;

  const averageExperience =
    techs.length > 0
      ? techs.reduce(
          (total, tech) =>
            total + Number(
              tech.experience || 0
            ),
          0
        ) / techs.length
      : 0;

  const rolesCount = new Set(
    techs.map((tech) => tech.role || "Beauty Therapist")
  ).size;

  function openAddModal() {
    setEditingTech(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(tech: Tech) {
    setEditingTech(tech);

    setForm({
      firstName: tech.firstName,
      lastName: tech.lastName,
      email: tech.email || "",
      phone: tech.phone || "",
      role:
        tech.role ||
        "Beauty Therapist",
      experience: String(
        tech.experience || 0
      ),
      specialties:
        tech.specialties.join(", "),
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingTech(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.firstName.trim()) {
      setError("Please enter a first name.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Please enter a last name.");
      return;
    }

    const experience = Number(
      form.experience
    );

    if (
      !Number.isFinite(experience) ||
      experience < 0
    ) {
      setError(
        "Please enter a valid experience."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing =
        Boolean(editingTech);

      const specialties = form.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch(
        "/api/admin/techs",
        {
          method: isEditing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...(isEditing
              ? {
                  id: editingTech?.id,
                }
              : {}),
            firstName:
              form.firstName.trim(),
            lastName:
              form.lastName.trim(),
            email:
              form.email.trim(),
            phone:
              form.phone.trim(),
            role:
              form.role.trim() ||
              "Beauty Therapist",
            experience,
            specialties,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save technician."
        );
      }

      if (isEditing) {
        setTechs((current) =>
          current.map((tech) =>
            tech.id === data.tech.id
              ? data.tech
              : tech
          )
        );
      } else {
        setTechs((current) => [
          data.tech,
          ...current,
        ]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save technician."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(
    tech: Tech
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/techs",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: tech.id,
            status:
              tech.status === "AVAILABLE"
                ? "UNAVAILABLE"
                : "AVAILABLE",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to change technician status."
        );
      }

      setTechs((current) =>
        current.map((item) =>
          item.id === data.tech.id
            ? data.tech
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change technician status."
      );
    }
  }

  async function deleteTech(
    tech: Tech
  ) {
    const confirmed =
      window.confirm(
        "Delete " +
          fullName(tech) +
          " permanently?"
      );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/techs",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: tech.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete technician."
        );
      }

      setTechs((current) =>
        current.filter(
          (item) =>
            item.id !== tech.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete technician."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-[1600px]">

          <BackToDashboard />


          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>

              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Management
              </p>

              <h1 className="mt-2 text-3xl font-light sm:text-4xl">
                Techs
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Manage therapists, specialists and staff availability.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e0bd45]"
            >
              <Plus size={17} />
              Add Technician
            </button>
          </header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Techs"
              value={
                loading
                  ? "..."
                  : String(techs.length)
              }
              description="Technicians in team"
              icon={Users}
            />

            <StatCard
              label="Available"
              value={
                loading
                  ? "..."
                  : String(availableCount)
              }
              description="Available for bookings"
              icon={CheckCircle2}
            />

            <StatCard
              label="Unavailable"
              value={
                loading
                  ? "..."
                  : String(
                      unavailableCount
                    )
              }
              description="Currently unavailable"
              icon={XCircle}
            />

            <StatCard
              label="Average Experience"
              value={
                loading
                  ? "..."
                  : `${averageExperience.toFixed(1)} yrs`
              }
              description="Across the team"
              icon={UserRound}
            />
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search technicians, roles or specialties..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/60 transition focus:border-[#D4AF37]/30"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "AVAILABLE",
                  "UNAVAILABLE",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setStatus(item)
                    }
                    className={`rounded-xl border px-4 py-2.5 text-xs transition ${
                      status === item
                        ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {item === "All"
                      ? "All"
                      : item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="border-b border-white/10 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Team
              </p>

              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-xl font-light">
                  All Technicians
                </h2>

                <p className="text-xs text-white/65">
                  {filteredTechs.length}{" "}
                  {filteredTechs.length === 1
                    ? "technician"
                    : "technicians"}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-white/70">
                  Loading technicians...
                </p>
              </div>
            ) : filteredTechs.length === 0 ? (
              <div className="p-12 text-center">
                <UserRound
                  size={38}
                  className="mx-auto text-white/50"
                />

                <p className="mt-4 text-sm text-white/75">
                  {techs.length === 0
                    ? "No technicians found."
                    : "No technicians match your filters."}
                </p>

                {techs.length === 0 && (
                  <button
                    type="button"
                    onClick={
                      openAddModal
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm text-black"
                  >
                    <Plus size={16} />
                    Add First Technician
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Technician
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Contact
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Role
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Experience
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Specialties
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {filteredTechs.map(
                        (tech) => (
                          <tr
                            key={tech.id}
                            className="transition hover:bg-white/[0.025]"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-xs text-[#D4AF37]">
                                  {getInitials(
                                    tech
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm text-white">
                                    {fullName(
                                      tech
                                    )}
                                  </p>

                                  <p className="mt-1 text-[11px] text-white/60">
                                    {tech.techNo}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/70">
                                {tech.email ||
                                  "No email"}
                              </p>

                              <p className="mt-1 text-xs text-white/65">
                                {tech.phone ||
                                  "No phone"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/60">
                                {tech.role ||
                                  "Beauty Therapist"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm">
                                {tech.experience}{" "}
                                {tech.experience ===
                                1
                                  ? "year"
                                  : "years"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex max-w-[230px] flex-wrap gap-1.5">
                                {tech.specialties
                                  .slice(0, 3)
                                  .map(
                                    (
                                      specialty
                                    ) => (
                                      <span
                                        key={
                                          specialty
                                        }
                                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/75"
                                      >
                                        {
                                          specialty
                                        }
                                      </span>
                                    )
                                  )}

                                {tech
                                  .specialties
                                  .length >
                                  3 && (
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/65">
                                    +
                                    {tech
                                      .specialties
                                      .length -
                                      3}
                                  </span>
                                )}

                                {tech
                                  .specialties
                                  .length ===
                                  0 && (
                                  <span className="text-xs text-white/60">
                                    None
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${
                                  tech.status ===
                                  "AVAILABLE"
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                    : "border-white/10 bg-white/5 text-white/70"
                                }`}
                              >
                                {tech.status ===
                                "AVAILABLE" ? (
                                  <CheckCircle2
                                    size={12}
                                  />
                                ) : (
                                  <XCircle
                                    size={12}
                                  />
                                )}

                                {
                                  tech.status
                                }
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      tech
                                    )
                                  }
                                  title="Edit technician"
                                  className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:border-[#D4AF37]/20 hover:text-[#D4AF37]"
                                >
                                  <Edit3
                                    size={15}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleStatus(
                                      tech
                                    )
                                  }
                                  title={
                                    tech.status ===
                                    "AVAILABLE"
                                      ? "Set unavailable"
                                      : "Set available"
                                  }
                                  className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
                                >
                                  <Power
                                    size={15}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTech(
                                      tech
                                    )
                                  }
                                  title="Delete technician"
                                  className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:border-red-400/20 hover:text-red-300"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-white/10 lg:hidden">
                  {filteredTechs.map(
                    (tech) => (
                      <div
                        key={tech.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-xs text-[#D4AF37]">
                              {getInitials(
                                tech
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm">
                                {fullName(
                                  tech
                                )}
                              </p>

                              <p className="mt-1 text-xs text-white/65">
                                {tech.techNo}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] ${
                              tech.status ===
                              "AVAILABLE"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/5 text-white/70"
                            }`}
                          >
                            {tech.status}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          <InfoItem
                            label="Role"
                            value={
                              tech.role ||
                              "Beauty Therapist"
                            }
                          />

                          <InfoItem
                            label="Experience"
                            value={`${tech.experience} years`}
                          />

                          <InfoItem
                            label="Email"
                            value={
                              tech.email ||
                              "No email"
                            }
                          />

                          <InfoItem
                            label="Phone"
                            value={
                              tech.phone ||
                              "No phone"
                            }
                          />
                        </div>

                        <div className="mt-4">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                            Specialties
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {tech.specialties.length >
                            0 ? (
                              tech.specialties.map(
                                (
                                  specialty
                                ) => (
                                  <span
                                    key={
                                      specialty
                                    }
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/75"
                                  >
                                    {
                                      specialty
                                    }
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-xs text-white/60">
                                None
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                tech
                              )
                            }
                            className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(
                                tech
                              )
                            }
                            className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50"
                          >
                            {tech.status ===
                            "AVAILABLE"
                              ? "Unavailable"
                              : "Available"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTech(
                                tech
                              )
                            }
                            className="rounded-xl border border-red-400/10 px-4 py-2.5 text-xs text-red-300/70"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Team Availability
              </p>

              <p className="mt-3 text-2xl font-light">
                {loading
                  ? "..."
                  : `${availableCount}/${techs.length}`}
              </p>

              <p className="mt-1 text-xs text-white/65">
                Technicians currently available
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Team Roles
              </p>

              <p className="mt-3 text-2xl font-light">
                {loading
                  ? "..."
                  : rolesCount}
              </p>

              <p className="mt-1 text-xs text-white/65">
                Different roles across the team
              </p>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  Team
                </p>

                <h2 className="mt-1 text-xl font-light">
                  {editingTech
                    ? "Edit Technician"
                    : "Add Technician"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-white/65 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First Name"
                  value={
                    form.firstName
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        firstName:
                          value,
                      })
                    )
                  }
                  required
                />

                <Field
                  label="Last Name"
                  value={
                    form.lastName
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        lastName:
                          value,
                      })
                    )
                  }
                  required
                />

                <Field
                  label="Email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        email:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Phone"
                  value={
                    form.phone
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        phone:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Role"
                  value={
                    form.role
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        role: value,
                      })
                    )
                  }
                />

                <Field
                  label="Experience (years)"
                  type="number"
                  value={
                    form.experience
                  }
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        experience:
                          value,
                      })
                    )
                  }
                />
              </div>

              <div className="mt-5">
                <label className="text-xs text-white/70">
                  Specialties
                </label>

                <input
                  type="text"
                  value={
                    form.specialties
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        specialties:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Nails, Lashes, Facial"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#D4AF37]/30"
                />

                <p className="mt-2 text-[11px] text-white/60">
                  Separate multiple specialties with commas.
                </p>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#D4AF37] py-3 text-sm font-medium text-black transition hover:bg-[#e0bd45] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTech
                      ? "Save Changes"
                      : "Add Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#D4AF37]/20 hover:bg-white/[0.055]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/50">
          {label}
        </span>

        <Icon
          size={18}
          className="shrink-0 text-[#D4AF37]"
        />
      </div>

      <p className="mt-4 text-3xl font-light">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/65">
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
        {label}
      </p>

      <p className="mt-1 truncate text-sm text-white/65">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-white/70">
        {label}

        {required && (
          <span className="ml-1 text-[#D4AF37]">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#D4AF37]/30"
      />
    </div>
  );
}
