import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer } = body;
    const userAgent = req.headers.get('user-agent') || '';

    // Record page view asynchronously
    await prisma.pageView.create({
      data: {
        path: path || '/',
        referrer: referrer || '',
        userAgent: userAgent.slice(0, 255),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-critical, fail gracefully
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
