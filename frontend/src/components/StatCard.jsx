export default function StatCard({ label, value, accent = 'indigo', warn = false }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  const cls = warn ? colors.red : (colors[accent] || colors.indigo)

  return (
    <div className={`rounded-xl border p-6 ${cls}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-4xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  )
}
