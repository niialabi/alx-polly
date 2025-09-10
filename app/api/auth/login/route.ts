import { NextRequest, NextResponse } from "next/server";
import { LoginData, ApiResponse, AuthUser } from "@/types";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user with their email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginData'
 *     responses:
 *       '200':
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse_AuthUser'
 *       '400':
 *         description: Bad request due to missing email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '401':
 *         description: Unauthorized due to invalid credentials.
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
 * Handles the POST request for user login.
 *
 * @param {NextRequest} request - The incoming Next.js API request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginData = await request.json();

    // TODO: Implement actual authentication logic
    // This is a placeholder implementation

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        } as ApiResponse,
        { status: 400 },
      );
    }

    // TODO: Replace with actual database lookup and password verification
    // For now, we'll simulate a successful login
    if (body.email === "demo@example.com" && body.password === "password") {
      const mockUser: AuthUser = {
        id: "1",
        email: body.email,
        username: "demo_user",
        token: "mock_jwt_token_" + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockUser,
          message: "Login successful",
        } as ApiResponse<AuthUser>,
        { status: 200 },
      );
    }

    // Invalid credentials
    return NextResponse.json(
      {
        success: false,
        error: "Invalid email or password",
      } as ApiResponse,
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
