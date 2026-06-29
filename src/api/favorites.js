import client from './client'

export const getFavoriteIngredients = () => client.get('/favorites/ingredients/')
export const addFavoriteIngredient  = (id) => client.post('/favorites/ingredients/', { ingredient: id })
export const removeFavoriteIngredient = (id) => client.delete(`/favorites/ingredients/${id}/`)

export const getFavoriteRecipes = () => client.get('/favorites/recipes/')
export const addFavoriteRecipe  = (id) => client.post('/favorites/recipes/', { recipe: id })
export const removeFavoriteRecipe = (id) => client.delete(`/favorites/recipes/${id}/`)

export const getFavoritePlans = () => client.get('/favorites/plans/')
export const addFavoritePlan  = (id) => client.post('/favorites/plans/', { plan: id })
export const removeFavoritePlan = (id) => client.delete(`/favorites/plans/${id}/`)