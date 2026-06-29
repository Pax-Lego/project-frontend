import client from './client'

export const getProfile    = ()     => client.get('/profile/')
export const updateProfile = (id, data) => client.patch(`/profile/${id}/`, data)
export const getWeightHistory = ()  => client.get('/profile/weight/')
export const addWeight     = (data) => client.post('/profile/weight/', data)