'use client';

import { useState } from 'react';
import { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onClearCart,
  onShowToast,
}: CartDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Shinghorin';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801848335770';
  const currency = process.env.NEXT_PUBLIC_CURRENCY || '৳';
  const sheetWebhookUrl = process.env.NEXT_PUBLIC_SHEET_WEBHOOK_URL || '';

  const total = cart.reduce((sum, item) => {
    if (item.price === null) return sum;
    return sum + item.price * item.qty;
  }, 0);

  const hasCustom = cart.some((item) => item.price === null);

  const validateForm = () => {
    if (!cart.length) {
      onShowToast('Your basket is empty', true);
      return false;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      onShowToast('Please fill in your name, phone, and delivery address', true);
      return false;
    }
    return true;
  };

  // Helper to log to Google Sheets if configured
  const triggerGoogleSheetWebhook = (orderItemsText: string) => {
    if (sheetWebhookUrl) {
      fetch(sheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          name,
          phone,
          address,
          date,
          items: orderItemsText.trim(),
          total,
          hasCustom,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  };

  // Option 1: Direct Website Checkout (Cash on Delivery)
  const handleWebsiteCheckout = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Save directly to SQLite database with source = 'WEBSITE'
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          date,
          items: cart,
          total,
          hasCustom,
          source: 'WEBSITE',
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        // Build plain text summary for optional webhook
        const plainSummary = cart
          .map((i) => `${i.name} x${i.qty} (${i.price ? currency + i.price : 'Quote pending'})`)
          .join('\n');
        triggerGoogleSheetWebhook(plainSummary);

        setConfirmedOrder(data.order);
        onClearCart();
        onShowToast('Order placed successfully on website!');
      } else {
        onShowToast(data.error || 'Failed to place order', true);
      }
    } catch (error) {
      console.error('Website checkout error:', error);
      onShowToast('Failed to process order', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option 2: WhatsApp Checkout (Cash on Delivery)
  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let itemLines = '';
      let itemLinesPlain = '';

      cart.forEach((item) => {
        const priceText =
          item.price === null ? 'Quote pending' : `${currency} ${item.price}`;
        const detailText = item.detail ? ` (${item.detail})` : '';
        itemLines += `• ${item.name}${detailText} x${item.qty} — ${priceText}%0A`;
        itemLinesPlain += `${item.name}${detailText} x${item.qty} (${priceText})\n`;
      });

      // Save order to SQLite database with source = 'WHATSAPP'
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          date,
          items: cart,
          total,
          hasCustom,
          source: 'WHATSAPP',
        }),
      });

      const orderData = await res.json();
      const orderRef = orderData.success && orderData.order?.orderNumber
        ? `Order #${orderData.order.orderNumber}`
        : '';

      triggerGoogleSheetWebhook(itemLinesPlain);

      const message = `*${shopName} ORDER REQUEST — COD*%0A${orderRef ? `*${orderRef}*%0A` : ''}---------------------------%0A*CUSTOMER*%0AName: ${encodeURIComponent(
        name
      )}%0APhone: ${encodeURIComponent(phone)}%0AAddress: ${encodeURIComponent(
        address
      )}%0A${date ? `Preferred date: ${encodeURIComponent(date)}%0A` : ''}---------------------------%0A*ITEMS*%0A${itemLines}---------------------------%0A*Subtotal: ${currency} ${total.toLocaleString()}*%0A_Cash on Delivery — please confirm availability and delivery timeline._`;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const baseUrl = isMobile
        ? 'https://api.whatsapp.com/send'
        : 'https://web.whatsapp.com/send';

      window.open(`${baseUrl}?phone=${whatsappNumber}&text=${message}`, '_blank');

      onShowToast('Opening WhatsApp with your order...');
      onClearCart();
      setName('');
      setPhone('');
      setAddress('');
      setDate('');
      onClose();
    } catch (error) {
      console.error('WhatsApp checkout error:', error);
      onShowToast('Failed to process WhatsApp order', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmedOrder(null);
    setName('');
    setPhone('');
    setAddress('');
    setDate('');
    onClose();
  };

  return (
    <>
      {/* Drawer backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1000] transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="p-5 border-b-2 border-[var(--ink)] flex justify-between items-center bg-[var(--paper)]">
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            {confirmedOrder ? 'Order Confirmed!' : 'Your Basket'}
          </h2>
          <button
            onClick={confirmedOrder ? handleCloseConfirmation : onClose}
            className="text-3xl leading-none hover:text-[var(--plum)] transition-colors p-1"
            aria-label="Close basket"
          >
            &times;
          </button>
        </div>

        {/* State A: Order Confirmation Receipt */}
        {confirmedOrder ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="text-center py-4 bg-[var(--paper-deep)] rounded-2xl border-2 border-[var(--ink)]">
                <span className="text-4xl">🎉</span>
                <h3 className="font-display text-2xl font-bold mt-2">
                  Thank You for Your Order!
                </h3>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--plum)] font-bold mt-1">
                  Order #{confirmedOrder.orderNumber}
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-mono text-xs font-bold">
                  Cash on Delivery (Pending Courier)
                </span>
              </div>

              <div className="p-4 bg-[var(--paper-deep)] rounded-xl border border-[var(--line)] font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-[var(--line)] pb-2 font-bold">
                  <span>Customer:</span>
                  <span>{confirmedOrder.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                  <span>Phone:</span>
                  <span>{confirmedOrder.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--line)] pb-2">
                  <span>Delivery Address:</span>
                  <span className="max-w-[200px] text-right truncate">
                    {confirmedOrder.address}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 text-[var(--plum)]">
                  <span>Subtotal:</span>
                  <span>{formatPrice(confirmedOrder.total)}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-mono text-emerald-950 space-y-1">
                <p className="font-bold">📦 What happens next?</p>
                <p className="opacity-90">
                  Your order is safely recorded in our studio database. We will hand-craft
                  and package your pieces, then hand them to the courier. You only pay in cash upon arrival.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Hi Shinghorin! I just placed Order #${confirmedOrder.orderNumber} on your website for ${formatPrice(
                      confirmedOrder.total
                    )}.`
                  );
                  window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${msg}`, '_blank');
                }}
                className="btn btn-teal w-full justify-center text-xs py-3 font-mono"
              >
                💬 Open WhatsApp to Chat About Order
              </button>
              <button
                type="button"
                onClick={handleCloseConfirmation}
                className="btn btn-outline w-full justify-center text-xs py-3"
              >
                Continue Browsing Store
              </button>
            </div>
          </div>
        ) : (
          /* State B: Regular Basket & Dual Checkout Options */
          <>
            {/* Cart Items List */}
            <div className="cart-items">
              {!cart.length ? (
                <div className="text-center mt-16 px-4">
                  <p className="font-mono text-sm opacity-50 mb-4">Your basket is empty.</p>
                  <p className="font-hand text-lg opacity-70">
                    Pick something charming from the shop to fill it up!
                  </p>
                </div>
              ) : (
                cart.map((item, i) => {
                  const itemTotal =
                    item.price === null ? null : item.price * item.qty;
                  return (
                    <div
                      key={item.cartKey || i}
                      className="flex justify-between items-start border-b border-[var(--line)] pb-3 mb-3"
                    >
                      <div className="pr-3">
                        <p className="font-bold text-sm text-[var(--ink)]">{item.name}</p>
                        <p className="text-[0.72rem] opacity-70 font-mono mt-0.5">
                          {item.detail ? `${item.detail} · ` : ''}Qty {item.qty}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-sm font-bold text-[var(--plum)]">
                          {itemTotal === null ? (
                            <span className="text-[var(--marigold-deep)]">Quote Pending</span>
                          ) : (
                            formatPrice(itemTotal)
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(i)}
                          className="text-[0.7rem] text-[var(--plum)] font-bold hover:underline mt-1 inline-block"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Checkout Form */}
            <div className="p-5 border-t-2 border-[var(--ink)] bg-[var(--paper)]">
              <div className="flex justify-between text-lg font-bold mb-1 border-b border-[var(--line)] pb-2 font-mono">
                <span>SUBTOTAL</span>
                <span>{formatPrice(total)}</span>
              </div>

              {hasCustom && (
                <p className="text-[0.72rem] opacity-75 text-[var(--marigold-deep)] font-medium mb-3">
                  + custom item(s) — final price confirmed upon delivery
                </p>
              )}

              <div className="mt-3">
                <input
                  type="text"
                  className="field"
                  placeholder="Full name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting || !cart.length}
                />
                <input
                  type="tel"
                  className="field"
                  placeholder="Phone number (e.g. 01848...) *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isSubmitting || !cart.length}
                />
                <textarea
                  className="field h-14 resize-none"
                  placeholder="Delivery address in Dhaka *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isSubmitting || !cart.length}
                />
                <div className="mb-3">
                  <label className="font-mono text-[0.68rem] uppercase tracking-wider opacity-60 block mb-1">
                    Preferred Delivery Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="field mb-0 py-1.5"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isSubmitting || !cart.length}
                  />
                </div>

                {/* TWO CHECKOUT OPTIONS */}
                <div className="space-y-2 pt-1">
                  {/* Option 1: Website Checkout */}
                  <button
                    type="button"
                    onClick={handleWebsiteCheckout}
                    disabled={isSubmitting || !cart.length}
                    className="btn btn-primary w-full justify-center text-sm py-3 shadow-md"
                  >
                    {isSubmitting ? 'Processing...' : '🛍️ Order on Website (Cash on Delivery) →'}
                  </button>

                  {/* Option 2: WhatsApp Checkout */}
                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    disabled={isSubmitting || !cart.length}
                    className="btn btn-teal w-full justify-center text-sm py-3 shadow-sm"
                  >
                    {isSubmitting ? 'Opening WhatsApp...' : '💬 Order via WhatsApp (COD) →'}
                  </button>
                </div>

                <p className="text-[0.66rem] text-center opacity-65 font-mono mt-2.5">
                  Both options save your order in our database · Cash on Delivery across Dhaka
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
