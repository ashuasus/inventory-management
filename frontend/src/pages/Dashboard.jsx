import { useState, useEffect } from 'react'
import { dashboardApi } from '../services/api'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500 text-center py-16">Loading dashboard…</div>
  if (!stats) return <div className="text-red-500 text-center py-16">Failed to load dashboard.</div>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats.total_products} accent="indigo" />
        <StatCard label="Total Customers" value={stats.total_customers} accent="green" />
        <StatCard label="Total Orders" value={stats.total_orders} accent="blue" />
        <StatCard label="Low Stock Items" value={stats.low_stock_count} warn={stats.low_stock_count > 0} />
      </div>

      {stats.low_stock_products.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Low Stock Alert</h2>
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-red-50">
                <tr>
                  {['Product', 'SKU', 'Price', 'Qty in Stock'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-red-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id} className="hover:bg-red-50/40">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {p.quantity_in_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-700 text-sm font-medium">
          All products are well stocked.
        </div>
      )}
    </div>
  )
}
