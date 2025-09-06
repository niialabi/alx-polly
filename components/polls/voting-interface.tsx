"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Poll } from "@/types";
import {
  Vote as VoteIcon,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
} from "lucide-react";

interface VotingInterfaceProps {
  poll: Poll;
  onVote: (optionId: string) => Promise<void>;
  showResults?: boolean;
  isVoting?: boolean;
  hasVoted?: boolean;
  canVote?: boolean;
  className?: string;
}

export function VotingInterface({
  poll,
  onVote,
  showResults = false,
  isVoting = false,
  hasVoted = false,
  canVote = true,
  className = "",
}: VotingInterfaceProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const handleVote = async () => {
    if (!selectedOptionId || !onVote) return;

    try {
      await onVote(selectedOptionId);
      setSelectedOptionId("");
    } catch (error) {
      console.error("Voting error:", error);
    }
  };

  const getWinningOption = () => {
    if (poll.totalVotes === 0) return null;
    return poll.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );
  };

  const winningOption = getWinningOption();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl">{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>{poll.options.length} options</span>
            </div>
          </div>
          {hasVoted && (
            <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Voted</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Options */}
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = calculatePercentage(option.votes, poll.totalVotes);
            const isSelected = selectedOptionId === option.id;
            const isWinning = winningOption && option.id === winningOption.id;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {canVote && !hasVoted && !showResults && (
                      <input
                        type={poll.allowMultipleVotes ? "checkbox" : "radio"}
                        name={`poll-${poll.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={(e) => {
                          if (poll.allowMultipleVotes) {
                            // Handle multiple selection (future enhancement)
                            setSelectedOptionId(e.target.checked ? option.id : "");
                          } else {
                            setSelectedOptionId(e.target.value);
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        disabled={isVoting}
                      />
                    )}
                    <label
                      className={`flex-1 text-sm font-medium cursor-pointer ${
                        isSelected ? "text-primary" : ""
                      } ${showResults && isWinning ? "text-green-700 font-semibold" : ""}`}
                      onClick={() => {
                        if (canVote && !hasVoted && !showResults) {
                          setSelectedOptionId(option.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{option.text}</span>
                        {showResults && isWinning && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </label>
                  </div>

                  {showResults && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </span>
                      <span className="text-sm font-medium min-w-[3ch] text-right">
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Results */}
                {showResults && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isWinning
                          ? "bg-green-500"
                          : percentage > 0
                          ? "bg-primary"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {canVote && !hasVoted && !showResults && selectedOptionId && (
          <div className="pt-4">
            <Button
              onClick={handleVote}
              disabled={isVoting}
              className="w-full"
              size="lg"
            >
              {isVoting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Vote...
                </>
              ) : (
                <>
                  <VoteIcon className="h-4 w-4 mr-2" />
                  {poll.allowMultipleVotes ? "Submit Votes" : "Submit Vote"}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        {canVote && !hasVoted && !showResults && !selectedOptionId && (
          <div className="text-center py-4 text-muted-foreground">
            <VoteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {poll.allowMultipleVotes
                ? "Select one or more options above"
                : "Select an option above to cast your vote"}
            </p>
          </div>
        )}

        {/* Cannot Vote Messages */}
        {!canVote && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>You cannot vote on this poll.</span>
            </div>
          </div>
        )}

        {hasVoted && !showResults && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Thank you for voting! Results will be shown when available.</span>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {showResults && poll.totalVotes > 0 && (
          <div className="pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Poll Results
              </div>
              <div className="text-lg font-semibold">
                {poll.totalVotes} total {poll.totalVotes === 1 ? "vote" : "votes"}
              </div>
              {winningOption && (
                <div className="text-sm text-green-700 mt-1">
                  Leading: "{winningOption.text}" ({calculatePercentage(winningOption.votes, poll.totalVotes)}%)
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Votes Yet */}
        {showResults && poll.totalVotes === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No votes yet. Be the first to vote!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
