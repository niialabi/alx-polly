"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreatePollForm } from "@/components/polls/create-poll-form"
import { CreatePollData, ApiResponse, Poll } from "@/types"

export default function CreatePollPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  const handleCreatePoll = async (data: CreatePollData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<Poll> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create poll")
      }

      if (result.success && result.data) {
        // Redirect to the newly created poll
        router.push(`/polls/${result.data.id}`)
        router.refresh()
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Create poll error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Poll</h1>
          <p className="text-muted-foreground">
            Create a poll to gather opinions and feedback from your audience.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <CreatePollForm onSubmit={handleCreatePoll} isLoading={isLoading} />
      </div>
    </div>
  )
}
