"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Poll, ApiResponse } from "@/types";
import {
  ArrowLeft,
  Share2,
  BarChart3,
  Check,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Vote as VoteIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/auth-context";

export default function PollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [hasUserVoted, setHasUserVoted] = useState(false);

  const fetchPoll = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/polls/${pollId}`);
      const result: ApiResponse<Poll> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch poll");
      }

      if (result.success && result.data) {
        setPoll(result.data);
        // Check if poll is expired
        const isExpired =
          result.data.expiresAt && new Date(result.data.expiresAt) < new Date();

        // Show results if expired or inactive
        if (!result.data.isActive || isExpired) {
          setShowResults(true);
        }
      } else {
        throw new Error("Poll not found");
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
      setError(error instanceof Error ? error.message : "Failed to load poll");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOptionId || !poll) return;

    setIsVoting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId: selectedOptionId }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to vote");
      }

      setSuccess("Your vote has been recorded successfully!");
      setHasUserVoted(true);
      setShowResults(true);
      setSelectedOptionId("");

      // Refresh poll data to show updated vote counts
      await fetchPoll();
    } catch (error) {
      console.error("Error voting:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit vote",
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = poll ? `Vote on: ${poll.title}` : "Check out this poll";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setSuccess("Poll link copied to clipboard!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Poll Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error ||
                "The poll you're looking for doesn't exist or has been removed."}
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
    );
  }

  if (!poll) return null;

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const canVote = poll.isActive && !isExpired && !hasUserVoted && !showResults;
  const isOwner = user && poll.creatorId === user.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {poll.totalVotes > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleResults}
              disabled={!poll.isActive && isExpired}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showResults ? "Hide Results" : "Show Results"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Poll Status Banner */}
      {!poll.isActive || isExpired ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              This poll is {!poll.isActive ? "inactive" : "expired"} and no
              longer accepting votes.
            </span>
          </div>
        </div>
      ) : null}

      {/* Owner Notice */}
      {isOwner && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <VoteIcon className="h-5 w-5 mr-2" />
            <span>
              This is your poll. You cannot vote on polls you created.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Poll Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poll Question and Voting */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="text-base">
                      {poll.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      poll.isActive && !isExpired
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {poll.isActive && !isExpired
                      ? "Active"
                      : isExpired
                        ? "Expired"
                        : "Inactive"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Voting Options */}
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = calculatePercentage(
                    option.votes,
                    poll.totalVotes,
                  );
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {canVote && !isOwner && (
                            <input
                              type="radio"
                              name={`poll-${poll.id}`}
                              value={option.id}
                              checked={isSelected}
                              onChange={(e) =>
                                setSelectedOptionId(e.target.value)
                              }
                              className="h-4 w-4 text-primary focus:ring-primary"
                              disabled={isVoting}
                            />
                          )}
                          <label
                            className={`flex-1 text-sm font-medium ${
                              canVote && !isOwner ? "cursor-pointer" : ""
                            } ${isSelected ? "text-primary" : ""}`}
                            onClick={() => {
                              if (canVote && !isOwner) {
                                setSelectedOptionId(option.id);
                              }
                            }}
                          >
                            {option.text}
                          </label>
                        </div>
                        {showResults && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {option.votes} votes
                            </span>
                            <span className="text-sm font-medium min-w-[3ch] text-right">
                              {percentage}%
                            </span>
                          </div>
                        )}
                      </div>

                      {showResults && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vote Button */}
              {canVote && !isOwner && selectedOptionId && (
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
                        Submit Vote
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Voting Instructions */}
              {canVote && !isOwner && !selectedOptionId && (
                <div className="text-center py-4 text-muted-foreground">
                  <VoteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an option above to cast your vote</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Poll Statistics */}
          {poll.totalVotes > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Vote Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {poll.totalVotes}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Votes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {poll.options.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Options</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.max(...poll.options.map((o) => o.votes))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Highest Votes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {poll.totalVotes > 0
                        ? Math.round(
                            (Math.max(...poll.options.map((o) => o.votes)) /
                              poll.totalVotes) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leading Option
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Poll Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Poll Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatRelativeTime(new Date(poll.createdAt))}
                  </div>
                </div>
              </div>

              {poll.expiresAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">
                      {isExpired ? "Expired" : "Expires"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(poll.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Participation</div>
                  <div className="text-sm text-muted-foreground">
                    {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {poll.creator.username?.charAt(0)?.toUpperCase() ||
                      poll.creator.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {poll.creator.username ||
                      poll.creator.email?.split("@")[0] ||
                      "Anonymous"}
                  </p>
                  <p className="text-sm text-muted-foreground">Poll Creator</p>
                </div>
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
                <Share2 className="h-4 w-4 mr-2" />
                Share Poll
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/polls">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Browse More Polls
                </Link>
              </Button>

              {isOwner && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard">
                    <VoteIcon className="h-4 w-4 mr-2" />
                    Manage My Polls
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Vote Distribution (if results are shown) */}
          {showResults && poll.totalVotes > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.options
                    .sort((a, b) => b.votes - a.votes)
                    .map((option, index) => {
                      const percentage = calculatePercentage(
                        option.votes,
                        poll.totalVotes,
                      );
                      return (
                        <div
                          key={option.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                index === 0
                                  ? "bg-green-500"
                                  : index === 1
                                    ? "bg-blue-500"
                                    : index === 2
                                      ? "bg-yellow-500"
                                      : "bg-gray-400"
                              }`}
                            />
                            <span className="text-sm font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {option.votes} votes
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
