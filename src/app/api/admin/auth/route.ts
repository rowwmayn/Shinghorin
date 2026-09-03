import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, getAdminSession, setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = await createAdminToken(username);
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { username, role: 'admin' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ success: true, authenticated: true, user: session });
  } catch {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
