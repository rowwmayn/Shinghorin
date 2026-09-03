export default function Ticker() {
  const items = [
    '✦ HAND-STITCHED TO ORDER',
    '✦ CASH ON DELIVERY AVAILABLE',
    '✦ DHAKA-WIDE DELIVERY',
    '✦ CUSTOM COLOURS ON REQUEST',
  ];

  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-track">
        {[...items, ...items, ...items, ...items].map((text, idx) => (
          <span key={idx}>{text}</span>
        ))}
      </div>
    </div>
  );
}
