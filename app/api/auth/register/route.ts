import { NextRequest, NextResponse } from "next/server";
import { RegisterData, ApiResponse, AuthUser } from "@/types";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided email, username, and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterData'
 *     responses:
 *       '201':
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse_AuthUser'
 *       '400':
 *         description: Bad request due to missing fields, password mismatch, or invalid password length.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * Handles the POST request for user registration.
 *
 * @param {NextRequest} request - The incoming Next.js API request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RegisterData = await request.json();

    // TODO: Implement actual registration logic
    // This is a placeholder implementation

    // Validate input
    if (
      !body.email ||
      !body.username ||
      !body.password ||
      !body.confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords do not match",
        } as ApiResponse,
        { status: 400 },
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // TODO: Check if user already exists in database
    // TODO: Hash password before storing
    // TODO: Store user in database
    // For now, we'll simulate a successful registration

    const mockUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: body.email,
      username: body.username,
      token: "mock_jwt_token_" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        data: mockUser,
        message: "Registration successful",
      } as ApiResponse<AuthUser>,
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
