'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User, Organization } from './types'
import { mockUser, mockOrganizations } from './mock-data'

interface AuthContextType {
  user: User | null
  organization: Organization | null
  organizations: Organization[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  switchOrganization: (orgId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({ ...mockUser, email })
    setOrganization(mockOrganizations[0])
    setIsLoading(false)
  }, [])

  const register = useCallback(async (email: string, username: string, _password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({ ...mockUser, email, username })
    setOrganization(mockOrganizations[0])
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setOrganization(null)
  }, [])

  const switchOrganization = useCallback((orgId: string) => {
    const org = mockOrganizations.find(o => o.id === orgId)
    if (org) {
      setOrganization(org)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations: mockOrganizations,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
