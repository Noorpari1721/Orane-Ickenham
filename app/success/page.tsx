export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9F6F2] px-6">
      <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          Booking Confirmed
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for choosing ORANE Ickenham.
          Your appointment has been successfully booked.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#C49A45] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[#B58A39]"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
