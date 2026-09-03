'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/lib/types';

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  viewsChartData: { date: string; views: number }[];
  recentOrders: Order[];
  categoryDistribution: { name: string; products: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/analytics/stats');
        const json = await res.json();
        if (json.success) {
          setData(json.stats);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-sm opacity-60 animate-pulse">
          Loading analytics metrics...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        Failed to load analytics. Please refresh the page.
      </div>
    );
  }

  // Calculate maximum views for SVG bar chart scaling
  const maxViews = Math.max(1, ...data.viewsChartData.map((d) => d.views));

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[var(--ink)] pb-5">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Studio Overview & Analytics
          </h1>
          <p className="font-mono text-xs opacity-70 mt-1">
            Real-time traffic, orders, and shop inventory summary
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="btn btn-primary btn-sm">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="btn btn-outline btn-sm">
            View All Orders
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-4 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-1">
            Page Views (Today / Total)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--plum)]">
              {data.todayViews}
            </span>
            <span className="font-mono text-xs opacity-60">
              / {data.totalViews.toLocaleString()} total
            </span>
          </div>
        </div>

        <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-4 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-1">
            Orders Received
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--teal)]">
              {data.totalOrders}
            </span>
            {data.pendingOrders > 0 && (
              <span className="badge-tag relative top-0 right-0 inline-block bg-[var(--marigold-deep)] text-white text-[10px] px-2 py-0.5">
                {data.pendingOrders} Pending
              </span>
            )}
          </div>
        </div>

        <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-4 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-1">
            Total Revenue
          </p>
          <span className="font-display text-3xl font-bold text-[var(--ink)]">
            {formatPrice(data.totalRevenue)}
          </span>
        </div>

        <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-4 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider opacity-60 mb-1">
            Active Catalog
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--marigold-deep)]">
              {data.activeProducts}
            </span>
            <span className="font-mono text-xs opacity-60">
              / {data.totalProducts} items
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple 7-Day Traffic Visual */}
        <div className="md:col-span-2 bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold">Visitor Traffic (Last 7 Days)</h3>
            <span className="font-mono text-xs opacity-60">Daily Views</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[var(--line)]">
            {data.viewsChartData.map((item, idx) => {
              const heightPercent = Math.max(8, (item.views / maxViews) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[var(--plum)]">
                    {item.views}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-[var(--plum)] hover:bg-[var(--plum-deep)] transition-all rounded-t-md border-2 border-[var(--ink)] border-b-0"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="font-mono text-[10px] opacity-70 mt-1">{item.date}</span>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[11px] opacity-50 mt-3 text-right">
            Traffic tracked natively via SQLite — 0 third-party trackers
          </p>
        </div>

        {/* Categories Distribution */}
        <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">Category Inventory</h3>
            <div className="space-y-3">
              {data.categoryDistribution.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-mono border-b border-[var(--line)] pb-2">
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="font-bold bg-[var(--paper)] px-2 py-0.5 rounded-full border border-[var(--ink)] text-xs">
                    {cat.products}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/admin/categories"
            className="text-xs font-mono font-bold text-[var(--plum)] hover:underline mt-4 inline-block"
          >
            Manage Categories →
          </Link>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold">Recent Customer Orders</h3>
          <Link
            href="/admin/orders"
            className="font-mono text-xs font-bold text-[var(--plum)] hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {!data.recentOrders.length ? (
          <p className="font-mono text-xs opacity-60 py-6 text-center">
            No orders placed yet. When customers order via WhatsApp COD, their order details will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[var(--ink)] opacity-70">
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--line)]/50">
                    <td className="py-2.5 font-bold">{order.orderNumber}</td>
                    <td className="py-2.5">{order.customerName}</td>
                    <td className="py-2.5">{order.phone}</td>
                    <td className="py-2.5 font-bold text-[var(--plum)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 opacity-60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
