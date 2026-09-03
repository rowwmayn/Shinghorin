import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // High level metrics
    const totalViews = await prisma.pageView.count();
    const todayViews = await prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    });

    const totalOrders = await prisma.order.count();
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });

    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Calculate total revenue from non-cancelled orders
    const completedOrders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { total: true },
    });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Views by day for the last 7 days
    const recentViews = await prisma.pageView.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    // Group views by day YYYY-MM-DD
    const viewsByDayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      viewsByDayMap[key] = 0;
    }

    recentViews.forEach((v) => {
      const key = v.createdAt.toISOString().split('T')[0];
      if (viewsByDayMap[key] !== undefined) {
        viewsByDayMap[key]++;
      }
    });

    const viewsChartData = Object.entries(viewsByDayMap).map(([date, count]) => {
      const parts = date.split('-');
      return {
        date: `${parts[1]}/${parts[2]}`,
        views: count,
      };
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Category product distribution
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    const categoryDistribution = categories.map((c) => ({
      name: c.label,
      products: c._count.products,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        todayViews,
        totalOrders,
        todayOrders,
        pendingOrders,
        totalProducts,
        activeProducts,
        totalRevenue,
        viewsChartData,
        recentOrders,
        categoryDistribution,
      },
    });
  } catch (error) {
    console.error('Error calculating analytics stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
