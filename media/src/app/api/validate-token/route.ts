import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// This would typically come from your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET) as { 
      origin: string;
      exp: number;
    };

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      );
    }

    // Return the validated origin
    return NextResponse.json({ origin: decoded.origin });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
} 