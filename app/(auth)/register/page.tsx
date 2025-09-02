"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { RegisterData, ApiResponse, AuthUser } from "@/types"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<AuthUser> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      if (result.success && result.data) {
        // Store auth token (you might want to use a more secure method)
        localStorage.setItem("auth_token", result.data.token)

        // Redirect to dashboard or home page
        router.push("/dashboard")
        router.refresh()
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
      </div>
    </div>
  )
}
