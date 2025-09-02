"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Header } from "@/components/layout/header"
import { User } from "@/types"

interface AuthContextType {
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      // TODO: Validate token with server and get user data
      // For now, we'll simulate a logged-in user
      const mockUser: User = {
        id: "1",
        email: "demo@example.com",
        username: "demo_user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setUser(mockUser)
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
