import client from './client'

export const getPlans  = ()     => client.get('/plans/')
export const getPlan   = (id)   => client.get(`/plans/${id}/`)
export const createPlan = (data) => client.post('/plans/', data)
export const deletePlan = (id)  => client.delete(`/plans/${id}/`)
export const addMeal   = (id, data) => client.post(`/plans/${id}/add_meal/`, data)
export const removeMeal = (id, data) => client.delete(`/plans/${id}/remove_meal/`, { data })