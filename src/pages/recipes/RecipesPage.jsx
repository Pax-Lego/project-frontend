import { useState, useEffect } from 'react'
import { getRecipes, createRecipe, deleteRecipe, addIngredientToRecipe, removeIngredientFromRecipe } from '../../api/recipes'
import { getIngredients } from '../../api/ingredients'
import { Plus, Trash2, X, Search, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets, ListPlus, Check } from 'lucide-react'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import { useLists } from '../../hooks/useLists'

function MacroChip({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${color}`}>
      <Icon size={13} />
      <span className="text-xs font-semibold">{value}g</span>
      <span className="text-xs opacity-60">{label}</span>
    </div>
  )
}

function RecipeModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createRecipe({ name, description })
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
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">New recipe</h2>
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
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              placeholder="e.g. Protein breakfast"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition resize-none"
              placeholder="Describe the recipe..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition">
              {loading ? 'Creating...' : 'Create recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddIngredientRow({ recipeId, ingredients, onAdded }) {
  const [selectedId, setSelectedId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedIngredient = ingredients.find(i => String(i.id) === String(selectedId))
  const isUnit = selectedIngredient?.measurement_type === 'unit'
  const quantityPlaceholder = isUnit ? (selectedIngredient.unit_label || 'units') : 'g'

  const handleAdd = async () => {
    if (!selectedId || !quantity) return
    setLoading(true)
    try {
      await addIngredientToRecipe(recipeId, {
        ingredient_id: parseInt(selectedId),
        quantity: parseFloat(quantity)
      })
      setSelectedId('')
      setQuantity('')
      onAdded()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
      >
        <option value="">Select ingredient...</option>
        {ingredients.map(i => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>
      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        placeholder={quantityPlaceholder}
        min="0"
        step="0.1"
        className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
      />
      <button
        onClick={handleAdd}
        disabled={loading || !selectedId || !quantity}
        className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium transition"
      >
        {loading ? '...' : 'Add'}
      </button>
    </div>
  )
}

function ListPopover({ recipe, recipeLists, isRecipeInList, onToggle }) {
  const [open, setOpen] = useState(false)
  const customLists = recipeLists.filter(l => !l.is_builtin)

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
                const active = isRecipeInList(list.id, recipe.id)
                return (
                  <button
                    key={list.id}
                    onClick={() => onToggle(list.id, recipe.id)}
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

function RecipeCard({ recipe, ingredients, onDelete, onUpdate, isFav, onToggleFav, recipeLists, isRecipeInList, onToggleList }) {
  const [expanded, setExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleRemoveIngredient = async (recipeIngredientId) => {
    try {
      await removeIngredientFromRecipe(recipe.id, { recipe_ingredient_id: recipeIngredientId })
      onUpdate()
    } catch (error) {
      console.error('Failed to remove ingredient:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{recipe.name}</h3>
            {recipe.is_default && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">default</span>
            )}
          </div>
          {recipe.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{recipe.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ListPopover
            recipe={recipe}
            recipeLists={recipeLists}
            isRecipeInList={isRecipeInList}
            onToggle={onToggleList}
          />
          <button
            onClick={() => setDeleteConfirm(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Macros summary */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
          <Flame size={13} />
          <span className="text-xs font-semibold">{recipe.total_calories?.toFixed(1)}</span>
          <span className="text-xs opacity-60">kcal</span>
        </div>
        <MacroChip icon={Beef}    label="protein" value={recipe.total_protein?.toFixed(1)} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
        <MacroChip icon={Wheat}   label="carbs"   value={recipe.total_carbs?.toFixed(1)}   color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
        <MacroChip icon={Droplets} label="fat"    value={recipe.total_fat?.toFixed(1)}     color="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" />
      </div>

      {/* Expanded: ingredients */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ingredients</h4>

          {recipe.ingredients_rel?.length === 0 && (
            <p className="text-sm text-gray-400">No ingredients yet.</p>
          )}

          <div className="space-y-1">
            {recipe.ingredients_rel?.map(ri => (
              <div key={ri.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition">
                <div>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{ri.ingredient_name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {ri.measurement_type === 'unit'
                      ? `${ri.quantity} × ${ri.unit_label || 'unit'}`
                      : `${ri.quantity}g`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{ri.calories?.toFixed(1)} kcal</span>
                  <button
                    onClick={() => handleRemoveIngredient(ri.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <AddIngredientRow
            recipeId={recipe.id}
            ingredients={ingredients}
            onAdded={onUpdate}
          />
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Delete <span className="font-medium">{recipe.name}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(false)}
              className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button onClick={() => { onDelete(recipe.id); setDeleteConfirm(false) }}
              className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
              Delete
            </button>
          </div>
        </div>
      )}
      <button
    onClick={() => onToggleFav(recipe.id)}
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

export default function RecipesPage() {
  const [recipes, setRecipes]         = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [activeListId, setActiveListId] = useState('all')
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const { isFavRecipe, toggleFavRecipe } = useFavorites()
  const {
    recipeLists, listsForRecipe, isRecipeInList,
    toggleRecipeInList, addNewRecipeList,
  } = useLists()

  const load = async () => {
    try {
      const [recRes, ingRes] = await Promise.all([getRecipes(), getIngredients()])
      const recipes = Array.isArray(recRes.data) ? recRes.data : recRes.data.results || []
      const ings    = Array.isArray(ingRes.data) ? ingRes.data : ingRes.data.results || []
      setRecipes(recipes)
      setIngredients(ings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await deleteRecipe(id)
      load()
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    await addNewRecipeList(newListName.trim())
    setNewListName('')
    setShowNewList(false)
  }

  const filtered = recipes
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter(r => activeListId === 'all' || listsForRecipe(r.id).some(l => l.id === activeListId))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Recipes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{recipes.length} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition"
        >
          <Plus size={16} />
          New recipe
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes..."
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
        {recipeLists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${activeListId === list.id
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'
              }`}
          >
            {list.name} <span className="opacity-60">{list.recipe_count}</span>
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
            <div className="space-y-4">
              {filtered.map(r => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  ingredients={ingredients}
                  onDelete={handleDelete}
                  onUpdate={load}
                  isFav={isFavRecipe(r.id)}
                  onToggleFav={toggleFavRecipe}
                  recipeLists={recipeLists}
                  isRecipeInList={isRecipeInList}
                  onToggleList={toggleRecipeInList}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 text-sm">No recipes found.</div>
          )}
        </div>
      )}

      {showModal && (
        <RecipeModal
          ingredients={ingredients}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
