"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePollForm } from "@/components/polls/create-poll-form";
import { CreatePollData, ApiResponse, Poll } from "@/types";

export default function CreatePollPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  const handleCreatePoll = async (data: CreatePollData) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Poll> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create poll");
      }

      if (result.success && result.data) {
        // Show success message and redirect to polls listing
        setSuccess("Poll created successfully! Redirecting to polls page...");
        setTimeout(() => {
          router.push("/polls");
          router.refresh();
        }, 2500);
      } else {
        throw new Error(result.error || "Invalid response from server");
      }
    } catch (error) {
      console.error("Create poll error:", error);

      let errorMessage = "An unexpected error occurred";

      if (error instanceof Error) {
        if (error.message.includes("NEXT_PUBLIC_SUPABASE")) {
          errorMessage =
            "Supabase is not configured. Please check your environment variables.";
        } else if (error.message.includes("Failed to create poll")) {
          errorMessage = error.message;
        } else if (error.message.includes("Internal server error")) {
          errorMessage =
            "Server error occurred. Please try again or check the server logs.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Poll</h1>
          <p className="text-muted-foreground">
            Create a poll to gather opinions and feedback from your audience.
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium">Poll Created Successfully!</div>
                <div className="mt-1 text-sm">{success}</div>
                <div className="mt-2">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full animate-pulse"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => router.push("/polls")}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md font-medium transition-colors"
                  >
                    View All Polls
                  </button>
                  <button
                    onClick={() => {
                      setSuccess("");
                      setError("");
                    }}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md font-medium transition-colors"
                  >
                    Create Another Poll
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <div className="font-medium">Error creating poll</div>
            <div className="mt-1">{error}</div>
            {error.includes("environment variables") && (
              <div className="mt-3 text-sm">
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>
                    Create a{" "}
                    <code className="bg-red-100 px-1 rounded">.env.local</code>{" "}
                    file in your project root
                  </li>
                  <li>Add your Supabase URL and API key</li>
                  <li>Restart your development server</li>
                </ol>
                <div className="mt-3 pt-2 border-t border-red-300">
                  <a
                    href="/diagnostics"
                    className="text-red-800 hover:text-red-900 underline font-medium"
                  >
                    → Run system diagnostics for detailed troubleshooting
                  </a>
                </div>
              </div>
            )}
            {!error.includes("environment variables") && (
              <div className="mt-3 pt-2 border-t border-red-300">
                <a
                  href="/diagnostics"
                  className="text-red-800 hover:text-red-900 underline font-medium text-sm"
                >
                  → Run system diagnostics to troubleshoot this issue
                </a>
              </div>
            )}
          </div>
        )}

        <CreatePollForm
          onSubmit={handleCreatePoll}
          isLoading={isLoading || !!success}
          onSuccess={() => {
            // Form will be reset automatically by the component
          }}
        />
      </div>
    </div>
  );
}
