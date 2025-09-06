import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: pollId } = await params;
    const body = await request.json();
    const { optionId } = body;

    if (!pollId || !optionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll ID and option ID are required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Get current user (if authenticated)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
    }

    const userId = user?.id || null;

    // Verify the poll exists and is active
    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .select("id, ends_at")
      .eq("id", pollId)
      .single();

    if (pollError || !pollData) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll not found",
        } as ApiResponse,
        { status: 404 },
      );
    }

    // Check if poll has expired
    if (pollData.ends_at && new Date(pollData.ends_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "This poll has expired",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Verify the option belongs to this poll
    const { data: optionData, error: optionError } = await supabase
      .from("options")
      .select("id, poll_id")
      .eq("id", optionId)
      .eq("poll_id", pollId)
      .single();

    if (optionError || !optionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid option for this poll",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // For authenticated users, check if they've already voted
    if (userId) {
      const { data: existingVote, error: voteCheckError } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", userId)
        .eq("poll_id", pollId)
        .single();

      if (voteCheckError && voteCheckError.code !== "PGRST116") {
        console.error("Vote check error:", voteCheckError);
        throw new Error("Error checking existing vote");
      }

      if (existingVote) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already voted on this poll",
          } as ApiResponse,
          { status: 400 },
        );
      }
    }

    // Insert the vote
    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      })
      .select()
      .single();

    if (voteError) {
      console.error("Vote insertion error:", voteError);

      // Check if it's a unique constraint violation (user already voted)
      if (voteError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "You have already voted on this poll",
          } as ApiResponse,
          { status: 400 },
        );
      }

      throw new Error("Failed to record vote");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Vote recorded successfully",
        data: {
          voteId: voteData.id,
          pollId: pollId,
          optionId: optionId,
        },
      } as ApiResponse,
      { status: 201 },
    );
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
