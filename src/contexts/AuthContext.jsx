import React, { createContext, useState, useEffect, useContext } from 'react'
import { ROLES } from '../constants/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo')
    const token = localStorage.getItem('accessToken')
    if (storedUser && token) {
      setUserInfo(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (authData) => {
    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.setItem('userInfo', JSON.stringify(authData.userInfo))
    setUserInfo(authData.userInfo)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    setUserInfo(null)
  }

  const isAuthenticated = !!userInfo
  const role = userInfo?.role

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout, isAuthenticated, role }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { ROLES }
