"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type VisitType = "Teleporada" | "Wizyta domowa";
const DOCTORS = ["Dr. Jan Sowa"] as const;

function generateAllSlots(): string[] {
  const out: string[] = [];
  for (let h = 7; h <= 21; h++) {
    for (let m = 0; m < 60; m += 10) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
const ALL_SLOTS = generateAllSlots();

function roundUpToNext10(date: Date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  const add = (10 - (m % 10)) % 10;
  d.setMinutes(m + add);
  return d;
}

export default function BookingForm() {
  const sp = useSearchParams();

  // 🔧 tylko te dwie linie są zmienione
  const urlType = decodeURIComponent(sp?.get("type") ?? "");
  const urlDoctor = decodeURIComponent(sp?.get("doctor") ?? "");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [pesel, setPesel] = useState("");
  const [noPesel, setNoPesel] = useState(false);

  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  const [visitType, setVisitType] = useState<VisitType>(
    urlType === "Wizyta domowa" ? "Wizyta domowa" : "Teleporada"
  );
  const [doctor, setDoctor] = useState<string>(urlDoctor || DOCTORS[0]);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const price = useMemo(() => (visitType === "Teleporada" ? 49 : 350), [visitType]);

  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  useEffect(() => {
    setTakenSlots([]);
    setTime("");
    if (!date) return;
    fetch(`/api/bookings/availability?date=${encodeURIComponent(date)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.taken)) setTakenSlots(d.taken as string[]);
      })
      .catch(() => {});
  }, [date]);

  const displaySlots = useMemo(() => {
    if (!date) return ALL_SLOTS;
    let slots = [...ALL_SLOTS];

    if (date === todayStr) {
      const nowRounded = roundUpToNext10(today);
      const hh = String(nowRounded.getHours()).padStart(2, "0");
      const mm = String(nowRounded.getMinutes()).padStart(2, "0");
      const minSlot = `${hh}:${mm}`;
      slots = slots.filter((s) => s >= minSlot);
    }

    if (visitType === "Teleporada" && takenSlots.length) {
      const takenSet = new Set(takenSlots);
      slots = slots.filter((s) => !takenSet.has(s));
    }

    return slots;
  }, [date, visitType, takenSlots, today, todayStr]);

  useEffect(() => {
    if (urlType === "Wizyta domowa" || urlType === "Teleporada") {
      setVisitType(urlType as VisitType);
    }
    if (urlDoctor) setDoctor(urlDoctor);
  }, [urlType, urlDoctor]);

  const isValidSelectedDateTime = () => {
    if (!date || !time) return false;
    const dt = new Date(`${date}T${time}:00.000Z`);
    return dt.getTime() > Date.now();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg("");

    if (!date) return setErrMsg("Wybierz datę.");
    if (!time) return setErrMsg("Wybierz godzinę.");
    if (!isValidSelectedDateTime()) return setErrMsg("Nie można rezerwować terminu w przeszłości.");

    if (visitType === "Wizyta domowa" && !address.trim()) {
      return setErrMsg("Adres wizyty domowej jest wymagany.");
    }

    if (!noPesel) {
      if (!/^\d{11}$/.test(pesel)) {
        return setErrMsg("PESEL musi składać się z 11 cyfr.");
      }
    }

    if (loading) return;
    setLoading(true);

    try {
      const iso = new Date(`${date}T${time}:00.000Z`).toISOString();

      const res = await fetch("/api/bookings", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          visitType,
          doctor,
          date: iso,
          notes,
          address: visitType === "Wizyta domowa" ? address.trim() : undefined,
          pesel: !noPesel ? pesel : undefined,
          noPesel,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setLoading(false);
        return setErrMsg(data?.error || `Błąd (${res.status}) podczas rezerwacji. Spróbuj ponownie.`);
      }

      window.location.assign(data.redirectUrl || "/platnosc/p24/mock");
    } catch {
      setErrMsg("Wystąpił błąd sieci. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-12 px-4 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";
  const labelCls = "label text-sm font-medium text-gray-700";

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
      {errMsg && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
          {errMsg}
        </div>
      )}

      {/* Dane pacjenta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Imię i nazwisko *</label>
          <input type="text" className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Telefon *</label>
          <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>E-mail *</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Data *</label>
          <input type="date" className={inputCls} value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      {/* Godzina i typ wizyty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Godzina *</label>
          <select className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} required>
            <option value="" disabled>Wybierz godzinę (07:00–21:50)</option>
            {displaySlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Rodzaj wizyty *</label>
          <select className={inputCls} value={visitType} onChange={(e) => setVisitType(e.target.value as VisitType)} required>
            <option value="Teleporada">Teleporada — 49 zł</option>
            <option value="Wizyta domowa">Wizyta domowa — 350 zł</option>
          </select>
        </div>
      </div>

      {/* Lekarz + adres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Lekarz *</label>
          <select className={inputCls} value={doctor} onChange={(e) => setDoctor(e.target.value)} required>
            {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {visitType === "Wizyta domowa" && (
          <div>
            <label className={labelCls}>Adres wizyty domowej *</label>
            <input type="text" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
        )}
      </div>

      {/* PESEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>PESEL {noPesel ? "(pominięty)" : "*"}</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            className={`${inputCls} ${noPesel ? "bg-gray-100" : ""}`}
            value={pesel}
            onChange={(e) => setPesel(e.target.value.replace(/\D/g, "").slice(0, 11))}
            disabled={noPesel}
            required={!noPesel}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={noPesel}
              onChange={(e) => {
                setNoPesel(e.target.checked);
                if (e.target.checked) setPesel("");
              }}
            />
            Nie mam numeru PESEL
          </label>
        </div>
      </div>

      {/* Uwagi */}
      <div>
        <label className={labelCls}>Uwagi (opcjonalnie)</label>
        <textarea className={`${inputCls} min-h-[100px]`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {/* Cena + CTA */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-lg"><span className="text-gray-600">Do zapłaty:</span> <strong>{price} zł</strong></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Rezerwuję…" : visitType === "Teleporada" ? "Umów teleporadę" : "Umów wizytę domową"}
        </button>
      </div>
    </form>
  );
}
