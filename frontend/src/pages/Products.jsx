import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { productsApi } from '../services/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '' }

function ProductForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ ...form, price: parseFloat(form.price), quantity_in_stock: parseInt(form.quantity_in_stock, 10) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Product Name', key: 'name', type: 'text', required: true },
        { label: 'SKU / Code', key: 'sku', type: 'text', required: true },
        { label: 'Price ($)', key: 'price', type: 'number', step: '0.01', min: '0', required: true },
        { label: 'Quantity in Stock', key: 'quantity_in_stock', type: 'number', min: '0', required: true },
      ].map(({ label, key, ...props }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            {...props}
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

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | { product }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => productsApi.list().then(setProducts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (data) => {
    try {
      await productsApi.create(data)
      toast.success('Product created')
      setModal(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleEdit = async (data) => {
    try {
      await productsApi.update(modal.product.id, data)
      toast.success('Product updated')
      setModal(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setModal('add')}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-16">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'SKU', 'Price', 'Qty in Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet.</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.quantity_in_stock}</td>
                  <td className="px-4 py-3">
                    {p.low_stock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Low Stock</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setModal({ product: p })}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
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

      {modal === 'add' && (
        <Modal title="Add Product" onClose={() => setModal(null)}>
          <ProductForm onSubmit={handleAdd} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal?.product && (
        <Modal title="Edit Product" onClose={() => setModal(null)}>
          <ProductForm
            initial={{
              name: modal.product.name,
              sku: modal.product.sku,
              price: String(modal.product.price),
              quantity_in_stock: String(modal.product.quantity_in_stock),
            }}
            onSubmit={handleEdit}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
