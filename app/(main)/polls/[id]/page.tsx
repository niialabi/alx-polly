"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PollCard } from "@/components/polls/poll-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Poll, ApiResponse } from "@/types"
import { ArrowLeft, Share2, BarChart3, Copy, Check } from "lucide-react"
import Link from "next/link"
import { copyToClipboard, shareUrl, formatDate, formatRelativeTime } from "@/lib/utils"

export default function PollPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = params.id as string

  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string>("")
  const [showResults, setShowResults] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchPoll = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/polls/${pollId}`)
      const result: ApiResponse<Poll> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch poll")
      }

      if (result.success && result.data) {
        setPoll(result.data)
        // Show results if poll is inactive or expired
        const isExpired = result.data.expiresAt && new Date(result.data.expiresAt) < new Date()
        setShowResults(!result.data.isActive || !!isExpired)
      } else {
        throw new Error("Poll not found")
      }
    } catch (error) {
      console.error("Error fetching poll:", error)
      setError(error instanceof Error ? error.message : "Failed to load poll")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
  }, [pollId])

  const handleVote = async (pollId: string, optionId: string) => {
    setIsVoting(true)

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

      // Refresh the poll to show updated results
      await fetchPoll()
      setShowResults(true)
    } catch (error) {
      console.error("Error voting:", error)
      setError(error instanceof Error ? error.message : "Failed to submit vote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = poll ? `Check out this poll: ${poll.title}` : "Check out this poll"

    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await copyToClipboard(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const toggleResults = () => {
    setShowResults(!showResults)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Poll Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The poll you're looking for doesn't exist or has been removed."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button asChild>
                <Link href="/polls">Browse Polls</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()
  const canVote = poll.isActive && !isExpired && !showResults

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleResults}
            disabled={!poll.isActive && !isExpired}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showResults ? "Hide Results" : "Show Results"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Poll Card */}
      <PollCard
        poll={poll}
        onVote={handleVote}
        showResults={showResults}
        isVoting={isVoting}
      />

      {/* Poll Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poll Information */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {poll.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{poll.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(poll.createdAt))} ({formatRelativeTime(new Date(poll.createdAt))})
                  </p>
                </div>

                {poll.expiresAt && (
                  <div>
                    <h4 className="font-medium mb-1">Expires</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(poll.expiresAt))}
                      {!isExpired && ` (${formatRelativeTime(new Date(poll.expiresAt))})`}
                      {isExpired && " (Expired)"}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-1">Vote Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {poll.allowMultipleVotes ? "Multiple choice" : "Single choice"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      poll.isActive && !isExpired
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {poll.isActive && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Instructions */}
          {canVote && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">How to Vote</h4>
                    <p className="text-sm text-muted-foreground">
                      {poll.allowMultipleVotes
                        ? "You can select multiple options that apply to you."
                        : "Select one option that best represents your choice."
                      } Click "Submit Vote" when you're ready.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {poll.creator.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{poll.creator.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {formatRelativeTime(new Date(poll.creator.createdAt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poll Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Votes</span>
                <span className="font-medium">{poll.totalVotes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Options</span>
                <span className="font-medium">{poll.options.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Active</span>
                <span className="font-medium">
                  {Math.ceil((new Date().getTime() - new Date(poll.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Poll
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/polls">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Browse More Polls
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
