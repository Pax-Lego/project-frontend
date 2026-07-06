import { useState, useEffect } from 'react'
import { getPlans, getPlan } from '../../api/plans'
import { getIngredients } from '../../api/ingredients'
import { getRecipes } from '../../api/recipes'
import { getProfile, getWeightHistory } from '../../api/profile'
import { Link } from 'react-router-dom'
import {
  Flame, Apple, UtensilsCrossed, CalendarDays,
  ArrowRight, Target, Heart
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useFavorites } from '../../hooks/useFavorites'

function MacroBar({ label, current, goal, color }) {
  const pct = goal ? Math.min((current / goal) * 100, 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-400">
          {current.toFixed(1)}g / {goal ? `${goal.toFixed(1)}g` : '—'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4 hover:border-brand-200 dark:hover:border-brand-800 transition group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition" />
    </div>
  )
  return <Link to={to}>{content}</Link>
}

function MealRow({ meal }) {
  const colors = {
    breakfast:  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    lunch:      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    dinner:     'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    snack:      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    supplement: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  }
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[meal.meal_type]}`}>
          {meal.meal_type}
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {meal.recipe_data?.name || <span className="text-gray-400">No recipe</span>}
        </span>
      </div>
      <span className="text-xs text-gray-400 font-medium">{Number(meal.calories).toFixed(0)} kcal</span>
    </div>
  )
}

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {to && (
        <Link to={to} className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition">
          View all <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [profile,       setProfile]       = useState(null)
  const [latestPlan,    setLatestPlan]    = useState(null)
  const [planDetail,    setPlanDetail]    = useState(null)
  const [weightHistory, setWeightHistory] = useState([])
  const [counts,        setCounts]        = useState({ ingredients: 0, recipes: 0, plans: 0 })
  const [loading,       setLoading]       = useState(true)
  const { favIngredients, favRecipes, favPlans } = useFavorites()

  useEffect(() => {
    const load = async () => {
      try {
        const [profRes, plansRes, ingRes, recRes, weightRes] = await Promise.all([
          getProfile(),
          getPlans(),
          getIngredients(),
          getRecipes(),
          getWeightHistory(),
        ])

        const p = Array.isArray(profRes.data) ? profRes.data[0] : profRes.data
        setProfile(p)

        const plans = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.results || []
        const ings  = Array.isArray(ingRes.data)   ? ingRes.data   : ingRes.data.results   || []
        const recs  = Array.isArray(recRes.data)   ? recRes.data   : recRes.data.results   || []
        const w     = Array.isArray(weightRes.data) ? weightRes.data : weightRes.data.results || []

        setCounts({ ingredients: ings.length, recipes: recs.length, plans: plans.length })
        setWeightHistory(w)

        if (plans.length > 0) {
          setLatestPlan(plans[0])
          const detailRes = await getPlan(plans[0].id)
          setPlanDetail(detailRes.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const macros    = profile?.recommended_macros
  const chartData = [...weightHistory].reverse().map(e => ({ date: e.date, weight: e.weight_kg }))

  const todayMacros = planDetail
    ? {
        calories: planDetail.total_calories,
        protein:  planDetail.total_protein,
        carbs:    planDetail.total_carbs,
        fat:      planDetail.total_fat,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Apple}          label="Ingredients" value={counts.ingredients} color="bg-green-50 dark:bg-green-900/20 text-green-500"  to="/ingredients" />
        <StatCard icon={UtensilsCrossed} label="Recipes"    value={counts.recipes}     color="bg-blue-50 dark:bg-blue-900/20 text-blue-500"    to="/recipes" />
        <StatCard icon={CalendarDays}   label="Plans"       value={counts.plans}       color="bg-purple-50 dark:bg-purple-900/20 text-purple-500" to="/plans" />
      </div>

      {/* Macros + Plan row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's macros */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          <SectionHeader title={latestPlan ? `${latestPlan.name} · ${latestPlan.date}` : "Today's nutrition"} to="/plans" />

          {/* Calories ring summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Calories</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {todayMacros.calories.toFixed(0)}
                {macros && (
                  <span className="text-sm font-normal text-gray-400 ml-1">/ {macros.calories.toFixed(0)} kcal</span>
                )}
              </p>
            </div>
          </div>

          {/* Macro bars */}
          <div className="space-y-3">
            <MacroBar label="Protein" current={todayMacros.protein} goal={macros?.protein_g} color="bg-blue-400" />
            <MacroBar label="Carbs"   current={todayMacros.carbs}   goal={macros?.carbs_g}   color="bg-amber-400" />
            <MacroBar label="Fat"     current={todayMacros.fat}     goal={macros?.fat_g}     color="bg-rose-400" />
          </div>

          {!macros && (
            <p className="text-xs text-gray-400 text-center">
              Set your goal in{' '}
              <Link to="/profile" className="text-brand-500 hover:text-brand-600 font-medium">Profile</Link>
              {' '}to see macro targets.
            </p>
          )}
        </div>

        {/* Latest plan meals */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <SectionHeader title="Latest plan meals" to="/plans" />
          {!planDetail ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <CalendarDays size={32} className="text-gray-200 dark:text-gray-700" />
              <p className="text-sm text-gray-400">No plans yet.</p>
              <Link to="/plans" className="text-xs text-brand-500 hover:text-brand-600 font-medium">Create your first plan →</Link>
            </div>
          ) : planDetail.plan_meals?.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No meals in this plan yet.</p>
          ) : (
            <div className="space-y-1">
              {planDetail.plan_meals.map(meal => (
                <MealRow key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TDEE + Goal */}
      {profile?.tdee && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-xs text-gray-400 font-medium">TDEE</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
              {profile.tdee.toFixed(0)}
              <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-xs text-gray-400 font-medium">Goal calories</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
              {profile.recommended_calories?.toFixed(0)}
              <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-xs text-gray-400 font-medium">Current weight</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
              {profile.current_weight ?? '—'}
              {profile.current_weight && <span className="text-sm font-normal text-gray-400 ml-1">kg</span>}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-xs text-gray-400 font-medium">Goal</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-0.5 capitalize">
              {profile.goal?.replace('_', ' ') ?? '—'}
            </p>
          </div>
        </div>
      )}

      {/* Weight chart */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <SectionHeader title="Weight progress" to="/profile" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v) => [`${v} kg`, 'Weight']}
                />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No profile warning */}
      {!profile?.tdee && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center gap-4">
          <Target size={20} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Complete your profile</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Add your personal data to see your TDEE, goal calories and macro recommendations.{' '}
              <Link to="/profile" className="font-semibold underline">Go to Profile →</Link>
            </p>
          </div>
        </div>
      )}
      {(favIngredients.length > 0 || favRecipes.length > 0 || favPlans.length > 0) && (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
    <div className="flex items-center gap-2">
      <Heart size={16} className="text-rose-500" fill="currentColor" />
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Favorites</h2>
    </div>

    {favIngredients.length > 0 && (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ingredients</p>
        <div className="flex flex-wrap gap-2">
          {favIngredients.map(f => (
            <Link key={f.id} to="/ingredients"
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-500 transition">
              {f.ingredient_data?.name}
            </Link>
          ))}
        </div>
      </div>
    )}

    {favRecipes.length > 0 && (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recipes</p>
        <div className="flex flex-wrap gap-2">
          {favRecipes.map(f => (
            <Link key={f.id} to="/recipes"
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-500 transition">
              {f.recipe_data?.name}
            </Link>
          ))}
        </div>
      </div>
    )}

    {favPlans.length > 0 && (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Plans</p>
        <div className="flex flex-wrap gap-2">
          {favPlans.map(f => (
            <Link key={f.id} to="/plans"
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-500 transition">
              {f.plan_data?.name}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
)}
    </div>
  )
}
