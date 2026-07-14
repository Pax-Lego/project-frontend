import client from './client'

export const getIngredientLists = () => client.get('/lists/ingredients/')
export const getIngredientList  = (id) => client.get(`/lists/ingredients/${id}/`)
export const createIngredientList = (name) => client.post('/lists/ingredients/', { name })
export const deleteIngredientList = (id) => client.delete(`/lists/ingredients/${id}/`)
export const addIngredientToList = (listId, ingredientId) =>
  client.post(`/lists/ingredients/${listId}/add_ingredient/`, { ingredient_id: ingredientId })
export const removeIngredientFromList = (listId, ingredientId) =>
  client.delete(`/lists/ingredients/${listId}/remove_ingredient/`, { data: { ingredient_id: ingredientId } })

export const getRecipeLists = () => client.get('/lists/recipes/')
export const getRecipeList  = (id) => client.get(`/lists/recipes/${id}/`)
export const createRecipeList = (name) => client.post('/lists/recipes/', { name })
export const deleteRecipeList = (id) => client.delete(`/lists/recipes/${id}/`)
export const addRecipeToList = (listId, recipeId) =>
  client.post(`/lists/recipes/${listId}/add_recipe/`, { recipe_id: recipeId })
export const removeRecipeFromList = (listId, recipeId) =>
  client.delete(`/lists/recipes/${listId}/remove_recipe/`, { data: { recipe_id: recipeId } })
