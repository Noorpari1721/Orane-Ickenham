type GlassPillProps = {
  children: React.ReactNode;
};

export default function GlassPill({
  children,
}: GlassPillProps) {
  return (
    <div
      className="
        relative
        rounded-full
        border
        border-white/25
        bg-white/10
        px-8
        py-3
        backdrop-blur-2xl
        shadow-[0_8px_30px_rgba(0,0,0,0.18)]
        before:absolute
        before:inset-0
        before:rounded-full
        before:bg-gradient-to-b
        before:from-white/20
        before:to-transparent
        before:pointer-events-none
      "
    >
      <div className="relative flex items-center gap-8">
        {children}
      </div>
    </div>
  );
}
