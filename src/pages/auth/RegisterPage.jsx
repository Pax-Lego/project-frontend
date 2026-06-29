import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function RegisterPage() {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      setError(Object.values(data || {}).flat().join(' ') || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        placeholder={placeholder}
        required
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Calorie <span className="text-brand-500">Tracker</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-5">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {field('username', 'Username', 'text', 'your username')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '••••••••')}
          {field('password_confirm', 'Confirm password', 'password', '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}