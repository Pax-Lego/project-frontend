import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlanHistory } from '../../api/plans'
import { getProfile } from '../../api/profile'
import { BarChart3, Flame, Beef, Wheat, Droplets, CalendarCheck } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'

const RANGES = [
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

function SummaryCard({ icon: Icon, label, value, goal, unit, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      {goal != null && (
        <p className="text-xs text-gray-400 mt-1">goal {goal}{unit}</p>
      )}
    </div>
  )
}

function average(entries, key) {
  if (entries.length === 0) return 0
  return entries.reduce((sum, e) => sum + (e[key] || 0), 0) / entries.length
}

export default function ReportsPage() {
  const [days, setDays]       = useState(30)
  const [history, setHistory] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [historyRes, profRes] = await Promise.all([
          getPlanHistory(days),
          getProfile(),
        ])
        setHistory(historyRes.data || [])
        const p = Array.isArray(profRes.data) ? profRes.data[0] : profRes.data
        setProfile(p)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  const macros = profile?.recommended_macros
  const chartData = history.map(e => ({
    date: e.date,
    calories: e.total_calories,
    protein: e.total_protein,
    carbs: e.total_carbs,
    fat: e.total_fat,
  }))

  const avgCalories = average(history, 'total_calories')
  const avgProtein  = average(history, 'total_protein')
  const avgCarbs    = average(history, 'total_carbs')
  const avgFat      = average(history, 'total_fat')

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your nutrition trends over time</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition
                ${days === r.days
                  ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-3">
          <BarChart3 size={32} className="mx-auto text-gray-200 dark:text-gray-700" />
          <p className="text-sm text-gray-400">No logged days in this range yet.</p>
          <Link to="/plans" className="text-xs text-brand-500 hover:text-brand-600 font-medium">Go to Plans to start logging →</Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <SummaryCard icon={CalendarCheck} label="Days logged"  value={history.length}          unit={`/ ${days}`} color="bg-purple-50 dark:bg-purple-900/20 text-purple-500" />
            <SummaryCard icon={Flame}  label="Avg calories" value={avgCalories.toFixed(0)} goal={macros?.calories?.toFixed(0)}  unit="kcal" color="bg-orange-50 dark:bg-orange-900/20 text-orange-500" />
            <SummaryCard icon={Beef}   label="Avg protein"  value={avgProtein.toFixed(1)}  goal={macros?.protein_g?.toFixed(1)} unit="g"    color="bg-blue-50 dark:bg-blue-900/20 text-blue-500" />
            <SummaryCard icon={Wheat}  label="Avg carbs"    value={avgCarbs.toFixed(1)}    goal={macros?.carbs_g?.toFixed(1)}   unit="g"    color="bg-amber-50 dark:bg-amber-900/20 text-amber-500" />
            <SummaryCard icon={Droplets} label="Avg fat"    value={avgFat.toFixed(1)}      goal={macros?.fat_g?.toFixed(1)}     unit="g"    color="bg-rose-50 dark:bg-rose-900/20 text-rose-500" />
          </div>

          {!macros && (
            <p className="text-xs text-gray-400 text-center">
              Set your goal in <Link to="/profile" className="text-brand-500 hover:text-brand-600 font-medium">Profile</Link> to compare against targets.
            </p>
          )}

          {/* Calories chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Calories per day</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v) => [`${Number(v).toFixed(0)} kcal`, 'Calories']}
                  />
                  {macros?.calories && (
                    <ReferenceLine y={macros.calories} stroke="#f97316" strokeDasharray="4 4"
                      label={{ value: 'Goal', position: 'right', fontSize: 11, fill: '#f97316' }} />
                  )}
                  <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macros trend */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Macros per day</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v, name) => [`${Number(v).toFixed(1)}g`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="protein" name="Protein" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="carbs"   name="Carbs"   stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="fat"     name="Fat"     stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
