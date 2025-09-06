"use client";

import { useState, useEffect } from "react";
import { PollCard } from "@/components/polls/poll-card";
import { EditPollDialog } from "@/components/polls/edit-poll-dialog";
import { DeletePollDialog } from "@/components/polls/delete-poll-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Poll, ApiResponse, PaginatedResponse } from "@/types";
import { Plus, BarChart3, Users, Vote, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/auth-context";

export default function DashboardPage() {
  const [userPolls, setUserPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user: currentUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    totalViews: 0,
  });

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchUserPolls = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!currentUser) {
        setError("Please log in to view your polls");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/polls`);
      const result: PaginatedResponse<Poll> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch your polls");
      }

      if (result.success && result.data) {
        setUserPolls(result.data);

        // Calculate stats
        const totalPolls = result.data.length;
        const totalVotes = result.data.reduce(
          (sum, poll) => sum + poll.totalVotes,
          0,
        );
        const activePolls = result.data.filter((poll) => poll.isActive).length;
        const totalViews = result.data.reduce(
          (sum, poll) => sum + poll.totalVotes * 2,
          0,
        ); // Mock view calculation

        setStats({
          totalPolls,
          totalVotes,
          activePolls,
          totalViews,
        });
      }
    } catch (error) {
      console.error("Error fetching user polls:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load your polls",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchUserPolls();
    } else if (!authLoading && !currentUser) {
      setIsLoading(false);
      setError("Please log in to view your dashboard");
    }
  }, [currentUser, authLoading]);

  const handleVote = async (pollId: string, optionId: string) => {
    // Users shouldn't be able to vote on their own polls
    // This is just to maintain consistency with the PollCard component
    return;
  };

  const handleEditPoll = (poll: Poll) => {
    setSelectedPoll(poll);
    setEditDialogOpen(true);
  };

  const handleDeletePoll = (pollId: string) => {
    const poll = userPolls.find((p) => p.id === pollId);
    if (poll) {
      setSelectedPoll(poll);
      setDeleteDialogOpen(true);
    }
  };

  const handleSaveEdit = async (
    pollId: string,
    data: { title: string; expiresAt?: Date },
  ) => {
    setIsEditLoading(true);

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update poll");
      }

      // Refresh the polls list
      await fetchUserPolls();
      setEditDialogOpen(false);
      setSelectedPoll(null);
    } catch (error) {
      console.error("Error updating poll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update poll",
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleConfirmDelete = async (pollId: string) => {
    setIsDeleteLoading(true);

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete poll");
      }

      // Refresh the polls list
      await fetchUserPolls();
      setDeleteDialogOpen(false);
      setSelectedPoll(null);
    } catch (error) {
      console.error("Error deleting poll:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete poll",
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getRecentActivity = () => {
    return userPolls
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 3);
  };

  // Show loading state while checking auth
  if (authLoading || (isLoading && currentUser)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Welcome to ALX Polly</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to create polls, track responses, and manage your polling
          campaigns.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back
            {currentUser ? `, ${currentUser.email?.split("@")[0]}` : ""}!
          </h1>
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
            <p className="text-xs text-muted-foreground">Across all polls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolls}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Poll page visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="font-medium">Error loading dashboard</div>
          <div className="mt-1">{error}</div>
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
              <h2 className="text-2xl font-semibold">Your Polls</h2>
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
                    canEdit={true}
                    currentUserId={currentUser?.id}
                    onEdit={handleEditPoll}
                    onDelete={handleDeletePoll}
                  />
                ))}
                {userPolls.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/polls">
                        View all {userPolls.length} polls
                      </Link>
                    </Button>
                  </div>
                )}
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

            {/* Stats Summary */}
            {stats.totalPolls > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-medium text-green-800 mb-1">
                      Engagement Rate
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {stats.totalPolls > 0
                        ? Math.round(stats.totalVotes / stats.totalPolls)
                        : 0}
                    </div>
                    <div className="text-xs text-green-600">
                      Average votes per poll
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="font-medium text-blue-800 mb-1">
                      Most Popular Poll
                    </div>
                    <div className="text-sm text-blue-700">
                      {userPolls.length > 0
                        ? userPolls
                            .reduce((prev, current) =>
                              prev.totalVotes > current.totalVotes
                                ? prev
                                : current,
                            )
                            .title.slice(0, 30) +
                          (userPolls.reduce((prev, current) =>
                            prev.totalVotes > current.totalVotes
                              ? prev
                              : current,
                          ).title.length > 30
                            ? "..."
                            : "")
                        : "No polls yet"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Engage Your Audience</p>
                  <p className="text-muted-foreground">
                    Ask compelling questions that encourage participation and
                    discussion.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Set Clear Options</p>
                  <p className="text-muted-foreground">
                    Make sure your poll options are distinct and cover all
                    likely responses.
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">Share Widely</p>
                  <p className="text-muted-foreground">
                    The more people who see your poll, the more valuable
                    insights you'll gather.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Poll Dialog */}
      <EditPollDialog
        poll={selectedPoll}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedPoll(null);
        }}
        onSave={handleSaveEdit}
        isLoading={isEditLoading}
      />

      {/* Delete Poll Dialog */}
      <DeletePollDialog
        poll={selectedPoll}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedPoll(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
