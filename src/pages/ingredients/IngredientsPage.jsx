import { useState, useEffect } from 'react'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../api/ingredients'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'

const EMPTY_FORM = {
  name: '', calories_per_100g: '', protein_g: '', carbs_g: '', fat_g: ''
}

function MacroBadge({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${color}`}>
      <span className="text-xs font-medium opacity-70">{label}</span>
      <span className="text-sm font-semibold">{value}g</span>
    </div>
  )
}

function IngredientModal({ ingredient, onClose, onSave }) {
  const [form, setForm] = useState(ingredient || EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (ingredient) {
        await updateIngredient(ingredient.id, form)
      } else {
        await createIngredient(form)
      }
      onSave()
    } catch (err) {
      const data = err.response?.data
      setError(Object.values(data || {}).flat().join(' ') || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, placeholder) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        step="0.1"
        min="0"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        placeholder={placeholder}
        required
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {ingredient ? 'Edit ingredient' : 'New ingredient'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              placeholder="e.g. Chicken breast"
              required
            />
          </div>

          {field('calories_per_100g', 'Calories per 100g', '0.0')}

          <div className="grid grid-cols-3 gap-3">
            {field('protein_g', 'Protein (g)', '0.0')}
            {field('carbs_g',   'Carbs (g)',   '0.0')}
            {field('fat_g',     'Fat (g)',      '0.0')}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition"
            >
              {loading ? 'Saving...' : ingredient ? 'Save changes' : 'Add ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IngredientRow({ ingredient, onEdit, onDelete, isDefault, isFav, onToggleFav }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition rounded-xl group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {ingredient.name}
          </span>
          {isDefault && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              default
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{ingredient.calories_per_100g} kcal / 100g</span>
      </div>

      <div className="flex items-center gap-2">
        <MacroBadge label="P" value={ingredient.protein_g} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
        <MacroBadge label="C" value={ingredient.carbs_g}   color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
        <MacroBadge label="F" value={ingredient.fat_g}     color="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" />
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onToggleFav(ingredient.id)}
          className={`p-2 rounded-lg transition ${
            isFav
              ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
              : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
          }`}
        >
          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        {!isDefault && (
          <>
            <button onClick={() => onEdit(ingredient)}
              className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete(ingredient)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(null) // null | 'create' | ingredient object
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isFavIngredient, toggleFavIngredient } = useFavorites()

const load = async () => {
  try {
    const res = await getIngredients()
    console.log('API response:', res.data) // <- agrega esto
    const data = Array.isArray(res.data) ? res.data : res.data.results || []
    setIngredients(data)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try {
      await deleteIngredient(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch {
      setDeleteTarget(null)
    }
  }

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const defaults = filtered.filter(i => i.is_default)
  const mine     = filtered.filter(i => !i.is_default)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Ingredients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{ingredients.length} total</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition"
        >
          <Plus size={16} />
          New ingredient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ingredients..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* My ingredients */}
          {mine.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">My ingredients</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {mine.map(i => (
                  <IngredientRow
                    key={i.id}
                    ingredient={i}
                    isDefault={i.is_default}
                    isFav={isFavIngredient(i.id)}
                    onToggleFav={toggleFavIngredient}
                    onEdit={setModal}
                    onDelete={setDeleteTarget}
/>
                ))}
              </div>
            </div>
          )}

          {/* Default ingredients */}
          {defaults.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Default ingredients</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {defaults.map(i => (
                  <IngredientRow
                    key={i.id}
                    ingredient={i}
                    isDefault={i.is_default}
                    isFav={isFavIngredient(i.id)}
                    onToggleFav={toggleFavIngredient}
                    onEdit={setModal}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm">
              No ingredients found.
            </div>
          )}
        </div>
      )}

      {/* Create / Edit modal */}
      {modal && (
        <IngredientModal
          ingredient={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm p-6 shadow-xl space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Delete ingredient</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-gray-100">{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}