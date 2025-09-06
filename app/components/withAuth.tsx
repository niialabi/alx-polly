"use client"

import { useAuth } from "@/app/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const Wrapper = (props: P) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace("/login")
      }
    }, [user, isLoading, router])

    if (isLoading) {
      return <div>Loading...</div> // Or a spinner component
    }

    if (!user) {
      return null // Render nothing while redirecting
    }

    return <WrappedComponent {...props} />
  }

  return Wrapper
}

export default withAuth
