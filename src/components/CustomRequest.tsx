'use client';

export default function CustomRequest() {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Shinghorin';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801848335770';

  const handleCustomRequest = () => {
    const message = `*${shopName} — CUSTOM REQUEST*%0AHi! I'd like to ask about a custom handmade piece.%0A%0AWhat I have in mind:%0A(describe colour, size, character, figurine, or portrait idea...)`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile
      ? 'https://api.whatsapp.com/send'
      : 'https://web.whatsapp.com/send';
    window.open(`${baseUrl}?phone=${whatsappNumber}&text=${message}`, '_blank');
  };

  return (
    <section id="custom" className="py-20 md:py-24 px-5 md:px-10 bg-[var(--paper-deep)]/50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--marigold-deep)] mb-3">
          Not on the shelf yet?
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-5">
          Dream Up Something Odd
        </h2>
        <p className="max-w-xl mx-auto opacity-80 text-base md:text-lg mb-8 leading-relaxed">
          Want a specific character, colourway, or size — or a creature that doesn&apos;t exist
          anywhere but your head? Send a quick message with what you&apos;re picturing and
          we&apos;ll tell you if we can hook it into being.
        </p>
        <button
          type="button"
          onClick={handleCustomRequest}
          className="btn btn-teal text-base px-8 py-4 shadow-lg hover:scale-105 transition-transform"
        >
          Send a Custom Request →
        </button>
      </div>
    </section>
  );
}
