'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Visit {
  id: string
  rep_id: string
  clinic_id: string
  visit_date: string
  notes: string
  rep_name?: string
  clinic_name?: string
}

interface Clinic {
  id: string
  name: string
}

interface Rep {
  id: string
  full_name: string
}

export default function VisitsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [visits, setVisits] = useState<Visit[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [reps, setReps] = useState<Rep[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ rep_id: '', clinic_id: '', visit_date: '', notes: '' })
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
      fetchData()
    }

    async function fetchData() {
      // Fetch visits with joins
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          *,
          profiles!visits_rep_id_fkey (full_name),
          clinics!visits_clinic_id_fkey (name)
        `)
        .order('visit_date', { ascending: false })

      if (visitsError) {
        console.error('Error fetching visits:', visitsError)
        return
      }

      const formattedVisits = visitsData?.map((visit: any) => ({
        ...visit,
        rep_name: visit.profiles?.full_name,
        clinic_name: visit.clinics?.name,
      })) || []

      setVisits(formattedVisits)

      // Fetch clinics and reps for dropdowns
      const { data: clinicsData } = await supabase.from('clinics').select('id, name')
      setClinics(clinicsData || [])

      const { data: repsData } = await supabase.from('profiles').select('id, full_name').eq('role', 'rep')
      setReps(repsData || [])
    }

    checkAuth()
  }, [router])

  async function handleAddVisit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from('visits').insert([formData])

    setSubmitting(false)

    if (error) {
      console.error('Error adding visit:', error)
      return
    }

    setFormData({ rep_id: '', clinic_id: '', visit_date: '', notes: '' })
    setShowModal(false)

    // Refresh visits
    const { data: visitsData } = await supabase
      .from('visits')
      .select(`
        *,
        profiles!visits_rep_id_fkey (full_name),
        clinics!visits_clinic_id_fkey (name)
      `)
      .order('visit_date', { ascending: false })

    const formattedVisits = visitsData?.map((visit: any) => ({
      ...visit,
      rep_name: visit.profiles?.full_name,
      clinic_name: visit.clinics?.name,
    })) || []

    setVisits(formattedVisits)
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
            <a href="/reps" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              المندوبون
            </a>
            <a href="/visits" className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
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
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">الزيارات</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">إدارة الزيارات</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                إضافة زيارة جديدة
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-200 text-right">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">اسم المندوب</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">اسم العيادة</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">تاريخ الزيارة</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-900">{visit.rep_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{visit.clinic_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(visit.visit_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{visit.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visits.length === 0 && (
              <p className="mt-6 text-center text-sm text-slate-500">لا توجد زيارات مسجلة بعد.</p>
            )}
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-6 text-xl font-semibold text-slate-900">إضافة زيارة جديدة</h3>
                <form onSubmit={handleAddVisit} className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    المندوب
                    <select
                      value={formData.rep_id}
                      onChange={(e) => setFormData({ ...formData, rep_id: e.target.value })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">اختر مندوب</option>
                      {reps.map((rep) => (
                        <option key={rep.id} value={rep.id}>
                          {rep.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    العيادة
                    <select
                      value={formData.clinic_id}
                      onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">اختر عيادة</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    تاريخ الزيارة
                    <input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    الملاحظات
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
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
