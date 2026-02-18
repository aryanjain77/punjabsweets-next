import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      console.error('ADMIN_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    let passwordMatch = false;
    try {
      passwordMatch = crypto.timingSafeEqual(
        Buffer.from(password),
        Buffer.from(adminToken)
      );
    } catch {
      // Buffer lengths don't match
      passwordMatch = false;
    }

    if (!passwordMatch) {
      // Delay response to prevent brute force attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    const cookieStore = await cookies();
    cookieStore.set('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
