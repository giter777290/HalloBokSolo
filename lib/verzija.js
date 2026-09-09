"use client";

export const VERZIJA = "1.0.0";
export const IME_APP = "Hallo-Bok";

export function Podnozje() {
  return (
    <p className="mt-8 pb-2 text-center text-[11px] text-tiho/70">
      {IME_APP} — v{VERZIJA}
    </p>
  );
}
