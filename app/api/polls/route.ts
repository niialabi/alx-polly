import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CreatePollData,
  Poll,
  ApiResponse,
  PaginatedResponse,
  PollFilters,
} from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    // Extract query parameters
    const search = searchParams.get("search") || "";
    const isActiveParam = searchParams.get("isActive");
    const creatorId = searchParams.get("creatorId");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build the query
    let query = supabase.from("polls").select(`
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
      `);

    // Apply search filter
    if (search) {
      query = query.ilike("question", `%${search}%`);
    }

    // Apply creator filter
    if (creatorId) {
      query = query.eq("user_id", creatorId);
    }

    // Apply active filter (check if poll hasn't expired)
    if (isActiveParam !== null) {
      const isActive = isActiveParam === "true";
      if (isActive) {
        query = query.or(
          "ends_at.is.null,ends_at.gt." + new Date().toISOString(),
        );
      } else {
        query = query.lt("ends_at", new Date().toISOString());
      }
    }

    // Apply sorting
    const dbSortBy =
      sortBy === "createdAt"
        ? "created_at"
        : sortBy === "updatedAt"
          ? "created_at"
          : "created_at";
    query = query.order(dbSortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: pollsData, error: pollsError, count } = await query;

    if (pollsError) {
      console.error("Supabase error:", pollsError);
      throw new Error(pollsError.message);
    }

    // Get vote counts for each poll
    const pollIds = pollsData?.map((poll) => poll.id) || [];
    let votesData: any[] = [];

    if (pollIds.length > 0) {
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("poll_id, option_id")
        .in("poll_id", pollIds);

      if (votesError) {
        console.error("Votes error:", votesError);
      } else {
        votesData = votes || [];
      }
    }

    // Transform data to match our Poll interface
    const transformedPolls: Poll[] =
      pollsData?.map((poll) => {
        const pollVotes = votesData.filter((vote) => vote.poll_id === poll.id);
        const totalVotes = pollVotes.length;

        const optionsWithVotes = poll.options.map((option) => {
          const optionVotes = pollVotes.filter(
            (vote) => vote.option_id === option.id,
          ).length;
          return {
            id: option.id,
            text: option.text,
            votes: optionVotes,
            pollId: option.poll_id,
          };
        });

        return {
          id: poll.id,
          title: poll.question,
          description: undefined, // Not in our current schema, but keeping for compatibility
          options: optionsWithVotes,
          creatorId: poll.user_id || "",
          creator: {
            id: poll.user_id || "",
            email: "",
            username: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isActive: poll.ends_at ? new Date(poll.ends_at) > new Date() : true,
          allowMultipleVotes: false, // Not in our current schema
          expiresAt: poll.ends_at ? new Date(poll.ends_at) : undefined,
          createdAt: new Date(poll.created_at),
          updatedAt: new Date(poll.created_at),
          totalVotes,
        };
      }) || [];

    const response: PaginatedResponse<Poll> = {
      success: true,
      data: transformedPolls,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get polls error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CreatePollData = await request.json();

    console.log("Creating poll with data:", {
      title: body.title,
      optionsCount: body.options?.length,
      hasDescription: !!body.description,
      allowMultipleVotes: body.allowMultipleVotes,
      expiresAt: body.expiresAt,
    });

    // Validate input
    if (!body.title || !body.options || body.options.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and at least 2 options are required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    if (body.title.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Title must be at least 5 characters long",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // Filter out empty options
    const validOptions = body.options.filter(
      (option) => option.trim().length > 0,
    );
    if (validOptions.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "At least 2 valid options are required",
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
    console.log("User context:", {
      userId,
      hasUser: !!user,
      authError: !!authError,
    });

    // Insert poll into database
    const pollInsertData = {
      question: body.title.trim(),
      ends_at: body.expiresAt ? body.expiresAt.toISOString() : null,
      user_id: userId,
    };
    console.log("Inserting poll with data:", pollInsertData);

    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .insert(pollInsertData)
      .select()
      .single();

    if (pollError) {
      console.error("Poll creation error:", pollError);
      console.error("Poll error details:", {
        code: pollError.code,
        details: pollError.details,
        hint: pollError.hint,
        message: pollError.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create poll: " + pollError.message,
        } as ApiResponse,
        { status: 500 },
      );
    }

    if (!pollData) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create poll: No data returned",
        } as ApiResponse,
        { status: 500 },
      );
    }

    // Insert options
    const optionsToInsert = validOptions.map((optionText) => ({
      poll_id: pollData.id,
      text: optionText.trim(),
    }));

    console.log("Inserting options:", optionsToInsert);

    const { data: optionsData, error: optionsError } = await supabase
      .from("options")
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      console.error("Options creation error:", optionsError);
      console.error("Options error details:", {
        code: optionsError.code,
        details: optionsError.details,
        hint: optionsError.hint,
        message: optionsError.message,
      });
      // Try to clean up the poll if options failed
      await supabase.from("polls").delete().eq("id", pollData.id);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create poll options: " + optionsError.message,
        } as ApiResponse,
        { status: 500 },
      );
    }

    // Create the poll response object
    const newPoll: Poll = {
      id: pollData.id,
      title: pollData.question,
      description: body.description,
      options: (optionsData || []).map((option) => ({
        id: option.id,
        text: option.text,
        votes: 0,
        pollId: option.poll_id,
      })),
      creatorId: pollData.user_id || "",
      creator: {
        id: pollData.user_id || "",
        email: user?.email || "",
        username: user?.user_metadata?.username || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isActive: pollData.ends_at
        ? new Date(pollData.ends_at) > new Date()
        : true,
      allowMultipleVotes: body.allowMultipleVotes,
      expiresAt: pollData.ends_at ? new Date(pollData.ends_at) : undefined,
      createdAt: new Date(pollData.created_at),
      updatedAt: new Date(pollData.created_at),
      totalVotes: 0,
    };

    return NextResponse.json(
      {
        success: true,
        data: newPoll,
        message: "Poll created successfully",
      } as ApiResponse<Poll>,
      { status: 201 },
    );
  } catch (error) {
    console.error("Create poll error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
