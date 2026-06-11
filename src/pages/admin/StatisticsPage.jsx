import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi } from '../../apis/apis'
import { getApiData, formatDate } from '../../utils/helpers'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../constants/roles'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Select from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import ErrorState from '../../components/ui/ErrorState'

export default function StatisticsPage() {
  const { role } = useAuth()
  const [top, setTop] = useState(10)

  if (!isAdmin(role)) return <Navigate to="/admin/dashboard" replace />

  const { data: overviewRes, isLoading: loadingOverview, isError: errorOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => statsApi.getOverview(),
  })

  const { data: overdueRes, isLoading: loadingOverdue } = useQuery({
    queryKey: ['stats', 'overdue'],
    queryFn: () => statsApi.getOverdue(),
  })

  const { data: topBooksRes, isLoading: loadingTop } = useQuery({
    queryKey: ['stats', 'top-books', top],
    queryFn: () => statsApi.getTopBooks({ top }),
  })

  // OverviewStatsResponse: { totalBooks, totalUsers, totalBorrowRecords, totalOverdueRecords }
  const overview = getApiData(overviewRes) ?? {}
  // OverdueBorrowResponse: { borrowId, readerName, dueDate, overdueDays }
  const overdueList = getApiData(overdueRes) ?? []
  // TopBookResponse: { bookId, title, borrowCount }
  const topBooks = getApiData(topBooksRes) ?? []

  const cards = [
    { label: 'Tổng sách', value: overview.totalBooks, icon: '📚', color: 'border-l-blue-500' },
    { label: 'Tổng bạn đọc', value: overview.totalUsers, icon: '👥', color: 'border-l-purple-500' },
    { label: 'Tổng phiếu mượn', value: overview.totalBorrowRecords, icon: '📋', color: 'border-l-amber-500' },
    { label: 'Phiếu quá hạn', value: overview.totalOverdueRecords, icon: '⚠️', color: 'border-l-red-500' },
  ]

  if (errorOverview) return <ErrorState onRetry={refetchOverview} />

  return (
    <div>
      <Breadcrumb items={[{ label: 'Thống kê' }]} />
      <h1 className="text-2xl font-bold text-slate-900">Thống kê</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${c.color}`}>
            {loadingOverview ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{c.label}</span>
                  <span className="text-2xl">{c.icon}</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{c.value ?? 0}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Phiếu quá hạn</h2>
          {loadingOverdue ? (
            <Skeleton className="mt-4 h-48 w-full" />
          ) : overdueList.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Không có phiếu quá hạn.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-slate-500">
                  <tr>
                    <th className="py-2">ID</th>
                    <th className="py-2">Bạn đọc</th>
                    <th className="py-2">Hạn trả</th>
                    <th className="py-2">Quá hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* OverdueBorrowResponse: { borrowId, readerName, dueDate, overdueDays } */}
                  {overdueList.map((r) => (
                    <tr key={r.borrowId} className={r.overdueDays > 14 ? 'bg-red-50' : ''}>
                      <td className="py-2">{r.borrowId}</td>
                      <td className="py-2">{r.readerName}</td>
                      <td className="py-2">{formatDate(r.dueDate)}</td>
                      <td className="py-2 font-medium text-red-600">{r.overdueDays} ngày</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sách được mượn nhiều</h2>
            <Select value={top} onChange={(e) => setTop(Number(e.target.value))} className="w-24">
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </Select>
          </div>
          {loadingTop ? (
            <Skeleton className="mt-4 h-64 w-full" />
          ) : (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBooks} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="title" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="borrowCount" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <table className="mt-4 w-full text-sm">
                <thead className="border-b text-left text-slate-500">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">Tên sách</th>
                    <th className="py-2">Lượt mượn</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* TopBookResponse: { bookId, title, borrowCount } */}
                  {topBooks.map((b, i) => (
                    <tr key={b.bookId}>
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2">{b.title}</td>
                      <td className="py-2">{b.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}