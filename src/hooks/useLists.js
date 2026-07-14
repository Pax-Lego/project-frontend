import { useState, useEffect } from 'react'
import {
  getIngredientLists, createIngredientList, addIngredientToList, removeIngredientFromList,
  getRecipeLists, createRecipeList, addRecipeToList, removeRecipeFromList,
} from '../api/lists'

export function useLists() {
  const [ingredientLists, setIngredientLists] = useState([])
  const [recipeLists,     setRecipeLists]     = useState([])
  const [loading,         setLoading]         = useState(true)

  const load = async () => {
    try {
      const [ingRes, recRes] = await Promise.all([
        getIngredientLists(),
        getRecipeLists(),
      ])
      const ing = Array.isArray(ingRes.data) ? ingRes.data : ingRes.data.results || []
      const rec = Array.isArray(recRes.data) ? recRes.data : recRes.data.results || []
      setIngredientLists(ing)
      setRecipeLists(rec)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const listsForIngredient = (id) =>
    ingredientLists.filter(l => l.ingredient_ids?.includes(id))

  const listsForRecipe = (id) =>
    recipeLists.filter(l => l.recipe_ids?.includes(id))

  const isIngredientInList = (listId, ingredientId) =>
    ingredientLists.find(l => l.id === listId)?.ingredient_ids?.includes(ingredientId)

  const isRecipeInList = (listId, recipeId) =>
    recipeLists.find(l => l.id === listId)?.recipe_ids?.includes(recipeId)

  const toggleIngredientInList = async (listId, ingredientId) => {
    if (isIngredientInList(listId, ingredientId)) {
      await removeIngredientFromList(listId, ingredientId)
    } else {
      await addIngredientToList(listId, ingredientId)
    }
    load()
  }

  const toggleRecipeInList = async (listId, recipeId) => {
    if (isRecipeInList(listId, recipeId)) {
      await removeRecipeFromList(listId, recipeId)
    } else {
      await addRecipeToList(listId, recipeId)
    }
    load()
  }

  const addNewIngredientList = async (name) => {
    await createIngredientList(name)
    await load()
  }

  const addNewRecipeList = async (name) => {
    await createRecipeList(name)
    await load()
  }

  return {
    ingredientLists, recipeLists, loading,
    listsForIngredient, listsForRecipe,
    isIngredientInList, isRecipeInList,
    toggleIngredientInList, toggleRecipeInList,
    addNewIngredientList, addNewRecipeList,
    reload: load,
  }
}
