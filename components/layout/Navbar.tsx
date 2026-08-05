export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold tracking-wide">
          ORANE ICKENHAM
        </h1>

        <button className="bg-black text-white px-5 py-2 rounded-full hover:bg-neutral-800 transition">
          Book Appointment
        </button>
      </nav>
    </header>
  );
}