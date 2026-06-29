import client from './client'

export const getIngredients = () => client.get('/ingredients/')
export const createIngredient = (data) => client.post('/ingredients/', data)
export const updateIngredient = (id, data) => client.patch(`/ingredients/${id}/`, data)
export const deleteIngredient = (id) => client.delete(`/ingredients/${id}/`)