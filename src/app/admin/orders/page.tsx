'use client';

import { useState, useEffect } from 'react';
import { Order, CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const openWhatsAppCustomer = (order: Order) => {
    // Sanitize phone number for international WhatsApp link
    let phoneClean = order.phone.replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('0')) {
      phoneClean = '88' + phoneClean; // Bangladesh prefix
    }
    const message = encodeURIComponent(
      `Hello ${order.customerName}! This is Shinghorin confirming your order ${order.orderNumber}.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phoneClean}&text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[var(--ink)] pb-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Customer Orders
          </h1>
          <p className="font-mono text-xs opacity-70 mt-1">
            Orders recorded from WhatsApp COD checkouts
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap font-mono text-xs">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full border border-[var(--ink)] font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'bg-transparent hover:bg-[var(--line)]'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[var(--paper-deep)] p-8 rounded-xl border-2 border-[var(--ink)] text-center font-mono text-sm opacity-60">
            Loading orders...
          </div>
        ) : !orders.length ? (
          <div className="bg-[var(--paper-deep)] p-8 rounded-xl border-2 border-[var(--ink)] text-center font-mono text-sm opacity-60">
            No orders found for this filter.
          </div>
        ) : (
          orders.map((order) => {
            const items: CartItem[] = Array.isArray(order.items)
              ? order.items
              : JSON.parse((order.items as string) || '[]');

            return (
              <div
                key={order.id}
                className="bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[var(--line)] pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-base text-[var(--ink)]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.source === 'WHATSAPP'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-purple-100 text-purple-900 border-purple-300'
                      }`}
                    >
                      {order.source === 'WHATSAPP' ? '💬 WhatsApp' : '🌐 Website'}
                    </span>
                    <span className="opacity-60 ml-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="field mb-0 text-xs font-bold py-1 px-2.5 rounded-lg border-2 border-[var(--ink)]"
                    >
                      <option value="PENDING">🟡 PENDING</option>
                      <option value="CONFIRMED">🔵 CONFIRMED</option>
                      <option value="SHIPPED">🟣 SHIPPED</option>
                      <option value="DELIVERED">🟢 DELIVERED</option>
                      <option value="CANCELLED">⚪ CANCELLED</option>
                    </select>

                    <button
                      onClick={() => openWhatsAppCustomer(order)}
                      className="btn btn-teal btn-sm text-[11px] py-1 px-3"
                    >
                      💬 WhatsApp Customer
                    </button>
                  </div>
                </div>

                {/* Customer Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1.5 border-r-0 md:border-r border-[var(--line)] pr-4">
                    <p className="font-bold uppercase tracking-wider opacity-60 text-[10px]">
                      Customer Details
                    </p>
                    <p className="font-bold text-sm text-[var(--ink)]">
                      {order.customerName}
                    </p>
                    <p className="text-xs">📞 {order.phone}</p>
                    <p className="text-xs opacity-85 leading-relaxed">
                      📍 {order.address}
                    </p>
                    {order.preferredDate && (
                      <p className="text-[11px] text-[var(--marigold-deep)] font-bold">
                        🗓️ Preferred: {order.preferredDate}
                      </p>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-bold uppercase tracking-wider opacity-60 text-[10px]">
                      Ordered Items ({items.length})
                    </p>
                    <div className="space-y-1.5 divide-y divide-[var(--line)]/50">
                      {items.map((it, idx) => (
                        <div
                          key={idx}
                          className="pt-1.5 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold">{it.name}</span>
                            {it.detail && (
                              <span className="opacity-70 ml-1.5 text-[11px]">
                                ({it.detail})
                              </span>
                            )}
                            <span className="opacity-60 ml-2">x{it.qty}</span>
                          </div>
                          <span className="font-bold text-[var(--plum)]">
                            {it.price === null
                              ? 'Quote Pending'
                              : formatPrice(it.price * it.qty)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[var(--ink)] font-bold text-sm">
                      <span>Total Amount (COD):</span>
                      <span className="text-base text-[var(--ink)]">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
