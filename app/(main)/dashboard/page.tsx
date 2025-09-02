"use client"

import { useState, useEffect } from "react"
import { PollCard } from "@/components/polls/poll-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Poll, User, ApiResponse, PaginatedResponse } from "@/types"
import { Plus, BarChart3, Users, Vote, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [userPolls, setUserPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    totalViews: 0,
  })

  // Mock user data - in real app this would come from auth context
  const user: User = {
    id: "1",
    email: "demo@example.com",
    username: "demo_user",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const fetchUserPolls = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/polls?creatorId=${user.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      const result: PaginatedResponse<Poll> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch your polls")
      }

      if (result.success && result.data) {
        setUserPolls(result.data)

        // Calculate stats
        const totalPolls = result.data.length
        const totalVotes = result.data.reduce((sum, poll) => sum + poll.totalVotes, 0)
        const activePolls = result.data.filter(poll => poll.isActive).length
        const totalViews = result.data.reduce((sum, poll) => sum + (poll.totalVotes * 2), 0) // Mock view calculation

        setStats({
          totalPolls,
          totalVotes,
          activePolls,
          totalViews,
        })
      }
    } catch (error) {
      console.error("Error fetching user polls:", error)
      setError(error instanceof Error ? error.message : "Failed to load your polls")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPolls()
  }, [])

  const handleVote = async (pollId: string, optionId: string) => {
    // Users shouldn't be able to vote on their own polls
    // This is just to maintain consistency with the PollCard component
    return
  }

  const getRecentActivity = () => {
    return userPolls
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your polls
          </p>
        </div>
        <Button asChild>
          <Link href="/create-poll">
            <Plus className="h-4 w-4 mr-2" />
            Create New Poll
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPolls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePolls} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              Across all polls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolls}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Poll page visits
            </p>
          </CardContent>
        </Card>
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

      {/* Content */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              <Button variant="outline" asChild>
                <Link href="/polls">View All Polls</Link>
              </Button>
            </div>

            {getRecentActivity().length > 0 ? (
              <div className="space-y-6">
                {getRecentActivity().map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    onVote={handleVote}
                    showResults={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first poll to start gathering opinions!
                  </p>
                  <Button asChild>
                    <Link href="/create-poll">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Poll
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you might want to perform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/create-poll">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Poll
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/polls">
                    <Vote className="h-4 w-4 mr-2" />
                    Browse All Polls
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Engage Your Audience</p>
                  <p className="text-muted-foreground">
                    Ask compelling questions that encourage participation and discussion.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Set Clear Options</p>
                  <p className="text-muted-foreground">
                    Make sure your poll options are distinct and cover all likely responses.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Share Widely</p>
                  <p className="text-muted-foreground">
                    The more people who see your poll, the more valuable insights you'll gather.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
