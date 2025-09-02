"use client"

import { useState, useEffect } from "react"
import { PollCard } from "@/components/polls/poll-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Poll, PollFilters, PaginatedResponse } from "@/types"
import { Search, Filter, Plus } from "lucide-react"
import Link from "next/link"

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string>("")
  const [filters, setFilters] = useState<PollFilters>({
    search: "",
    isActive: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchPolls = async () => {
    setIsLoading(true)
    setError("")

    try {
      const searchParams = new URLSearchParams()

      if (filters.search) searchParams.append("search", filters.search)
      if (filters.isActive !== undefined) searchParams.append("isActive", filters.isActive.toString())
      if (filters.sortBy) searchParams.append("sortBy", filters.sortBy)
      if (filters.sortOrder) searchParams.append("sortOrder", filters.sortOrder)

      const response = await fetch(`/api/polls?${searchParams.toString()}`)
      const result: PaginatedResponse<Poll> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch polls")
      }

      if (result.success && result.data) {
        setPolls(result.data)
      }
    } catch (error) {
      console.error("Error fetching polls:", error)
      setError(error instanceof Error ? error.message : "Failed to load polls")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [filters])

  const handleVote = async (pollId: string, optionId: string) => {
    setIsVoting(prev => ({ ...prev, [pollId]: true }))

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ optionId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to vote")
      }

      // Refresh the polls to show updated vote counts
      await fetchPolls()
    } catch (error) {
      console.error("Error voting:", error)
      // You might want to show a toast notification here
    } finally {
      setIsVoting(prev => ({ ...prev, [pollId]: false }))
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  const handleFilterChange = (key: keyof PollFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Polls</h1>
            <p className="text-muted-foreground mt-2">
              Browse and participate in community polls
            </p>
          </div>
          <Button asChild>
            <Link href="/create-poll">
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search polls..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={filters.isActive === undefined ? "" : filters.isActive.toString()}
                  onChange={(e) => handleFilterChange("isActive",
                    e.target.value === "" ? undefined : e.target.value === "true"
                  )}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">All polls</option>
                  <option value="true">Active only</option>
                  <option value="false">Inactive only</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Sort by</Label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="createdAt">Created date</option>
                  <option value="updatedAt">Last updated</option>
                  <option value="totalVotes">Vote count</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value as "asc" | "desc")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Polls List */}
        {!isLoading && (
          <div className="space-y-6">
            {polls.length > 0 ? (
              polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={handleVote}
                  isVoting={isVoting[poll.id] || false}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {filters.search ? "No polls found matching your search." : "No polls available yet."}
                </div>
                <Button asChild>
                  <Link href="/create-poll">
                    <Plus className="h-4 w-4 mr-2" />
                    Create the first poll
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
