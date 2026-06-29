import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Apple, UtensilsCrossed,
  CalendarDays, User, LogOut, Sun, Moon
} from 'lucide-react'

const links = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/ingredients', label: 'Ingredients', icon: Apple },
  { to: '/recipes',     label: 'Recipes',     icon: UtensilsCrossed },
  { to: '/plans',       label: 'Plans',       icon: CalendarDays },
  { to: '/profile',     label: 'Profile',     icon: User },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-10">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-lg font-semibold tracking-tight">
          Calorie <span className="text-brand-500">Tracker</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-600 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <div className="px-3 py-2 text-xs text-gray-400 truncate">{user?.email}</div>
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}