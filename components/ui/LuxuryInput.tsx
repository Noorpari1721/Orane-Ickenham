"use client";

import { ReactNode } from "react";

type LuxuryInputProps = {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  icon?: ReactNode;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function LuxuryInput({
  label,
  placeholder,
  type = "text",
  value,
  icon,
  onChange,
}: LuxuryInputProps) {
  return (
    <div>
      <label className="mb-3 block text-xs uppercase tracking-[0.25em] text-white/40">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
          w-full
          rounded-2xl
          border border-white/10
          bg-white/5
          px-5
          py-4
          text-white
          outline-none
          transition-all
          placeholder:text-white/30
          focus:border-[#D4AF37]/60
          "
          style={{
            paddingLeft: icon ? "3.5rem" : "1.25rem",
          }}
        />

      </div>
    </div>
  );
}
