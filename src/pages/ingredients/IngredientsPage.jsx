import { useState, useEffect } from 'react'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../api/ingredients'
import { Plus, Pencil, Trash2, X, Search, ListPlus, Check } from 'lucide-react'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { useLists } from '../../hooks/useLists'

const EMPTY_FORM = {
  name: '', measurement_type: 'weight',
  calories_per_100g: '', protein_g: '', carbs_g: '', fat_g: '',
  unit_label: '', calories_per_unit: '', protein_per_unit: '', carbs_per_unit: '', fat_per_unit: ''
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
      const isUnitMode = form.measurement_type === 'unit'
      const payload = {
        name: form.name,
        measurement_type: form.measurement_type,
        calories_per_100g: isUnitMode ? null : parseFloat(form.calories_per_100g),
        protein_g:         isUnitMode ? null : parseFloat(form.protein_g),
        carbs_g:           isUnitMode ? null : parseFloat(form.carbs_g),
        fat_g:              isUnitMode ? null : parseFloat(form.fat_g),
        unit_label:         isUnitMode ? form.unit_label : null,
        calories_per_unit:  isUnitMode ? parseFloat(form.calories_per_unit) : null,
        protein_per_unit:   isUnitMode ? parseFloat(form.protein_per_unit) : null,
        carbs_per_unit:     isUnitMode ? parseFloat(form.carbs_per_unit) : null,
        fat_per_unit:       isUnitMode ? parseFloat(form.fat_per_unit) : null,
      }
      if (ingredient) {
        await updateIngredient(ingredient.id, payload)
      } else {
        await createIngredient(payload)
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

  const isUnit = form.measurement_type === 'unit'

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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Measured by</label>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {[
                { value: 'weight', label: 'Per 100g' },
                { value: 'unit',   label: 'Per unit' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, measurement_type: opt.value }))}
                  className={`flex-1 px-3.5 py-1.5 rounded-lg text-sm font-medium transition
                    ${form.measurement_type === opt.value
                      ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isUnit ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit name</label>
                <input
                  type="text"
                  value={form.unit_label}
                  onChange={e => setForm(f => ({ ...f, unit_label: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
                  placeholder="e.g. egg, slice"
                  required
                />
              </div>

              {field('calories_per_unit', 'Calories per unit', '0.0')}

              <div className="grid grid-cols-3 gap-3">
                {field('protein_per_unit', 'Protein (g)', '0.0')}
                {field('carbs_per_unit',   'Carbs (g)',   '0.0')}
                {field('fat_per_unit',     'Fat (g)',      '0.0')}
              </div>
            </>
          ) : (
            <>
              {field('calories_per_100g', 'Calories per 100g', '0.0')}

              <div className="grid grid-cols-3 gap-3">
                {field('protein_g', 'Protein (g)', '0.0')}
                {field('carbs_g',   'Carbs (g)',   '0.0')}
                {field('fat_g',     'Fat (g)',      '0.0')}
              </div>
            </>
          )}

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

function ListPopover({ ingredient, ingredientLists, isIngredientInList, onToggle }) {
  const [open, setOpen] = useState(false)
  const customLists = ingredientLists.filter(l => !l.is_builtin)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition"
      >
        <ListPlus size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-2 space-y-1">
            {customLists.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-1.5">No lists yet. Create one first.</p>
            ) : (
              customLists.map(list => {
                const active = isIngredientInList(list.id, ingredient.id)
                return (
                  <button
                    key={list.id}
                    onClick={() => onToggle(list.id, ingredient.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <span className="truncate">{list.name}</span>
                    {active && <Check size={14} className="text-brand-500 flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

function IngredientRow({ ingredient, onEdit, onDelete, isFav, onToggleFav, ingredientLists, isIngredientInList, onToggleList }) {
  const isUnit = ingredient.measurement_type === 'unit'
  const calories = isUnit ? ingredient.calories_per_unit : ingredient.calories_per_100g
  const protein  = isUnit ? ingredient.protein_per_unit  : ingredient.protein_g
  const carbs    = isUnit ? ingredient.carbs_per_unit    : ingredient.carbs_g
  const fat      = isUnit ? ingredient.fat_per_unit      : ingredient.fat_g

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition rounded-xl group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {ingredient.name}
          </span>
          {ingredient.is_default && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              default
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {calories} kcal / {isUnit ? (ingredient.unit_label || 'unit') : '100g'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <MacroBadge label="P" value={protein} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
        <MacroBadge label="C" value={carbs}   color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
        <MacroBadge label="F" value={fat}     color="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" />
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
        <ListPopover
          ingredient={ingredient}
          ingredientLists={ingredientLists}
          isIngredientInList={isIngredientInList}
          onToggle={onToggleList}
        />
        <button onClick={() => onEdit(ingredient)}
          className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">
          <Pencil size={15} />
        </button>
        <button onClick={() => onDelete(ingredient)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <Trash2 size={15} />
        </button>
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
  const [activeListId, setActiveListId] = useState('all')
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const { isFavIngredient, toggleFavIngredient } = useFavorites()
  const {
    ingredientLists, listsForIngredient, isIngredientInList,
    toggleIngredientInList, addNewIngredientList,
  } = useLists()

  const load = async () => {
    try {
      const res = await getIngredients()
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

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    await addNewIngredientList(newListName.trim())
    setNewListName('')
    setShowNewList(false)
  }

  const filtered = ingredients
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => activeListId === 'all' || listsForIngredient(i.id).some(l => l.id === activeListId))

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

      {/* List filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveListId('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
            ${activeListId === 'all'
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'
            }`}
        >
          All
        </button>
        {ingredientLists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${activeListId === list.id
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'
              }`}
          >
            {list.name} <span className="opacity-60">{list.ingredient_count}</span>
          </button>
        ))}

        {showNewList ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateList()}
              placeholder="List name..."
              className="w-32 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />
            <button onClick={handleCreateList} className="p-1.5 rounded-full text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">
              <Check size={15} />
            </button>
            <button onClick={() => { setShowNewList(false); setNewListName('') }} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewList(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition"
          >
            <Plus size={13} />
            New list
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map(i => (
                  <IngredientRow
                    key={i.id}
                    ingredient={i}
                    isFav={isFavIngredient(i.id)}
                    onToggleFav={toggleFavIngredient}
                    onEdit={setModal}
                    onDelete={setDeleteTarget}
                    ingredientLists={ingredientLists}
                    isIngredientInList={isIngredientInList}
                    onToggleList={toggleIngredientInList}
                  />
                ))}
              </div>
            </div>
          ) : (
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
