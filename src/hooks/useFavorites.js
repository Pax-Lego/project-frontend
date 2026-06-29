import { useState, useEffect } from 'react'
import {
  getFavoriteIngredients, addFavoriteIngredient, removeFavoriteIngredient,
  getFavoriteRecipes, addFavoriteRecipe, removeFavoriteRecipe,
  getFavoritePlans, addFavoritePlan, removeFavoritePlan,
} from '../api/favorites'

export function useFavorites() {
  const [favIngredients, setFavIngredients] = useState([])
  const [favRecipes,     setFavRecipes]     = useState([])
  const [favPlans,       setFavPlans]       = useState([])
  const [loading,        setLoading]        = useState(true)

  const load = async () => {
    try {
      const [ingRes, recRes, planRes] = await Promise.all([
        getFavoriteIngredients(),
        getFavoriteRecipes(),
        getFavoritePlans(),
      ])
      const ing  = Array.isArray(ingRes.data)  ? ingRes.data  : ingRes.data.results  || []
      const rec  = Array.isArray(recRes.data)  ? recRes.data  : recRes.data.results  || []
      const plan = Array.isArray(planRes.data) ? planRes.data : planRes.data.results || []
      setFavIngredients(ing)
      setFavRecipes(rec)
      setFavPlans(plan)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const isFavIngredient = (id) => favIngredients.some(f => f.ingredient === id)
  const isFavRecipe     = (id) => favRecipes.some(f => f.recipe === id)
  const isFavPlan       = (id) => favPlans.some(f => f.plan === id)

  const getFavIngredientId = (id) => favIngredients.find(f => f.ingredient === id)?.id
  const getFavRecipeId     = (id) => favRecipes.find(f => f.recipe === id)?.id
  const getFavPlanId       = (id) => favPlans.find(f => f.plan === id)?.id

  const toggleFavIngredient = async (id) => {
    if (isFavIngredient(id)) {
      await removeFavoriteIngredient(getFavIngredientId(id))
    } else {
      await addFavoriteIngredient(id)
    }
    load()
  }

  const toggleFavRecipe = async (id) => {
    if (isFavRecipe(id)) {
      await removeFavoriteRecipe(getFavRecipeId(id))
    } else {
      await addFavoriteRecipe(id)
    }
    load()
  }

  const toggleFavPlan = async (id) => {
    if (isFavPlan(id)) {
      await removeFavoritePlan(getFavPlanId(id))
    } else {
      await addFavoritePlan(id)
    }
    load()
  }

  return {
    favIngredients, favRecipes, favPlans, loading,
    isFavIngredient, isFavRecipe, isFavPlan,
    toggleFavIngredient, toggleFavRecipe, toggleFavPlan,
    reload: load,
  }
}