// components/CookieConsent.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Consents = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type LogEntry = {
  type: "consent_update";
  at: string;            // ISO
  source: string;        // np. banner_accept_all / settings_save / necessary_only
  consents: Consents;
  href: string;
  referer: string;
  ua: string;
  version: string;       // wersja tekstu / banera
};

const COOKIE_NAME = "cookie_consent_v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 rok
const CONSENT_VERSION = "v1"; // podbijaj przy zmianach tekstu/zakresów

function readConsent(): Consents | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (!m) return null;
    const json = decodeURIComponent(m[1]);
    const obj = JSON.parse(json);
    if (
      typeof obj?.necessary === "boolean" &&
      typeof obj?.analytics === "boolean" &&
      typeof obj?.marketing === "boolean"
    ) {
      return { necessary: true, analytics: !!obj.analytics, marketing: !!obj.marketing };
    }
    return null;
  } catch {
    return null;
  }
}

function writeConsent(c: Consents) {
  const payload = encodeURIComponent(JSON.stringify({ ...c, ts: Date.now(), version: CONSENT_VERSION }));
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${payload}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function updateGtagConsent(c: Consents) {
  const granted = (b: boolean) => (b ? "granted" : "denied");
  // @ts-ignore
  window.gtag?.("consent", "update", {
    analytics_storage: granted(c.analytics),
    ad_storage: granted(c.marketing),
    ad_user_data: granted(c.marketing),
    ad_personalization: granted(c.marketing),
    functionality_storage: "granted",
    security_storage: "granted",
  });
}

function logLocalAndBeacon(entry: LogEntry) {
  try {
    const key = "cookie_consent_log";
    const arr: LogEntry[] = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push(entry);
    if (arr.length > 200) arr.splice(0, arr.length - 200); // max 200 wpisów
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}

  try {
    const data = JSON.stringify(entry);
    const blob = new Blob([data], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/privacy/consent-log", blob);
    } else {
      fetch("/api/privacy/consent-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

function gtagEvent(consents: Consents, source: string) {
  // @ts-ignore
  window.gtag?.("event", "cookie_consent_update", {
    event_category: "consent",
    event_label: source,
    consent_version: CONSENT_VERSION,
    analytics: consents.analytics ? 1 : 0,
    marketing: consents.marketing ? 1 : 0,
    non_interaction: true,
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // domyślnie tylko niezbędne
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // globalne helpery — zawsze dostępne
  useEffect(() => {
    (window as any).__openCookieSettings = () => {
      const curr = readConsent();
      setAnalytics(!!curr?.analytics);
      setMarketing(!!curr?.marketing);
      setSettingsOpen(true);
      setVisible(false);
    };
    (window as any).__resetCookieConsent = () => {
      document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
      setSettingsOpen(false);
      setVisible(true);
    };
  }, []);

  // pokaż baner jeśli brak decyzji lub wymuszenie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force =
      params.get("cookies") === "show" ||
      (process.env.NEXT_PUBLIC_FORCE_COOKIE_BANNER || "") === "1";

    const stored = readConsent();
    if (force || !stored) {
      setVisible(true);
    } else {
      updateGtagConsent({ necessary: true, analytics: stored.analytics, marketing: stored.marketing });
    }
  }, []);

  function finalize(consents: Consents, source: string) {
    writeConsent(consents);
    updateGtagConsent(consents);
    gtagEvent(consents, source);

    const entry: LogEntry = {
      type: "consent_update",
      at: new Date().toISOString(),
      source,
      consents,
      href: location.href,
      referer: document.referrer || "",
      ua: navigator.userAgent,
      version: CONSENT_VERSION,
    };
    logLocalAndBeacon(entry);

    setVisible(false);
    setSettingsOpen(false);
    window.dispatchEvent(new CustomEvent("consentchange", { detail: consents }));
  }

  const onSave = (all = false, source = "settings_save") => {
    const consents: Consents = all
      ? { necessary: true, analytics: true, marketing: true }
      : { necessary: true, analytics, marketing };

    finalize(consents, source);
  };

  const body = useMemo(
    () => (
      <p className="text-sm text-gray-700">
        Używamy plików cookie w celach niezbędnych do działania serwisu oraz – za Twoją zgodą –
        analitycznych i marketingowych. Możesz zaakceptować wszystkie, wybrać ustawienia lub
        odmówić zgody na dodatkowe kategorie. Szczegóły w{" "}
        <a
          href="/polityka-prywatnosci"
          className="underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          Polityce prywatności
        </a>
        .
      </p>
    ),
    []
  );

  return (
    <>
      {/* BANER */}
      {visible && !settingsOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[1000] flex justify-center px-4 pb-4">
          <div className="w-full max-w-4xl rounded-2xl border shadow-lg bg-white p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <div className="flex-1">{body}</div>
              <div className="mt-3 md:mt-0 flex gap-2 shrink-0">
                <button
                  className="px-4 h-10 rounded-xl border border-gray-300 hover:bg-gray-50"
                  onClick={() =>
                    finalize({ necessary: true, analytics: false, marketing: false }, "banner_necessary_only")
                  }
                >
                  Tylko niezbędne
                </button>
                <button
                  className="px-4 h-10 rounded-xl border border-blue-600 bg-white text-blue-700 hover:bg-blue-50"
                  onClick={() => setSettingsOpen(true)}
                >
                  Ustawienia
                </button>
                <button
                  className="px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => onSave(true, "banner_accept_all")}
                >
                  Akceptuję wszystkie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USTAWIEŃ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border w-[min(640px,94vw)] p-5">
            <h3 className="text-xl font-semibold mb-3">Ustawienia plików cookie</h3>
            {body}

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <input type="checkbox" checked readOnly className="mt-1" />
                <div>
                  <div className="font-medium">Niezbędne</div>
                  <div className="text-sm text-gray-600">
                    Te pliki są konieczne do prawidłowego działania serwisu i nie mogą być wyłączone.
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <div>
                  <div className="font-medium">Analityczne</div>
                  <div className="text-sm text-gray-600">
                    Pomagają nam analizować ruch i ulepszać serwis (np. Google Analytics).
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <div>
                  <div className="font-medium">Marketingowe</div>
                  <div className="text-sm text-gray-600">
                    Umożliwiają personalizację reklam i mierzenie skuteczności kampanii.
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button className="px-4 h-10 rounded-xl border border-gray-300" onClick={() => setSettingsOpen(false)}>
                Anuluj
              </button>
              <button
                className="px-4 h-10 rounded-xl border border-blue-600 text-blue-700 bg-white hover:bg-blue-50"
                onClick={() => onSave(false, "settings_save")}
              >
                Zapisz wybór
              </button>
              <button
                className="px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => onSave(true, "settings_accept_all")}
              >
                Akceptuję wszystkie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
