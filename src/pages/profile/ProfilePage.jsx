import { useState, useEffect } from 'react'
import { getProfile, updateProfile, getWeightHistory, addWeight } from '../../api/profile'
import { User, Scale, Flame, Target, Plus, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const ACTIVITY_LABELS = {
  sedentary:   'Sedentary (little or no exercise)',
  light:       'Light (1–3 days/week)',
  moderate:    'Moderate (3–5 days/week)',
  active:      'Active (6–7 days/week)',
  very_active: 'Very active (intense daily exercise)',
}

const GOAL_LABELS = {
  lose_weight:   'Lose weight',
  maintain:      'Maintain weight',
  gain_weight:   'Gain weight',
  build_muscle:  'Build muscle',
}

const DIETARY_OPTIONS = [
  { value: 'vegan',        label: 'Vegan' },
  { value: 'vegetarian',   label: 'Vegetarian' },
  { value: 'gluten_free',  label: 'Gluten free' },
  { value: 'lactose_free', label: 'Lactose free' },
  { value: 'nut_free',     label: 'Nut free' },
  { value: 'halal',        label: 'Halal' },
  { value: 'kosher',       label: 'Kosher' },
  { value: 'low_sodium',   label: 'Low sodium' },
  { value: 'diabetic',     label: 'Diabetic' },
]

function StatCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
        {value ?? <span className="text-gray-300 dark:text-gray-600 text-base">—</span>}
        {value && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function MacroCard({ label, value, unit, color }) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <p className="text-xs font-medium opacity-60">{label}</p>
      <p className="text-xl font-semibold mt-0.5">
        {value?.toFixed(1) ?? '—'}
        {value && <span className="text-sm font-normal opacity-60 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
const selectCls = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"

export default function ProfilePage() {
  const [profile, setProfile]           = useState(null)
  const [weightHistory, setWeightHistory] = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [profileId, setProfileId]       = useState(null)
  const [saved, setSaved]               = useState(false)

  const [form, setForm] = useState({
    sex: '', date_of_birth: '', height_cm: '',
    activity_level: '', goal: '', dietary_restrictions: []
  })

  const [weightForm, setWeightForm] = useState({ weight_kg: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [addingWeight, setAddingWeight] = useState(false)
  const [showWeightForm, setShowWeightForm] = useState(false)

  const load = async () => {
    try {
      const [profRes, weightRes] = await Promise.all([getProfile(), getWeightHistory()])
      const p = Array.isArray(profRes.data) ? profRes.data[0] : profRes.data
      if (p) {
        setProfile(p)
        setProfileId(p.id)
        setForm({
          sex:                    p.sex || '',
          date_of_birth:          p.date_of_birth || '',
          height_cm:              p.height_cm || '',
          activity_level:         p.activity_level || '',
          goal:                   p.goal || '',
          dietary_restrictions:   p.dietary_restrictions || [],
        })
      }
      const w = Array.isArray(weightRes.data) ? weightRes.data : weightRes.data.results || []
      setWeightHistory(w)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(profileId, form)
      await load()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleAddWeight = async () => {
    if (!weightForm.weight_kg) return
    setAddingWeight(true)
    try {
      await addWeight(weightForm)
      setWeightForm({ weight_kg: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowWeightForm(false)
      load()
    } finally {
      setAddingWeight(false)
    }
  }

  const toggleRestriction = (value) => {
    setForm(f => ({
      ...f,
      dietary_restrictions: f.dietary_restrictions.includes(value)
        ? f.dietary_restrictions.filter(r => r !== value)
        : [...f.dietary_restrictions, value]
    }))
  }

  const chartData = [...weightHistory]
    .reverse()
    .map(e => ({ date: e.date, weight: e.weight_kg }))

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const macros = profile?.recommended_macros

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your personal data and goals</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Scale}  label="Current weight" value={profile?.current_weight} unit="kg"   color="bg-blue-50 dark:bg-blue-900/20 text-blue-500" />
        <StatCard icon={User}   label="Age"            value={profile?.age}            unit="yrs"  color="bg-purple-50 dark:bg-purple-900/20 text-purple-500" />
        <StatCard icon={Flame}  label="TDEE"           value={profile?.tdee?.toFixed(0)} unit="kcal" color="bg-orange-50 dark:bg-orange-900/20 text-orange-500" />
        <StatCard icon={Target} label="Goal calories"  value={profile?.recommended_calories?.toFixed(0)} unit="kcal" color="bg-brand-50 dark:bg-brand-700/20 text-brand-500" />
      </div>

      {/* Recommended macros */}
      {macros && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">Recommended macros</h2>
          <div className="grid grid-cols-3 gap-3">
            <MacroCard label="Protein" value={macros.protein_g} unit="g" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800" />
            <MacroCard label="Carbs"   value={macros.carbs_g}   unit="g" color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" />
            <MacroCard label="Fat"     value={macros.fat_g}     unit="g" color="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800" />
          </div>
        </div>
      )}

      {/* Personal info */}
      <Section title="Personal information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sex">
            <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))} className={selectCls}>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" value={form.date_of_birth}
              onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
              className={inputCls} />
          </Field>
          <Field label="Height (cm)">
            <input type="number" value={form.height_cm} min="0"
              onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))}
              className={inputCls} placeholder="175" />
          </Field>
          <Field label="Activity level">
            <select value={form.activity_level} onChange={e => setForm(f => ({ ...f, activity_level: e.target.value }))} className={selectCls}>
              <option value="">Select...</option>
              {Object.entries(ACTIVITY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Goal">
            <select value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className={selectCls}>
              <option value="">Select...</option>
              {Object.entries(GOAL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Dietary restrictions */}
      <Section title="Dietary restrictions">
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(({ value, label }) => {
            const active = form.dietary_restrictions.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleRestriction(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
                  ${active
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'
                  }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Weight history */}
      <Section title="Weight history">
        <div className="space-y-4">
          {chartData.length > 1 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v) => [`${v} kg`, 'Weight']}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weight entries */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {weightHistory.length === 0 && (
              <p className="text-sm text-gray-400">No weight entries yet.</p>
            )}
            {weightHistory.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <span className="text-sm text-gray-500 dark:text-gray-400">{e.date}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.weight_kg} kg</span>
              </div>
            ))}
          </div>

          {/* Add weight */}
          {showWeightForm ? (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <input
                type="number" step="0.1" min="0"
                value={weightForm.weight_kg}
                onChange={e => setWeightForm(f => ({ ...f, weight_kg: e.target.value }))}
                placeholder="Weight (kg)"
                className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
              <input
                type="date"
                value={weightForm.date}
                onChange={e => setWeightForm(f => ({ ...f, date: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
              <input
                type="text"
                value={weightForm.notes}
                onChange={e => setWeightForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes (optional)"
                className="flex-1 min-w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
              <button onClick={handleAddWeight} disabled={addingWeight || !weightForm.weight_kg}
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium transition">
                {addingWeight ? '...' : 'Save'}
              </button>
              <button onClick={() => setShowWeightForm(false)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWeightForm(true)}
              className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium transition"
            >
              <Plus size={15} />
              Log weight
            </button>
          )}
        </div>
      </Section>
    </div>
  )
}