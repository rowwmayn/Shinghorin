'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="top"
      className="relative min-h-[92vh] flex flex-col justify-center items-center pt-24 px-5 overflow-hidden"
    >
      {/* Parallax Bengali watermarks */}
      <div
        className="bn-bg text-[8rem] md:text-[15rem] top-[4%] left-[-2rem] select-none"
        style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }}
        aria-hidden="true"
      >
        সুতো
      </div>
      <div
        className="bn-bg text-[7rem] md:text-[13rem] bottom-[2%] right-[-2rem] select-none"
        style={{ transform: `translate3d(0, ${scrollY * -0.1}px, 0)` }}
        aria-hidden="true"
      >
        ফুলবাড়ি
      </div>

      <div className="relative z-10 text-center max-w-3xl animate-fade-in">
        <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-5">
          A Little Handmade Menagerie // Dhaka
        </p>
        <h1 className="font-display font-bold text-[13vw] md:text-[5.5rem] mb-5 leading-none">
          Half lion,<br />
          <span className="text-[var(--plum)]">half deer,</span> entirely<br />
          hand-stitched.
        </h1>
        <p className="max-w-md mx-auto text-base md:text-lg opacity-80 mb-9 font-hand text-xl md:text-2xl">
          Odd little creatures and cosy things, looped one stitch at a time — because the best gifts are a bit nonsensical.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#catalog" className="btn btn-primary">
            Browse the Shop ↓
          </Link>
          <Link href="#custom" className="btn btn-outline">
            Request Something Odd →
          </Link>
        </div>
      </div>

      <Link
        href="#catalog"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] uppercase tracking-[0.2em] opacity-60 flex flex-col items-center gap-2 hover:opacity-100 transition-opacity"
      >
        <span>Scroll</span>
        <span className="animate-bounce">↓</span>
      </Link>
    </header>
  );
}
