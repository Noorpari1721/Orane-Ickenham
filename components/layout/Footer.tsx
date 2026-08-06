export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 px-6 text-center text-sm text-gray-500">
      <p className="mb-2 text-lg font-semibold tracking-wide text-black">
        ORANE ICKENHAM
      </p>
      <p>Premium Nails • Lashes • Japanese Head Spa • Beauty Treatments</p>
      <p className="mt-4">&copy; {new Date().getFullYear()} Orane Ickenham. All rights reserved.</p>
    </footer>
  );
}