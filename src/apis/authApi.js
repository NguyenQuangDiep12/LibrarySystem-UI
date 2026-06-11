import apiClient from './axiosClient'

const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  resetPassword: (data) => apiClient.put('/auth/reset-password', data),
}

export default authApi
