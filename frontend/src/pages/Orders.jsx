import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ordersApi, customersApi, productsApi } from '../services/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

function CreateOrderModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([customersApi.list(), productsApi.list()]).then(([c, p]) => {
      setCustomers(c)
      setProducts(p)
    })
  }, [])

  const addItem = () => setItems((prev) => [...prev, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const setItem = (i, key, val) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)))

  const getStock = (productId) => products.find((p) => p.id === parseInt(productId))?.quantity_in_stock ?? '—'
  const getPrice = (productId) => products.find((p) => p.id === parseInt(productId))?.price ?? 0

  const estimatedTotal = items.reduce((sum, item) => {
    if (!item.product_id || !item.quantity) return sum
    return sum + getPrice(item.product_id) * parseInt(item.quantity || 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId) return toast.error('Select a customer')
    const validItems = items.filter((it) => it.product_id && parseInt(it.quantity) > 0)
    if (validItems.length === 0) return toast.error('Add at least one item')
    setSubmitting(true)
    try {
      await ordersApi.create({
        customer_id: parseInt(customerId),
        items: validItems.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
      })
      toast.success('Order created')
      onCreated()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
        <select
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Order Items</label>
          <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:underline font-medium">
            + Add Item
          </button>
        </div>
        {items.map((item, i) => {
          const stock = getStock(item.product_id)
          return (
            <div key={i} className="flex gap-2 items-start">
              <select
                required
                value={item.product_id}
                onChange={(e) => setItem(i, 'product_id', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price.toFixed(2)}) — stock: {p.quantity_in_stock}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max={item.product_id ? stock : undefined}
                required
                value={item.quantity}
                onChange={(e) => setItem(i, 'quantity', e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none pt-1.5"
                >
                  &times;
                </button>
              )}
            </div>
          )
        })}
      </div>

      {estimatedTotal > 0 && (
        <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          Estimated Total: ${estimatedTotal.toFixed(2)}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Placing…' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    ordersApi.get(orderId).then(setOrder)
  }, [orderId])

  if (!order) return (
    <Modal title="Order Detail" onClose={onClose}>
      <div className="text-gray-400 text-center py-8">Loading…</div>
    </Modal>
  )

  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3 text-gray-600">
          <div><span className="font-medium text-gray-800">Customer:</span> {order.customer_name}</div>
          <div><span className="font-medium text-gray-800">Email:</span> {order.customer_email}</div>
          <div><span className="font-medium text-gray-800">Date:</span> {new Date(order.created_at).toLocaleString()}</div>
          <div><span className="font-medium text-gray-800">Total:</span> ${order.total_amount.toFixed(2)}</div>
        </div>
        <table className="min-w-full divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'Unit Price', 'Qty', 'Subtotal'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2">{item.product_name}</td>
                <td className="px-3 py-2">${item.unit_price.toFixed(2)}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2 font-medium">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => ordersApi.list().then(setOrders).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try {
      await ordersApi.delete(deleteTarget.id)
      toast.success('Order cancelled')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          + Create Order
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-16">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders yet.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailId(o.id)}>
                  <td className="px-4 py-3 font-mono text-indigo-600">#{o.id}</td>
                  <td className="px-4 py-3 font-medium">{o.customer_name}</td>
                  <td className="px-4 py-3 text-gray-500">{o.item_count} item{o.item_count !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-semibold">${o.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDeleteTarget(o)}
                      className="text-red-500 hover:underline text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Create Order" onClose={() => setShowCreate(false)}>
          <CreateOrderModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); load() }}
          />
        </Modal>
      )}

      {detailId && <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          message={`Cancel order #${deleteTarget.id}? Stock will be restored.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
