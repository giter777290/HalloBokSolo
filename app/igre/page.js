"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  supabase, akzentSetzen, punkteDazu, aktivitaetDazu, vorlesen, TEZINA
} from "../../lib/supabase";
import { Podnozje } from "../../lib/verzija";
import { karteNivoa, trenutnoNiveau } from "../../lib/nivoi";

/* ============================================================
   Gemeinsame Helfer
   ============================================================ */
function izmijesaj(niz) {
  return [...niz].sort(() => Math.random() - 0.5);
}

function pitanjaOd(pool, koliko) {
  return izmijesaj(pool).slice(0, koliko).map((k) => {
    const krivi = izmijesaj(pool.filter((x) => x.id !== k.id)).slice(0, 2).map((x) => x.de);
    return { karta: k, opcije: izmijesaj([k.de, ...krivi]) };
  });
}

/* ============================================================
   Hauptseite
   ============================================================ */
export default function Igre() {
  const router = useRouter();
  const [uid, setUid] = useState(null);
  const [karte, setKarte] = useState([]);
  const [igra, setIgra] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) return router.replace("/");
      setUid(s.session.user.id);

      const [{ data: p }, { data: k }, { data: teme }, { data: isp }] = await Promise.all([
        supabase.from("profile").select("akzent").eq("user_id", s.session.user.id).maybeSingle(),
        supabase.from("karten").select("*"),
        supabase.from("themen").select("*"),
        supabase.from("pruefungen").select("*").eq("user_id", s.session.user.id)
      ]);
      akzentSetzen(p?.akzent);
      // Spiele ziehen nur aus dem Niveau, das gerade dran ist
      setKarte(karteNivoa(k || [], teme || [], trenutnoNiveau(isp)));
    })();
  }, [router]);

  if (!uid || !karte.length) return null;

  if (igra === "brzina")  return <Brzina uid={uid} karte={karte} natrag={() => setIgra(null)} />;
  if (igra === "parovi")  return <Parovi uid={uid} karte={karte} natrag={() => setIgra(null)} />;

  return (
    <div className="stranica mx-auto max-w-md px-5 pt-8 md:max-w-3xl md:px-8">
      <button onClick={() => router.push("/start")} className="text-sm text-tiho">← Natrag</button>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">Igre</h1>
      <p className="mt-1 text-sm text-tiho">
        Kraće i brže od učenja, ali se svejedno broji u napredak.
      </p>

      <div className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        <button onClick={() => setIgra("brzina")} className="ploca w-full p-5 text-left">
          <p className="text-lg font-semibold tracking-tight">Brzina</p>
          <p className="mt-1 text-sm text-tiho">
            60 sekundi — koliko riječi stane.
          </p>
        </button>

        <button onClick={() => setIgra("parovi")} className="ploca w-full p-5 text-left">
          <p className="text-lg font-semibold tracking-tight">Parovi</p>
          <p className="mt-1 text-sm text-tiho">
            Spoji njemačku i hrvatsku riječ.
          </p>
        </button>
      </div>

      <Podnozje />
    </div>
  );
}

/* ============================================================
   1) Brzina — 60 Sekunden
   ============================================================ */
function Brzina({ uid, karte, natrag }) {
  const [pitanja] = useState(() => pitanjaOd(karte, 60));
  const [i, setI] = useState(0);
  const [tocno, setTocno] = useState(0);
  const [odabrano, setOdabrano] = useState(null);
  const [sekunde, setSekunde] = useState(60);
  const spremljeno = useRef(false);

  useEffect(() => {
    if (sekunde <= 0) return;
    const t = setTimeout(() => setSekunde((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sekunde]);

  useEffect(() => {
    if (sekunde === 0 && !spremljeno.current) {
      spremljeno.current = true;
      punkteDazu(uid, tocno * 3);
      aktivitaetDazu(uid, i, 60, i * TEZINA.igra);
    }
  }, [sekunde, uid, tocno, i]);

  if (sekunde === 0) {
    return (
      <div className="ekran items-center justify-center px-6 text-center">
        <p className="text-6xl font-semibold tracking-tight">{tocno}</p>
        <p className="mt-2 text-tiho">točnih od {i} u 60 sekundi</p>
        <p className="mt-1 text-sm text-tiho">+{tocno * 3} bodova</p>
        <button onClick={natrag} className="knopf-voll mt-8">Natrag na igre</button>
        <Podnozje />
      </div>
    );
  }

  const p = pitanja[i];

  function odgovori(o) {
    if (odabrano) return;
    const je = o === p.karta.de;
    setOdabrano(o);
    if (je) setTocno((n) => n + 1);
    setTimeout(() => { setOdabrano(null); setI((n) => n + 1); }, 320);
  }

  return (
    <div className="ekran w-full overflow-x-clip px-5 md:px-8">
      <div className="mx-auto w-full max-w-md pt-4 md:max-w-2xl">
        <div className="flex items-center justify-between">
          <button onClick={natrag} className="text-sm text-tiho">← Prekini</button>
          <span className={`text-lg font-semibold tabular-nums ${
            sekunde <= 10 ? "text-alarm" : ""}`}>{sekunde}s</span>
          <span className="text-sm text-tiho">{tocno} točnih</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ploha">
          <div className="h-full rounded-full bg-akzent transition-all"
               style={{ width: `${(sekunde / 60) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col justify-center
                      overflow-y-auto py-6 md:max-w-2xl">
        <p className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {p.karta.hr}
        </p>
      </div>

      <div className="mx-auto w-full max-w-md space-y-2 md:max-w-2xl">
        {p.opcije.map((o) => {
          const je = o === p.karta.de;
          const boja = !odabrano ? "ploca"
            : je ? "border border-akzent bg-akzent/15"
            : o === odabrano ? "border border-alarm/40 bg-alarm/10" : "ploca opacity-40";
          return (
            <button key={o} onClick={() => odgovori(o)}
              className={`w-full rounded-2xl p-4 text-left font-medium ${boja}`}>
              {o}
            </button>
          );
        })}
        <Podnozje />
      </div>
    </div>
  );
}

/* ============================================================
   2) Parovi — Deutsch zu Kroatisch
   ============================================================ */
function Parovi({ uid, karte, natrag }) {
  const [plocice] = useState(() => {
    const par = izmijesaj(karte).slice(0, 6);
    return izmijesaj(par.flatMap((k) => ([
      { kljuc: `de-${k.id}`, par: k.id, tekst: k.de, jezik: "de" },
      { kljuc: `hr-${k.id}`, par: k.id, tekst: k.hr, jezik: "hr" }
    ])));
  });

  const [okrenuto, setOkrenuto] = useState([]);
  const [nadeno, setNadeno] = useState([]);
  const [pokusaji, setPokusaji] = useState(0);
  const pocetak = useRef(Date.now());
  const spremljeno = useRef(false);

  const gotovo = nadeno.length === 6;

  useEffect(() => {
    if (gotovo && !spremljeno.current) {
      spremljeno.current = true;
      punkteDazu(uid, 40);
      aktivitaetDazu(uid, 6, Math.round((Date.now() - pocetak.current) / 1000),
        6 * TEZINA.igra);
    }
  }, [gotovo, uid]);

  function klik(p) {
    if (nadeno.includes(p.par) || okrenuto.find((x) => x.kljuc === p.kljuc)) return;
    if (okrenuto.length === 2) return;

    const novo = [...okrenuto, p];
    setOkrenuto(novo);

    if (novo.length === 2) {
      setPokusaji((n) => n + 1);
      if (novo[0].par === novo[1].par) {
        const njem = novo.find((x) => x.jezik === "de");
        vorlesen(njem.tekst);
        setTimeout(() => { setNadeno((n) => [...n, novo[0].par]); setOkrenuto([]); }, 500);
      } else {
        setTimeout(() => setOkrenuto([]), 800);
      }
    }
  }

  if (gotovo) {
    return (
      <div className="ekran items-center justify-center px-6 text-center">
        <p className="text-5xl font-semibold tracking-tight">Svih 6!</p>
        <p className="mt-2 text-tiho">{pokusaji} pokušaja · +40 bodova</p>
        <button onClick={natrag} className="knopf-voll mt-8">Natrag na igre</button>
        <Podnozje />
      </div>
    );
  }

  return (
    <div className="ekran w-full overflow-x-clip px-5 md:px-8">
      <div className="mx-auto w-full max-w-md pt-4 md:max-w-2xl">
        <div className="flex items-center justify-between">
          <button onClick={natrag} className="text-sm text-tiho">← Prekini</button>
          <span className="text-sm text-tiho">{nadeno.length} / 6</span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md min-h-0 flex-1 grid-cols-3 content-center
                      gap-2 overflow-y-auto py-6 md:max-w-2xl md:gap-3">
        {plocice.map((p) => {
          const vidljivo = nadeno.includes(p.par) || okrenuto.find((x) => x.kljuc === p.kljuc);
          const rijeseno = nadeno.includes(p.par);
          return (
            <button key={p.kljuc} onClick={() => klik(p)}
              className={`flex min-h-[5.5rem] items-center justify-center rounded-2xl p-2
                          text-center text-sm font-medium transition ${
                rijeseno ? "border border-akzent bg-akzent/15 text-akzent"
                : vidljivo ? "ploca"
                : "bg-akzent/10 text-transparent"}`}>
              {vidljivo ? p.tekst : "?"}
            </button>
          );
        })}
      </div>

      <div className="mx-auto w-full max-w-md md:max-w-2xl">
        <p className="text-center text-sm text-tiho">
          Spoji njemačku riječ s hrvatskom.
        </p>
        <Podnozje />
      </div>
    </div>
  );
}
