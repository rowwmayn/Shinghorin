import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await req.json();
    const { status, notes } = body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...updated,
        items: JSON.parse(updated.items || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
