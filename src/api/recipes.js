import client from './client'

export const getRecipes   = ()     => client.get('/recipes/')
export const getRecipe    = (id)   => client.get(`/recipes/${id}/`)
export const createRecipe = (data) => client.post('/recipes/', data)
export const deleteRecipe = (id)   => client.delete(`/recipes/${id}/`)
export const addIngredientToRecipe = (id, data) =>
  client.post(`/recipes/${id}/add_ingredient/`, data)
export const removeIngredientFromRecipe = (id, data) =>
  client.delete(`/recipes/${id}/remove_ingredient/`, { data })