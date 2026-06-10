import axiosClient from "./axiosClient";

const authApi = {
    // Gui toi request POST /api/auth/login
    login: (loginData) => axiosClient.post("/auth/login", loginData),

   // DTO: { fullName, email, password, phone }
  register: (data) => axiosClient.post('/auth/register', data),
  
  // DTO: { email }
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
  
  // DTO: { email, otp }
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
};

export default authApi;