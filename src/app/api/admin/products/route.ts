import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {};
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
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
      orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      include: {
        category: true,
      },
    });

    const parsed = products.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images,
      variants: typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : p.variants,
    }));

    return NextResponse.json({ success: true, products: parsed });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bn, categoryId, description, badge, price, variants, images, isActive, sortOrder } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ success: false, error: 'Name and Category are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        bn: bn || '',
        categoryId: parseInt(categoryId),
        description: description || '',
        badge: badge || '',
        price: price !== undefined && price !== '' ? parseFloat(price) : null,
        variants: variants ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : '[]',
        images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : '[]',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        variants: JSON.parse(product.variants || '[]'),
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
