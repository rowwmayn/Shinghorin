import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, address, date, items, total, hasCustom, source } = body;

    if (!name || !phone || !address || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Generate readable order number
    const count = await prisma.order.count();
    const orderNumber = `SH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: name,
        phone,
        address,
        preferredDate: date || null,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        total: Number(total) || 0,
        hasCustom: Boolean(hasCustom),
        status: 'PENDING',
        source: source === 'WHATSAPP' ? 'WHATSAPP' : 'WEBSITE',
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error logging order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const parsedOrders = orders.map((o) => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items,
    }));

    return NextResponse.json({ success: true, orders: parsedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
