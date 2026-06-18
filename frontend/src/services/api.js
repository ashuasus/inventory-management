import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      (Array.isArray(err.response?.data?.detail)
        ? err.response.data.detail.map((e) => e.msg).join(', ')
        : null) ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  }
)

export const productsApi = {
  list: () => client.get('/products').then((r) => r.data),
  get: (id) => client.get(`/products/${id}`).then((r) => r.data),
  create: (data) => client.post('/products', data).then((r) => r.data),
  update: (id, data) => client.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => client.delete(`/products/${id}`),
}

export const customersApi = {
  list: () => client.get('/customers').then((r) => r.data),
  get: (id) => client.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => client.post('/customers', data).then((r) => r.data),
  delete: (id) => client.delete(`/customers/${id}`),
}

export const ordersApi = {
  list: () => client.get('/orders').then((r) => r.data),
  get: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => client.post('/orders', data).then((r) => r.data),
  delete: (id) => client.delete(`/orders/${id}`),
}

export const dashboardApi = {
  stats: () => client.get('/dashboard').then((r) => r.data),
}
