import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Verify admin token from environment variables
 * Compares the provided password with the stored ADMIN_TOKEN
 */
export function verifyAdminPassword(password: string): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.error('ADMIN_TOKEN not set in environment');
    return false;
  }
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(adminToken)
  ).toString() === 'true';
}

/**
 * Set secure admin session cookie
 * Sets a secure, HTTP-only cookie with the admin token
 */
export async function setAdminSession(password: string): Promise<AuthResult> {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { success: false, error: 'Admin token not configured' };
  }

  // Verify password
  if (password !== adminToken) {
    return { success: false, error: 'Invalid password' };
  }

  try {
    const cookieStore = await cookies();
    // Set a secure HTTP-only cookie with 24-hour expiration
    cookieStore.set('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to set admin session:', error);
    return { success: false, error: 'Failed to set session' };
  }
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('adminToken');
  } catch (error) {
    console.error('Failed to clear admin session:', error);
  }
}

/**
 * Get admin token from cookies
 */
export async function getAdminToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;
    return token || null;
  } catch (error) {
    console.error('Failed to get admin token:', error);
    return null;
  }
}

/**
 * Verify admin token from cookies (server-side)
 */
export async function verifyAdminToken(): Promise<boolean> {
  try {
    const token = await getAdminToken();
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (!token || !adminToken) {
      return false;
    }

    // Use constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(adminToken)
    ).toString() === 'true';
  } catch (error) {
    return false;
  }
}
