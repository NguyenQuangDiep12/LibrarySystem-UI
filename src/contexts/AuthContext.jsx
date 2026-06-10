// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đọc lại dữ liệu đã lưu khi người dùng F5 hoặc tắt trình duyệt mở lại
    const storedUser = localStorage.getItem('userInfo');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUserInfo(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm login nhận tham số khớp chính xác với `LoginResponse` từ .NET (.data)
  const login = (authData) => {
    // authData sẽ có: { accessToken, userInfo }
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('userInfo', JSON.stringify(authData.userInfo));
    
    setUserInfo(authData.userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth phải được sử dụng bên trong một AuthProvider!');
  }
  return context;
};