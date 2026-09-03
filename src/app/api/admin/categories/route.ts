import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, label, folder, chip, sortOrder } = body;

    if (!key || !label) {
      return NextResponse.json({ success: false, error: 'Key and Label are required' }, { status: 400 });
    }

    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

    const category = await prisma.category.create({
      data: {
        key: normalizedKey,
        label,
        folder: folder || normalizedKey,
        chip: chip || '#2F7A6E',
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Category key already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, label, folder, chip, sortOrder } = body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        label,
        folder,
        chip,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
