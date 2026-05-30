import { http } from './http'

export const articleApi = {
  list: (params) => http.get('/articles', { params }),
  detail: (id) => http.get(`/articles/${id}`),
  create: (data) => http.post('/admin/articles', data),
  update: (id, data) => http.put(`/admin/articles/${id}`, data),
  remove: (id) => http.delete(`/admin/articles/${id}`),
}

export const projectApi = {
  list: () => http.get('/projects'),
  create: (data) => http.post('/admin/projects', data),
}

export const commentApi = {
  create: (data) => http.post('/comments', data),
  pending: () => http.get('/admin/comments'),
  approve: (id) => http.put(`/admin/comments/${id}/approve`),
  remove: (id) => http.delete(`/admin/comments/${id}`),
}

export const authApi = {
  login: (data) => http.post('/admin/login', data),
  refresh: () => http.post('/admin/refresh'),
}

export const aboutApi = {
  get: () => http.get('/about'),
  update: (data) => http.put('/admin/about', data),
}
