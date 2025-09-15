// app/platnosc/payu/return/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import PayUReturnClient from './Client';

export default function PayUReturnPage() {
  return <PayUReturnClient />;
}
