// components/CookieSettingsLink.tsx
"use client";

export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => (window as any).__openCookieSettings?.()}
    >
      Ustawienia cookies
    </button>
  );
}
