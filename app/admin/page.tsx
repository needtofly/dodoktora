// app/admin/page.tsx
export const dynamic = 'force-dynamic';
import AdminTable from '@/components/AdminTable';

export default function AdminPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <AdminTable />
    </main>
  );
}