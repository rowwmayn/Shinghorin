import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryKey = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    if (categoryKey && categoryKey !== 'all') {
      where.category = {
        key: categoryKey,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bn: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        category: true,
      },
    });

    // Parse JSON fields
    const formatted = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images,
      variants: typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : p.variants,
    }));

    return NextResponse.json({ success: true, products: formatted });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
