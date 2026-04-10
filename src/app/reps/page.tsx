'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Rep {
  id: string
  full_name: string
  email: string
  created_at: string
}

export default function RepsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reps, setReps] = useState<Rep[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ full_name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
        return
      }
      setLoading(false)
      fetchReps()
    }

    async function fetchReps() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rep')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching reps:', error)
        return
      }
      setReps(data || [])
    }

    checkAuth()
  }, [router])

  async function handleAddRep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from('profiles').insert([{ ...formData, role: 'rep' }])

    setSubmitting(false)

    if (error) {
      console.error('Error adding rep:', error)
      return
    }

    setFormData({ full_name: '', email: '' })
    setShowModal(false)

    // Refresh reps
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'rep')
      .order('created_at', { ascending: false })
    setReps(data || [])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-700">
        <div className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          جاري التحقق من الجلسة...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-8">
        <aside className="hidden w-72 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200 md:block">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Pharma Tracker</p>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">مرحبا بك</h1>
          </div>

          <nav className="space-y-3">
            <a href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              لوحة القيادة
            </a>
            <a href="/clinics" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              العيادات
            </a>
            <a href="/reps" className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              المندوبون
            </a>
            <a href="/visits" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              الزيارات
            </a>
            <a href="/reports" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              التقارير
            </a>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm shadow-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">المندوبون</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">إدارة المندوبين</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                إضافة مندوب جديد
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-200 text-right">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">الاسم الكامل</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => (
                  <tr key={rep.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-900">{rep.full_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{rep.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(rep.created_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reps.length === 0 && (
              <p className="mt-6 text-center text-sm text-slate-500">لا يوجد مندوبون مسجلون بعد.</p>
            )}
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-6 text-xl font-semibold text-slate-900">إضافة مندوب جديد</h3>
                <form onSubmit={handleAddRep} className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    الاسم الكامل
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    البريد الإلكتروني
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {submitting ? 'جاري الإضافة...' : 'إضافة'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
