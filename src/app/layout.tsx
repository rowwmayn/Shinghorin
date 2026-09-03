import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shinghorin — Handmade Crochet & Clay, Dhaka',
  description: 'Half lion, half deer, entirely handmade. Crochet keychains, plushies, figurines, flowers and wearables — stitched to order in Dhaka, delivered with Cash on Delivery.',
  keywords: ['crochet', 'clay', 'handmade', 'Dhaka', 'plushies', 'keychains', 'Bangladesh', 'crafts', 'Shinghorin'],
  authors: [{ name: 'Roman', url: 'https://www.github.com/rowwmayn' }],
  icons: {
    icon: '/logo-placeholder.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-field" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
