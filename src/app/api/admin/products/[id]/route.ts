import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        variants: JSON.parse(product.variants || '[]'),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, bn, categoryId, description, badge, price, variants, images, isActive, sortOrder } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        bn: bn !== undefined ? bn : '',
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        description: description !== undefined ? description : '',
        badge: badge !== undefined ? badge : '',
        price: price !== undefined && price !== '' ? parseFloat(price) : null,
        variants: variants !== undefined ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : undefined,
        images: images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        images: JSON.parse(updated.images || '[]'),
        variants: JSON.parse(updated.variants || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
