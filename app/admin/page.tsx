import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminTable from '@/components/AdminTable'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Admin() {
  const auth = cookies().get('admin_auth')?.value
  if (auth !== 'ok') redirect('/admin/login')

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rezerwacje</h1>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export-csv"
            className="btn"
            rel="noopener"
          >
            Eksportuj CSV
          </a>

          <form action="/api/auth/logout" method="post">
            <button className="btn">Wyloguj</button>
          </form>
        </div>
      </div>

      <AdminTable />
    </main>
  )
}
