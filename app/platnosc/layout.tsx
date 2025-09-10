// app/platnosc/layout.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function PlatnoscLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
