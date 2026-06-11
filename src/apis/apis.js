import apiClient from './axiosClient'

export const bookApi = {
  getAll: (params) => apiClient.get('/books', { params }),
  getById: (id) => apiClient.get(`/books/${id}`),
  create: (data) => apiClient.post('/books', data),
  update: (id, data) => apiClient.put(`/books/${id}`, data),
  delete: (id) => apiClient.delete(`/books/${id}`),
}

export const bookCopyApi = {
  getAll: (params) => apiClient.get('/book-copies', { params }),
  getById: (id) => apiClient.get(`/book-copies/${id}`),
  create: (bookId, data) => apiClient.post(`/book-copies/book/${bookId}`, data),
  update: (id, data) => apiClient.put(`/book-copies/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/book-copies/${id}/status`, { status }),
}

export const borrowApi = {
  getAll: (params) => apiClient.get('/borrow-records', { params }),
  getByUser: (userId, params) => apiClient.get(`/users/${userId}/borrow-records`, { params }),
  getById: (id) => apiClient.get(`/borrow-records/${id}`),
  create: (data) => apiClient.post('/borrow-records', data),
  confirmReturn: (id, data) => apiClient.patch(`/borrow-records/${id}/return`, data),
  cancel: (id) => apiClient.patch(`/borrow-records/${id}/cancel`),
  extend: (id, data) => apiClient.patch(`/borrow-records/${id}/extend`, data),
  requestExtension: (id) => apiClient.post(`/borrow-records/${id}/extension-requests`),
}

export const fineApi = {
  getAll: (params) => apiClient.get('/fines', { params }),
  getByUser: (userId, params) => apiClient.get(`/users/${userId}/fines`, { params }),
  getById: (id) => apiClient.get(`/fines/${id}`),
  create: (data) => apiClient.post('/fines', data),
  pay: (id) => apiClient.patch(`/fines/${id}/pay`),
}

export const reservationApi = {
  getAll: (params) => apiClient.get('/reservations', { params }),
  create: (data) => apiClient.post('/reservations', data),
  cancel: (id) => apiClient.patch(`/reservations/${id}/cancel`),
  complete: (id) => apiClient.patch(`/reservations/${id}/complete`),
}

export const userApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  updateMyProfile: (data) => apiClient.put('/users/me/profile', data),
  updateCardStatus: (id, status) => apiClient.patch(`/users/${id}/card-status`, { status }),
  updateStatus: (id, status) => apiClient.patch(`/users/${id}/status`, { status }),
  addStaff: (data) => apiClient.post('/users/staff', data),
  getStaffs: (params) => apiClient.get('/users/staffs', { params }),
}

export const categoryApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
}

export const authorApi = {
  getAll: () => apiClient.get('/authors'),
  getById: (id) => apiClient.get(`/authors/${id}`),
  create: (data) => apiClient.post('/authors', data),
  update: (id, data) => apiClient.put(`/authors/${id}`, data),
  delete: (id) => apiClient.delete(`/authors/${id}`),
}

export const publisherApi = {
  getAll: () => apiClient.get('/publishers'),
  getById: (id) => apiClient.get(`/publishers/${id}`),
  create: (data) => apiClient.post('/publishers', data),
  update: (id, data) => apiClient.put(`/publishers/${id}`, data),
  delete: (id) => apiClient.delete(`/publishers/${id}`),
}

export const notificationApi = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getById: (id) => apiClient.get(`/notifications/${id}`),
  readOne: (id) => apiClient.patch(`/notifications/${id}/read`),
  readAll: () => apiClient.patch('/notifications/read-all'),
}

export const statsApi = {
  getOverview: () => apiClient.get('/statistic/overviews'),
  getOverdue: () => apiClient.get('/statistic/overdue'),
  getTopBooks: (params) => apiClient.get('/statistic/top-books', { params }),
}
