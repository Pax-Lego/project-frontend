import { useState, useEffect } from 'react'
import { getPlans, getPlan, createPlan, deletePlan, addMeal, removeMeal } from '../../api/plans'
import { getRecipes } from '../../api/recipes'
import { Plus, Trash2, X, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets, Calendar } from 'lucide-react'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'supplement']

const MEAL_COLORS = {
  breakfast:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  lunch:      'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  dinner:     'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  snack:      'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  supplement: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
}

function MacroChip({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${color}`}>
      <Icon size={13} />
      <span className="text-xs font-semibold">{Number(value).toFixed(1)}</span>
      <span className="text-xs opacity-60">{label}</span>
    </div>
  )
}

function PlanModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createPlan(form)
      onSave()
    } catch (err) {
      const data = err.response?.data
      setError(Object.values(data || {}).flat().join(' ') || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">New plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              placeholder="e.g. Monday plan"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition resize-none"
              placeholder="Optional notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition">
              {loading ? 'Creating...' : 'Create plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MealRow({ meal, planId, onUpdate }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleRemove = async () => {
    try {
      const body = { meal_type: meal.meal_type }
      if (['snack', 'supplement'].includes(meal.meal_type)) body.name = meal.name
      await removeMeal(planId, body)
      onUpdate()
    } catch (error) {
      console.error('Failed to remove meal:', error)
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${MEAL_COLORS[meal.meal_type]} group`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{meal.meal_type}</span>
          {meal.name && <span className="text-xs opacity-60">· {meal.name}</span>}
        </div>
        <p className="text-sm font-medium truncate mt-0.5">
          {meal.recipe_data?.name || <span className="opacity-50">No recipe</span>}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium opacity-70">{Number(meal.calories).toFixed(0)} kcal</span>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <X size={13} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => setDeleteConfirm(false)}
              className="text-xs px-2 py-1 rounded opacity-60 hover:opacity-100 transition">Cancel</button>
            <button onClick={handleRemove}
              className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition">Remove</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AddMealRow({ planId, recipes, existingMeals, onAdded }) {
  const [mealType, setMealType]   = useState('')
  const [mealName, setMealName]   = useState('')
  const [recipeId, setRecipeId]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const needsName = ['snack', 'supplement'].includes(mealType)

  const usedUnique = existingMeals
    .filter(m => ['breakfast', 'lunch', 'dinner'].includes(m.meal_type))
    .map(m => m.meal_type)

  const availableTypes = MEAL_TYPES.filter(t =>
    !['breakfast', 'lunch', 'dinner'].includes(t) || !usedUnique.includes(t)
  )

  const handleAdd = async () => {
    if (!mealType) return
    setError('')
    setLoading(true)
    try {
      const body = { meal_type: mealType, recipe_id: recipeId ? parseInt(recipeId) : undefined }
      if (needsName) body.name = mealName
      await addMeal(planId, body)
      setMealType(''); setMealName(''); setRecipeId('')
      onAdded()
    } catch (err) {
      const data = err.response?.data
      setError(Object.values(data || {}).flat().join(' ') || 'Error adding meal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <select
          value={mealType}
          onChange={e => setMealType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        >
          <option value="">Meal type...</option>
          {availableTypes.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        {needsName && (
          <input
            type="text"
            value={mealName}
            onChange={e => setMealName(e.target.value)}
            placeholder="Name (e.g. Morning snack)"
            className="flex-1 min-w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
        )}

        <select
          value={recipeId}
          onChange={e => setRecipeId(e.target.value)}
          className="flex-1 min-w-40 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        >
          <option value="">No recipe</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          disabled={loading || !mealType || (needsName && !mealName)}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium transition"
        >
          {loading ? '...' : 'Add'}
        </button>
      </div>
    </div>
  )
}

function PlanCard({ plan, recipes, onDelete, onUpdate, isFav, onToggleFav }) {
  const [expanded, setExpanded]       = useState(false)
  const [detail, setDetail]           = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const loadDetail = async () => {
    setLoadingDetail(true)
    try {
      const res = await getPlan(plan.id)
      setDetail(res.data)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleExpand = () => {
    if (!expanded) loadDetail()
    setExpanded(e => !e)
  }

  const handleUpdate = () => {
    loadDetail()
    onUpdate?.()
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{plan.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">{plan.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeleteConfirm(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={handleExpand}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4">
          {loadingDetail ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : detail ? (
            <>
              {/* Totals */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <Flame size={13} />
                  <span className="text-xs font-semibold">{Number(detail.total_calories).toFixed(1)}</span>
                  <span className="text-xs opacity-60">kcal</span>
                </div>
                <MacroChip icon={Beef}     label="protein" value={detail.total_protein} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
                <MacroChip icon={Wheat}    label="carbs"   value={detail.total_carbs}   color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
                <MacroChip icon={Droplets} label="fat"     value={detail.total_fat}     color="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" />
              </div>

              {/* Meals */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Meals</h4>
                {detail.plan_meals?.length === 0 && (
                  <p className="text-sm text-gray-400">No meals added yet.</p>
                )}
                {detail.plan_meals?.map(meal => (
                  <MealRow key={meal.id} meal={meal} planId={plan.id} onUpdate={handleUpdate} />
                ))}
              </div>

              {/* Add meal */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Add meal</h4>
                <AddMealRow
                  planId={plan.id}
                  recipes={recipes}
                  existingMeals={detail.plan_meals || []}
                  onAdded={handleUpdate}
                />
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Delete <span className="font-medium">{plan.name}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(false)}
              className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={() => { onDelete(plan.id); setDeleteConfirm(false) }}
              className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
              Delete
            </button>
          </div>
        </div>
      )}
      <button
    onClick={() => onToggleFav(plan.id)}
    className={`p-2 rounded-lg transition ${
      isFav
        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
        : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
    }`}
  >
    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
  </button>
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans]     = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { isFavPlan, toggleFavPlan } = useFavorites()

  const load = async () => {
    try {
      const [planRes, recRes] = await Promise.all([getPlans(), getRecipes()])
      const p = Array.isArray(planRes.data) ? planRes.data : planRes.data.results || []
      const r = Array.isArray(recRes.data)  ? recRes.data  : recRes.data.results  || []
      setPlans(p)
      setRecipes(r)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await deletePlan(id)
      load()
    } catch (error) {
      console.error('Failed to delete plan:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Plans</h1>
          <p className="text-sm text-gray-400 mt-0.5">{plans.length} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition"
        >
          <Plus size={16} />
          New plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No plans yet. Create your first one.</div>
      ) : (
        <div className="space-y-4">
          {plans.map(p => (
            <PlanCard
              key={p.id}
              plan={p}
              recipes={recipes}
              onDelete={handleDelete}
              onUpdate={load}
              isFav={isFavPlan(p.id)}
              onToggleFav={toggleFavPlan}
/>
          ))}
        </div>
      )}

      {showModal && (
        <PlanModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}