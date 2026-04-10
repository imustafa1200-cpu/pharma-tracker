'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Visit {
  id: string
  rep_id: string
  clinic_id: string
  visit_date: string
  rep_name?: string
  clinic_name?: string
}

interface RepStats {
  rep_name: string
  count: number
}

interface ClinicStats {
  clinic_name: string
  count: number
}

interface MonthStats {
  month: string
  count: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [repStats, setRepStats] = useState<RepStats[]>([])
  const [clinicStats, setClinicStats] = useState<ClinicStats[]>([])
  const [monthStats, setMonthStats] = useState<MonthStats[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
        return
      }
      setLoading(false)
      fetchReports()
    }

    async function fetchReports() {
      const { data: visitsData, error } = await supabase
        .from('visits')
        .select(`
          *,
          profiles!visits_rep_id_fkey (full_name),
          clinics!visits_clinic_id_fkey (name)
        `)

      if (error) {
        console.error('Error fetching visits:', error)
        return
      }

      const visits = visitsData?.map((visit: any) => ({
        ...visit,
        rep_name: visit.profiles?.full_name,
        clinic_name: visit.clinics?.name,
      })) || []

      // Calculate rep stats
      const repMap = new Map<string, number>()
      visits.forEach((visit) => {
        const name = visit.rep_name || 'غير محدد'
        repMap.set(name, (repMap.get(name) || 0) + 1)
      })
      const repStatsData = Array.from(repMap.entries()).map(([rep_name, count]) => ({
        rep_name,
        count,
      }))
      setRepStats(repStatsData)

      // Calculate clinic stats
      const clinicMap = new Map<string, number>()
      visits.forEach((visit) => {
        const name = visit.clinic_name || 'غير محدد'
        clinicMap.set(name, (clinicMap.get(name) || 0) + 1)
      })
      const clinicStatsData = Array.from(clinicMap.entries()).map(([clinic_name, count]) => ({
        clinic_name,
        count,
      }))
      setClinicStats(clinicStatsData)

      // Calculate month stats
      const monthMap = new Map<string, number>()
      visits.forEach((visit) => {
        const date = new Date(visit.visit_date)
        const month = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
        monthMap.set(month, (monthMap.get(month) || 0) + 1)
      })
      const monthStatsData = Array.from(monthMap.entries()).map(([month, count]) => ({
        month,
        count,
      }))
      setMonthStats(monthStatsData)
    }

    checkAuth()
  }, [router])

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
            <a href="/visits" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              الزيارات
            </a>
            <a href="/reports" className="block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              التقارير
            </a>
          </nav>
        </aside>

        <main className="flex-1 space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm shadow-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">التقارير</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">تقارير الزيارات</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <h3 className="mb-4 text-xl font-semibold text-slate-900">الزيارات حسب المندوب</h3>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-slate-200 text-right">
                    <th className="px-4 py-2 text-sm font-semibold text-slate-700">المندوب</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-700">عدد الزيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {repStats.map((stat, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-sm text-slate-900">{stat.rep_name}</td>
                      <td className="px-4 py-2 text-sm text-slate-900">{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {repStats.length === 0 && (
                <p className="mt-4 text-center text-sm text-slate-500">لا توجد بيانات.</p>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <h3 className="mb-4 text-xl font-semibold text-slate-900">الزيارات حسب العيادة</h3>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-slate-200 text-right">
                    <th className="px-4 py-2 text-sm font-semibold text-slate-700">العيادة</th>
                    <th className="px-4 py-2 text-sm font-semibold text-slate-700">عدد الزيارات</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicStats.map((stat, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-sm text-slate-900">{stat.clinic_name}</td>
                      <td className="px-4 py-2 text-sm text-slate-900">{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clinicStats.length === 0 && (
                <p className="mt-4 text-center text-sm text-slate-500">لا توجد بيانات.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <h3 className="mb-4 text-xl font-semibold text-slate-900">الزيارات حسب الشهر</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-200 text-right">
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">الشهر</th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">عدد الزيارات</th>
                </tr>
              </thead>
              <tbody>
                {monthStats.map((stat, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-2 text-sm text-slate-900">{stat.month}</td>
                    <td className="px-4 py-2 text-sm text-slate-900">{stat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {monthStats.length === 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">لا توجد بيانات.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
