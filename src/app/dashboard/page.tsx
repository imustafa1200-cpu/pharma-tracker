'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const navItems = [
  { label: 'لوحة القيادة', href: '/dashboard' },
  { label: 'العيادات', href: '/clinics' },
  { label: 'المندوبون', href: '/reps' },
  { label: 'الزيارات', href: '/visits' },
  { label: 'التقارير', href: '/reports' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
        return
      }
      setUser(data.session.user)
      setLoading(false)
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
            <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  item.href === '/dashboard'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm shadow-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">لوحة القيادة</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">نظرة عامة سريعة</h2>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                مرحباً بعودتك
              </div>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <p className="text-sm font-medium text-slate-500">إجمالي العيادات</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">42</p>
            </article>

            <article className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <p className="text-sm font-medium text-slate-500">إجمالي المندوبون</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">18</p>
            </article>

            <article className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <p className="text-sm font-medium text-slate-500">الزيارات اليوم</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">26</p>
            </article>

            <article className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
              <p className="text-sm font-medium text-slate-500">إجمالي الزيارات</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">1,204</p>
            </article>
          </section>

          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">آخر الأنشطة</h3>
            <p className="mt-3 text-sm text-slate-600">يمكنك إضافة المزيد من المحتوى هنا لتزويد المستخدم بتقرير مفصل عن العيادات والمندوبين والزيارات.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
