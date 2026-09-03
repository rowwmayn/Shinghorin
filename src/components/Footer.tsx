'use client';

export default function Footer() {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Shinghorin';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801848335770';

  const handleWhatsAppChat = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile
      ? 'https://api.whatsapp.com/send'
      : 'https://web.whatsapp.com/send';
    window.open(
      `${baseUrl}?phone=${whatsappNumber}&text=${encodeURIComponent(
        `Hi! I have a question about ${shopName}.`
      )}`,
      '_blank'
    );
  };

  return (
    <footer
      id="footer"
      className="bg-[var(--ink)] text-[var(--paper)] py-16 md:py-20 px-5 md:px-10 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Got a question first?
        </h2>
        <p className="opacity-70 mb-8 max-w-md mx-auto text-sm md:text-base">
          Message us on WhatsApp any time — we&apos;re usually quick to reply with pricing,
          custom sketches, and delivery timelines.
        </p>
        <button
          type="button"
          onClick={handleWhatsAppChat}
          className="btn btn-primary text-base px-8 py-4 shadow-xl hover:scale-105 transition-transform"
        >
          Chat on WhatsApp →
        </button>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm text-left border-t border-[var(--paper)]/20 pt-10">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.15em] mb-3 opacity-60">
              Studio
            </h4>
            <p className="opacity-80">Dhaka, Bangladesh</p>
            <p className="opacity-80">Handmade & Made to order</p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.15em] mb-3 opacity-60">
              Delivery
            </h4>
            <p className="opacity-80">Dhaka-wide, Cash on Delivery</p>
            <p className="opacity-80">Outside Dhaka: inquire on WhatsApp</p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.15em] mb-3 opacity-60">
              Socials
            </h4>
            <p className="opacity-80">
              <a href="#" className="hover:underline hover:text-[var(--marigold)] transition-colors">
                Instagram
              </a>
            </p>
            <p className="opacity-80">
              <a href="#" className="hover:underline hover:text-[var(--marigold)] transition-colors">
                Facebook
              </a>
            </p>
          </div>
        </div>

        {/* Developer Attribution & Copyright */}
        <div className="mt-12 pt-8 border-t border-[var(--paper)]/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono opacity-80">
          <p>© {new Date().getFullYear()} {shopName}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Developed by <strong className="text-[var(--marigold)]">Roman</strong></span>
            <span>•</span>
            <a
              href="https://www.github.com/rowwmayn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--paper)] underline hover:text-[var(--marigold)] transition-colors"
            >
              github.com/rowwmayn
            </a>
          </p>
        </div>
      </div>

      {/* Background Watermark */}
      <div
        className="absolute -bottom-8 -right-4 text-[16vw] font-display font-bold opacity-[0.06] select-none pointer-events-none"
        aria-hidden="true"
      >
        SHINGHORIN
      </div>
    </footer>
  );
}
