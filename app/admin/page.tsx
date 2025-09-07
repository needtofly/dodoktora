// app/admin/page.tsx
import AdminTable from '@/components/AdminTable';

export const dynamic = 'force-dynamic'; // zawsze świeże dane

export default function AdminPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <AdminTable />
    </main>
  );
}
