import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { customersApi } from '../services/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY_FORM = { full_name: '', email: '', phone: '' }

function CustomerForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Full Name', key: 'full_name', type: 'text' },
        { label: 'Email Address', key: 'email', type: 'email' },
        { label: 'Phone Number', key: 'phone', type: 'tel' },
      ].map(({ label, key, ...props }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            {...props}
            required
            value={form[key]}
            onChange={set(key)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => customersApi.list().then(setCustomers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    try {
      await customersApi.create(data)
      toast.success('Customer created')
      setShowAdd(false)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async () => {
    try {
      await customersApi.delete(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          + Add Customer
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-16">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Phone', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No customers yet.</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="text-red-500 hover:underline text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Add Customer" onClose={() => setShowAdd(false)}>
          <CustomerForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete customer "${deleteTarget.full_name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
