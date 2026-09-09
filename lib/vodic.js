"use client";

import { useState } from "react";

const KORACI = [
  {
    naslov: "Dobrodošli!",
    tekst: "Hallo-Bok je aplikacija za učenje njemačkog. Sve je objašnjeno na hrvatskom, samo su riječi koje se uče na njemačkom.",
    savjet: "Deset minuta dnevno je sasvim dovoljno."
  },
  {
    naslov: "Put do A1",
    tekst: "Gradivo je podijeljeno na tri dijela. Svaki dio ima nekoliko razina, a svaka razina 20 kartica.",
    savjet: "Sljedeći dio se otvara tek nakon položenog ispita iz prethodnog."
  },
  {
    naslov: "Kartica mora sjesti dvaput",
    tekst: "Kad neku riječ pogodite prvi put, kružić se djelomično oboji. Ista kartica vrati se za dva sata. Pogodite li je i tada — kružić je pun.",
    savjet: "Zato razina ne postane plava odmah. To nije greška."
  },
  {
    naslov: "Razina X i ispit",
    tekst: "Riječi koje su zadavale muke skupljaju se u razini X. Kad se i ona prođe, otvara se ispit tog dijela.",
    savjet: "Ispit je 20 pitanja, za prolaz treba 80 posto. Može se ponavljati koliko god puta."
  },
  {
    naslov: "Slušanje i igre",
    tekst: "Svaku njemačku riječ možete čuti — dovoljno je pritisnuti Slušaj. U Igrama su Brzina i Parovi, kratke vježbe koje se također broje u napredak.",
    savjet: "Nakon položenog velikog ispita dobiva se potvrda koju se može spremiti."
  }
];

export function Vodic({ onKraj }) {
  const [i, setI] = useState(0);
  const k = KORACI[i];
  const zadnji = i === KORACI.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-pod px-6"
         style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)",
                  paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col md:max-w-lg">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {KORACI.map((_, n) => (
              <span key={n} className={`h-1.5 w-6 rounded-full transition ${
                n <= i ? "bg-akzent" : "bg-rub"}`} />
            ))}
          </div>
          <button onClick={onKraj} className="text-sm text-tiho">Preskoči</button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {k.naslov}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-tekst/90">{k.tekst}</p>
          <p className="mt-6 rounded-xl border border-rub bg-ploha p-4 text-sm text-tiho">
            {k.savjet}
          </p>
        </div>

        <div className="flex gap-3">
          {i > 0 && (
            <button onClick={() => setI(i - 1)} className="knopf-leer flex-1">Natrag</button>
          )}
          <button onClick={() => (zadnji ? onKraj() : setI(i + 1))}
            className="knopf-voll flex-[2]">
            {zadnji ? "Krenimo!" : "Dalje"}
          </button>
        </div>
      </div>
    </div>
  );
}
