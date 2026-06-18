import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold tracking-tight">InventoryPro</span>
          <nav className="flex gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-900 text-white' : 'text-indigo-100 hover:bg-indigo-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
