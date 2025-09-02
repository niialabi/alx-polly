import { NextRequest, NextResponse } from "next/server"
import { CreatePollData, Poll, ApiResponse, PaginatedResponse, PollFilters } from "@/types"

// Mock data for demonstration
const mockPolls: Poll[] = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community's preferred programming languages",
    options: [
      { id: "1", text: "JavaScript", votes: 45, pollId: "1" },
      { id: "2", text: "Python", votes: 38, pollId: "1" },
      { id: "3", text: "TypeScript", votes: 32, pollId: "1" },
      { id: "4", text: "Go", votes: 18, pollId: "1" },
    ],
    creatorId: "1",
    creator: {
      id: "1",
      email: "demo@example.com",
      username: "demo_user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    isActive: true,
    allowMultipleVotes: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(),
    totalVotes: 133,
  },
  {
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find the optimal time slot that works for everyone",
    options: [
      { id: "5", text: "9:00 AM", votes: 12, pollId: "2" },
      { id: "6", text: "2:00 PM", votes: 28, pollId: "2" },
      { id: "7", text: "4:00 PM", votes: 15, pollId: "2" },
    ],
    creatorId: "1",
    creator: {
      id: "1",
      email: "demo@example.com",
      username: "demo_user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    isActive: true,
    allowMultipleVotes: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(),
    totalVotes: 55,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const search = searchParams.get("search") || ""
    const isActiveParam = searchParams.get("isActive")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Filter polls based on parameters
    let filteredPolls = [...mockPolls]

    if (search) {
      filteredPolls = filteredPolls.filter(poll =>
        poll.title.toLowerCase().includes(search.toLowerCase()) ||
        poll.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (isActiveParam !== null) {
      const isActive = isActiveParam === "true"
      filteredPolls = filteredPolls.filter(poll => poll.isActive === isActive)
    }

    // Sort polls
    filteredPolls.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Poll]
      let bValue: any = b[sortBy as keyof Poll]

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPolls = filteredPolls.slice(startIndex, endIndex)

    const response: PaginatedResponse<Poll> = {
      success: true,
      data: paginatedPolls,
      meta: {
        page,
        limit,
        total: filteredPolls.length,
        totalPages: Math.ceil(filteredPolls.length / limit),
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Get polls error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement authentication middleware
    // For now, we'll assume the user is authenticated

    const body: CreatePollData = await request.json()

    // Validate input
    if (!body.title || !body.options || body.options.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and at least 2 options are required",
        } as ApiResponse,
        { status: 400 }
      )
    }

    if (body.title.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Title must be at least 5 characters long",
        } as ApiResponse,
        { status: 400 }
      )
    }

    // TODO: Get actual user from authentication
    const mockUser = {
      id: "1",
      email: "demo@example.com",
      username: "demo_user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create new poll
    const newPoll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      title: body.title,
      description: body.description,
      options: body.options.map((optionText, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        text: optionText,
        votes: 0,
        pollId: "", // Will be set after poll creation
      })),
      creatorId: mockUser.id,
      creator: mockUser,
      isActive: true,
      allowMultipleVotes: body.allowMultipleVotes,
      expiresAt: body.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalVotes: 0,
    }

    // Set pollId for options
    newPoll.options.forEach(option => {
      option.pollId = newPoll.id
    })

    // TODO: Save to database
    mockPolls.unshift(newPoll)

    return NextResponse.json(
      {
        success: true,
        data: newPoll,
        message: "Poll created successfully",
      } as ApiResponse<Poll>,
      { status: 201 }
    )
  } catch (error) {
    console.error("Create poll error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 }
    )
  }
}
