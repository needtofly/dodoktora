"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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

// YYYY-MM-DD dla lokalnego czasu (bez UTC/ISO)
function localDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Zamiana lokalnych date+time na ISO (UTC) poprawnie liczone z lokalnej strefy
function localDateTimeToISO(dateStr: string, timeStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const local = new Date(y, mo - 1, d, hh, mm, 0, 0);
  return local.toISOString();
}

export default function BookingForm() {
  const sp = useSearchParams();

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

  // Nowe rozbite pola adresu (wymagane dla wizyty domowej)
  const [addressLine1, setAddressLine1] = useState(""); // ulica i numer
  const [postalCode, setPostalCode] = useState(""); // 00-000
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  // Modal wyboru godziny
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const today = new Date();
  const todayStr = localDateStr(today);

  const price = useMemo(() => (visitType === "Teleporada" ? 49 : 350), [visitType]);

  // Pobieranie zajętych slotów
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

  // Lista slotów do pokazania (bez przeszłości; zajęte pokażemy jako disabled)
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
    return slots;
  }, [date, today, todayStr]);

  useEffect(() => {
    if (urlType === "Wizyta domowa" || urlType === "Teleporada") {
      setVisitType(urlType as VisitType);
    }
    if (urlDoctor) setDoctor(urlDoctor);
  }, [urlType, urlDoctor]);

  const isValidSelectedDateTime = () => {
    if (!date || !time) return false;
    const [y, mo, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const local = new Date(y, mo - 1, d, hh, mm, 0, 0); // lokalny czas
    return local.getTime() > Date.now();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg("");

    if (!date) return setErrMsg("Wybierz datę.");
    if (!time) return setErrMsg("Wybierz godzinę.");
    if (!isValidSelectedDateTime()) return setErrMsg("Nie można rezerwować terminu w przeszłości.");

    if (visitType === "Wizyta domowa") {
      if (!addressLine1.trim()) return setErrMsg("Podaj ulicę i numer.");
      if (!/^\d{2}-\d{3}$/.test(postalCode)) return setErrMsg("Podaj kod pocztowy w formacie 00-000.");
      if (!city.trim()) return setErrMsg("Podaj miasto.");
    }

    if (!noPesel) {
      if (!/^\d{11}$/.test(pesel)) {
        return setErrMsg("PESEL musi składać się z 11 cyfr.");
      }
    }

    if (loading) return;
    setLoading(true);

    try {
      // ISO liczone z lokalnego czasu -> serwer zapisze UTC, ale odpowiadające lokalnie wybranej godzinie
      const iso = localDateTimeToISO(date, time);

      // Złożony adres (legacy) – dla zgodności z backendem
      const addressCombined =
        visitType === "Wizyta domowa"
          ? `${addressLine1.trim()}, ${postalCode.trim()} ${city.trim()}`
          : undefined;

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
          // adres – nowe rozbite pola
          addressLine1: visitType === "Wizyta domowa" ? addressLine1.trim() : undefined,
          postalCode: visitType === "Wizyta domowa" ? postalCode.trim() : undefined,
          city: visitType === "Wizyta domowa" ? city.trim() : undefined,
          // legacy fallback
          address: addressCombined,
          // pesel
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
  const btnCls =
    "px-4 h-12 inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:bg-blue-50 focus:ring-2 focus:ring-blue-500/40";

  // zamknij modal ESC
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setTimePickerOpen(false);
  }, []);
  useEffect(() => {
    if (!timePickerOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timePickerOpen, onKeyDown]);

  return (
    <>
      {/* MODAL WYBORU GODZINY */}
      {timePickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Wybór godziny"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setTimePickerOpen(false)} />
          <div className="relative z-10 w-[min(900px,94vw)] max-h-[86vh] overflow-auto rounded-2xl bg-white shadow-xl border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Wybierz godzinę {date ? `— ${date}` : ""}</h3>
              <button className={btnCls} onClick={() => setTimePickerOpen(false)}>Zamknij</button>
            </div>

            {!date ? (
              <div className="p-4 text-sm text-gray-600">Najpierw wybierz datę w formularzu.</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {displaySlots.map((t) => {
                  const isTaken = takenSlots.includes(t);
                  const isSelected = time === t;
                  return (
                    <button
                      type="button"
                      key={t}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (isTaken) return;
                        setTime(t);
                        setErrMsg("");
                        setTimePickerOpen(false);
                      }}
                      className={[
                        "h-10 rounded-lg border text-sm",
                        isTaken
                          ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-blue-50 border-gray-300",
                      ].join(" ")}
                      title={isTaken ? "Termin zajęty" : "Dostępny termin"}
                      disabled={isTaken}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORMULARZ */}
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-8">
        {errMsg && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
            {errMsg}
          </div>
        )}

        {/* Sekcja: Dane pacjenta */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Dane pacjenta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Imię i nazwisko *</label>
              <input type="text" className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Telefon *</label>
              <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>E-mail *</label>
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Data *</label>
                <input type="date" className={inputCls} value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Godzina *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`${inputCls} bg-gray-50`}
                    value={time || ""}
                    placeholder="Nie wybrano"
                    readOnly
                  />
                  <button
                    type="button"
                    className={btnCls}
                    onClick={() => setTimePickerOpen(true)}
                    disabled={!date}
                    title={date ? "Wybierz godzinę" : "Najpierw wybierz datę"}
                  >
                    Wybierz godzinę
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sekcja: Szczegóły wizyty */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Szczegóły wizyty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Rodzaj wizyty *</label>
              <select className={inputCls} value={visitType} onChange={(e) => setVisitType(e.target.value as VisitType)} required>
                <option value="Teleporada">Teleporada — 49 zł</option>
                <option value="Wizyta domowa">Wizyta domowa — 350 zł</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Lekarz *</label>
              <select className={inputCls} value={doctor} onChange={(e) => setDoctor(e.target.value)} required>
                {DOCTORS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adres wizyty domowej – tylko przy wizycie domowej */}
          {visitType === "Wizyta domowa" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Ulica i numer *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Kod pocztowy *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{2}-\d{3}"
                  placeholder="00-000"
                  className={inputCls}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelCls}>Miasto *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </section>

        {/* Dół: po lewej cena + CTA, po prawej PESEL */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
          <div className="flex items-center justify-between">
            <div className="text-lg">
              <span className="text-gray-600">Do zapłaty:</span> <strong>{price} zł</strong>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Rezerwuję…" : visitType === "Teleporada" ? "Umów teleporadę" : "Umów wizytę domową"}
            </button>
          </div>

          {/* 🔽 PRAWY DOLNY RÓG: PESEL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
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
        </section>
      </form>
    </>
  );
}
