"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  Plus,
  PoundSterling,
  Power,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

type CustomerStatus = "ACTIVE" | "INACTIVE";

type Customer = {
  id: string;
  customerNo: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  status: CustomerStatus;
  notes: string | null;
  visits: number;
  spent: number;
  lastVisit: string | null;
  favourite: string;
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

const emptyForm: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

function formatMoney(value: number) {
  const pound = String.fromCharCode(163);
  return `${pound}${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string | null) {
  if (!value) return "No visits yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No visits yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(customer: Customer) {
  const first = customer.firstName?.charAt(0) || "";
  const last = customer.lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "CU";
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/customers",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load customers."
        );
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone || "",
        customer.customerNo,
        customer.favourite,
      ].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [customers, search]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "ACTIVE"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "INACTIVE"
  ).length;

  const totalRevenue = customers.reduce(
    (total, customer) =>
      total + Number(customer.spent || 0),
    0
  );

  const totalVisits = customers.reduce(
    (total, customer) =>
      total + Number(customer.visits || 0),
    0
  );

  function openAddModal() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      notes: customer.notes || "",
    });

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const editing = Boolean(editingCustomer);

      const response = await fetch(
        "/api/admin/customers",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(editing
              ? { id: editingCustomer?.id }
              : {}),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            notes: form.notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save customer."
        );
      }

      if (editing) {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === data.customer.id
              ? data.customer
              : customer
          )
        );

        if (selected?.id === data.customer.id) {
          setSelected(data.customer);
        }
      } else {
        setCustomers((current) => [
          data.customer,
          ...current,
        ]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(customer: Customer) {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/customers",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: customer.id,
            status:
              customer.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to change customer status."
        );
      }

      setCustomers((current) =>
        current.map((item) =>
          item.id === data.customer.id
            ? data.customer
            : item
        )
      );

      if (selected?.id === data.customer.id) {
        setSelected(data.customer);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change customer status."
      );
    }
  }

  async function deleteCustomer(
    customer: Customer
  ) {
    const confirmed = window.confirm(
      "Delete " +
        customer.name +
        " permanently?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/customers",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: customer.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete customer."
        );
      }

      setCustomers((current) =>
        current.filter(
          (item) => item.id !== customer.id
        )
      );

      if (selected?.id === customer.id) {
        setSelected(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete customer."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-[1600px]">

          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/admin"
                className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#D4AF37]"
              >
                <ArrowLeft size={14} />
                Admin Dashboard
              </Link>

              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Management
              </p>

              <h1 className="mt-2 text-3xl font-light sm:text-4xl">
                Customers
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Manage customer records, visits and spending.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e0bd45]"
            >
              <Plus size={17} />
              Add Customer
            </button>
          </header>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Customers"
              value={
                loading
                  ? "..."
                  : String(customers.length)
              }
              description="Customers in database"
              icon={Users}
            />

            <StatCard
              label="Active"
              value={
                loading
                  ? "..."
                  : String(activeCustomers)
              }
              description="Active customer accounts"
              icon={CheckCircle2}
            />

            <StatCard
              label="Total Visits"
              value={
                loading
                  ? "..."
                  : String(totalVisits)
              }
              description="Recorded appointments"
              icon={CalendarCheck}
            />

            <StatCard
              label="Customer Revenue"
              value={
                loading
                  ? "..."
                  : formatMoney(totalRevenue)
              }
              description="Total recorded spending"
              icon={PoundSterling}
            />
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search customers, email, phone or customer number..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#D4AF37]/30"
                />
              </div>

              <div className="text-xs text-white/30">
                {filteredCustomers.length}{" "}
                {filteredCustomers.length === 1
                  ? "customer"
                  : "customers"}
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="border-b border-white/10 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Customer Records
              </p>

              <h2 className="mt-1 text-xl font-light">
                All Customers
              </h2>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-sm text-white/40">
                  Loading customers...
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <Users
                  size={36}
                  className="mx-auto text-white/15"
                />

                <p className="mt-4 text-sm text-white/45">
                  {customers.length === 0
                    ? "No customers found."
                    : "No customers match your search."}
                </p>

                {customers.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm text-black"
                  >
                    <Plus size={16} />
                    Add First Customer
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Contact
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Visits
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Spent
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Last Visit
                        </th>

                        <th className="px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {filteredCustomers.map(
                        (customer) => (
                          <tr
                            key={customer.id}
                            className="transition hover:bg-white/[0.025]"
                          >
                            <td className="px-6 py-5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelected(customer)
                                }
                                className="flex items-center gap-3 text-left"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-xs text-[#D4AF37]">
                                  {getInitials(customer)}
                                </div>

                                <div>
                                  <p className="text-sm text-white">
                                    {customer.name}
                                  </p>

                                  <p className="mt-1 text-[11px] text-white/25">
                                    {customer.customerNo}
                                  </p>
                                </div>
                              </button>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/70">
                                {customer.email}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {customer.phone ||
                                  "No phone"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm">
                                {customer.visits}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm">
                                {formatMoney(
                                  Number(
                                    customer.spent || 0
                                  )
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-white/60">
                                {formatDate(
                                  customer.lastVisit
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${
                                  customer.status ===
                                  "ACTIVE"
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                    : "border-white/10 bg-white/5 text-white/40"
                                }`}
                              >
                                {customer.status ===
                                "ACTIVE" ? (
                                  <CheckCircle2
                                    size={12}
                                  />
                                ) : (
                                  <XCircle size={12} />
                                )}

                                {customer.status}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      customer
                                    )
                                  }
                                  title="Edit customer"
                                  className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:border-[#D4AF37]/20 hover:text-[#D4AF37]"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleStatus(
                                      customer
                                    )
                                  }
                                  title={
                                    customer.status ===
                                    "ACTIVE"
                                      ? "Deactivate customer"
                                      : "Activate customer"
                                  }
                                  className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:border-white/20 hover:text-white"
                                >
                                  <Power size={15} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteCustomer(
                                      customer
                                    )
                                  }
                                  title="Delete customer"
                                  className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:border-red-400/20 hover:text-red-300"
                                >
                                  <Trash2 size={15} />
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
                  {filteredCustomers.map(
                    (customer) => (
                      <div
                        key={customer.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(customer)
                            }
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-xs text-[#D4AF37]">
                              {getInitials(customer)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm">
                                {customer.name}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {customer.customerNo}
                              </p>
                            </div>
                          </button>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] ${
                              customer.status ===
                              "ACTIVE"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/5 text-white/40"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          <InfoItem
                            label="Email"
                            value={customer.email}
                          />

                          <InfoItem
                            label="Phone"
                            value={
                              customer.phone ||
                              "No phone"
                            }
                          />

                          <InfoItem
                            label="Visits"
                            value={String(
                              customer.visits
                            )}
                          />

                          <InfoItem
                            label="Spent"
                            value={formatMoney(
                              Number(
                                customer.spent || 0
                              )
                            )}
                          />

                          <InfoItem
                            label="Last Visit"
                            value={formatDate(
                              customer.lastVisit
                            )}
                          />

                          <InfoItem
                            label="Favourite"
                            value={
                              customer.favourite ||
                              "Not recorded"
                            }
                          />
                        </div>

                        <div className="mt-5 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                customer
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
                                customer
                              )
                            }
                            className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50"
                          >
                            {customer.status ===
                            "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCustomer(
                                customer
                              )
                            }
                            className="rounded-xl border border-red-400/10 px-4 py-2.5 text-xs text-red-300/70"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl">

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-sm text-[#D4AF37]">
                  {getInitials(selected)}
                </div>

                <div>
                  <p className="text-lg font-light">
                    {selected.name}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {selected.customerNo}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={Mail}
                label="Email"
                value={selected.email}
              />

              <DetailItem
                icon={Phone}
                label="Phone"
                value={
                  selected.phone ||
                  "No phone number"
                }
              />

              <DetailItem
                icon={CalendarCheck}
                label="Visits"
                value={String(
                  selected.visits
                )}
              />

              <DetailItem
                icon={PoundSterling}
                label="Total Spent"
                value={formatMoney(
                  Number(selected.spent || 0)
                )}
              />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Favourite Service
              </p>

              <p className="mt-2 text-sm text-white/70">
                {selected.favourite ||
                  "Not recorded"}
              </p>
            </div>

            {selected.notes && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">
                  {selected.notes}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  openEditModal(selected)
                }
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Edit Customer
              </button>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl bg-[#D4AF37] py-3 text-sm text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >
          <div className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  Customer
                </p>

                <h2 className="mt-1 text-xl font-light">
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
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
                  value={form.firstName}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      firstName: value,
                    }))
                  }
                  required
                />

                <Field
                  label="Last Name"
                  value={form.lastName}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      lastName: value,
                    }))
                  }
                  required
                />

                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                  required
                />

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                />
              </div>

              <div className="mt-5">
                <label className="text-xs text-white/40">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Customer notes..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]/30"
                />
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
                    : editingCustomer
                      ? "Save Changes"
                      : "Add Customer"}
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

      <p className="mt-2 text-xs text-white/30">
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
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p className="mt-1 truncate text-sm text-white/65">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-white/25">
        <Icon size={14} />
        <p className="text-[10px] uppercase tracking-[0.15em]">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-sm text-white/65">
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
      <label className="text-xs text-white/40">
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
          onChange(event.target.value)
        }
        required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]/30"
      />
    </div>
  );
}
