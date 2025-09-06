import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Poll, ApiResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: pollId } = await params;

    if (!pollId) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll ID is required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Fetch poll with options
    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .select(
        `
        id,
        question,
        created_at,
        ends_at,
        user_id,
        options (
          id,
          text,
          poll_id
        )
      `,
      )
      .eq("id", pollId)
      .single();

    if (pollError) {
      if (pollError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Poll not found",
          } as ApiResponse,
          { status: 404 },
        );
      }
      console.error("Supabase error:", pollError);
      throw new Error(pollError.message);
    }

    if (!pollData) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll not found",
        } as ApiResponse,
        { status: 404 },
      );
    }

    // Get vote counts for this poll
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("poll_id, option_id")
      .eq("poll_id", pollId);

    if (votesError) {
      console.error("Votes error:", votesError);
    }

    const votes = votesData || [];
    const totalVotes = votes.length;

    // Calculate vote counts per option
    const optionsWithVotes = pollData.options.map((option) => {
      const optionVotes = votes.filter(
        (vote) => vote.option_id === option.id,
      ).length;
      return {
        id: option.id,
        text: option.text,
        votes: optionVotes,
        pollId: option.poll_id,
      };
    });

    // Transform data to match our Poll interface
    const poll: Poll = {
      id: pollData.id,
      title: pollData.question,
      description: undefined, // Not in our current schema
      options: optionsWithVotes,
      creatorId: pollData.user_id || "",
      creator: {
        id: pollData.user_id || "",
        email: "",
        username: "Anonymous",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isActive: pollData.ends_at
        ? new Date(pollData.ends_at) > new Date()
        : true,
      allowMultipleVotes: false, // Not in our current schema
      expiresAt: pollData.ends_at ? new Date(pollData.ends_at) : undefined,
      createdAt: new Date(pollData.created_at),
      updatedAt: new Date(pollData.created_at),
      totalVotes,
    };

    return NextResponse.json(
      {
        success: true,
        data: poll,
      } as ApiResponse<Poll>,
      { status: 200 },
    );
  } catch (error) {
    console.error("Get poll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: pollId } = await params;
    const body = await request.json();

    if (!pollId) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll ID is required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        } as ApiResponse,
        { status: 401 },
      );
    }

    // Verify user owns this poll
    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .select("user_id")
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

    if (pollData.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only edit your own polls",
        } as ApiResponse,
        { status: 403 },
      );
    }

    // Update poll
    const { data: updatedPoll, error: updateError } = await supabase
      .from("polls")
      .update({
        question: body.title?.trim(),
        ends_at: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
      })
      .eq("id", pollId)
      .select()
      .single();

    if (updateError) {
      console.error("Poll update error:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update poll: " + updateError.message,
        } as ApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Poll updated successfully",
        data: updatedPoll,
      } as ApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("Update poll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: pollId } = await params;

    if (!pollId) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll ID is required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        } as ApiResponse,
        { status: 401 },
      );
    }

    // Verify user owns this poll
    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .select("user_id")
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

    if (pollData.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only delete your own polls",
        } as ApiResponse,
        { status: 403 },
      );
    }

    // Delete poll (cascade will handle options and votes)
    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId);

    if (deleteError) {
      console.error("Poll deletion error:", deleteError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete poll: " + deleteError.message,
        } as ApiResponse,
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Poll deleted successfully",
      } as ApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete poll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
