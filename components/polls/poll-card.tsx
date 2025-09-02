"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Poll } from "@/types"
import { formatRelativeTime, calculatePercentage, truncateText } from "@/lib/utils"
import Link from "next/link"

interface PollCardProps {
  poll: Poll
  onVote?: (pollId: string, optionId: string) => Promise<void>
  showResults?: boolean
  isVoting?: boolean
}

export function PollCard({
  poll,
  onVote,
  showResults = false,
  isVoting = false
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")

  const handleVote = async () => {
    if (!selectedOption || !onVote) return

    try {
      await onVote(poll.id, selectedOption)
      setSelectedOption("")
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date()
  const canVote = poll.isActive && !isExpired && !showResults

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              <Link
                href={`/polls/${poll.id}`}
                className="hover:text-primary transition-colors"
              >
                {poll.title}
              </Link>
            </CardTitle>
            {poll.description && (
              <CardDescription className="text-base">
                {truncateText(poll.description, 150)}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {!poll.isActive && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                Inactive
              </span>
            )}
            {isExpired && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                Expired
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = calculatePercentage(option.votes, poll.totalVotes)
            const isSelected = selectedOption === option.id

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {canVote && (
                      <input
                        type={poll.allowMultipleVotes ? "checkbox" : "radio"}
                        name={`poll-${poll.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) => {
                          if (poll.allowMultipleVotes) {
                            // Handle multiple selection logic
                            setSelectedOption(e.target.checked ? option.id : "")
                          } else {
                            setSelectedOption(e.target.value)
                          }
                        }}
                        className="h-4 w-4"
                        disabled={isVoting}
                      />
                    )}
                    <label
                      className={`flex-1 text-sm ${canVote ? 'cursor-pointer' : ''}`}
                      htmlFor={`option-${option.id}`}
                    >
                      {option.text}
                    </label>
                  </div>
                  {showResults && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {option.votes} votes
                      </span>
                      <span className="text-sm font-medium">
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {showResults && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {canVote && selectedOption && (
          <Button
            onClick={handleVote}
            disabled={isVoting}
            className="w-full"
          >
            {isVoting ? "Voting..." : "Submit Vote"}
          </Button>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>By {poll.creator.username}</span>
          <span>{poll.totalVotes} total votes</span>
        </div>
        <div className="flex items-center space-x-4">
          {poll.expiresAt && (
            <span>
              Expires {formatRelativeTime(new Date(poll.expiresAt))}
            </span>
          )}
          <span>{formatRelativeTime(new Date(poll.createdAt))}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
