'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Category, Variant } from '@/lib/types';
import { formatPrice, getProductImagePath } from '@/lib/utils';
import { Download, Copy, Check, Sparkles, X, RefreshCw } from 'lucide-react';

interface PolaroidCardModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

type ThemeType = 'classic' | 'ricepaper' | 'kraft' | 'midnight';
type AspectRatioType = 'portrait' | 'square';

const THEMES: Record<
  ThemeType,
  {
    name: string;
    bg: string;
    photoBorder: string;
    textColor: string;
    subtextColor: string;
    priceColor: string;
    accentColor: string;
    watermarkColor: string;
    chipBg: string;
    chipText: string;
  }
> = {
  classic: {
    name: 'Classic White',
    bg: '#FDFCF7',
    photoBorder: '#E5DFD5',
    textColor: '#2B2118',
    subtextColor: '#706458',
    priceColor: '#8B3A62', // Plum
    accentColor: '#E8A33D', // Marigold
    watermarkColor: '#9C9084',
    chipBg: '#2F7A6E',
    chipText: '#FFFFFF',
  },
  ricepaper: {
    name: 'Rice Paper',
    bg: '#FBF1DE', // Brand paper
    photoBorder: '#E0D0B6',
    textColor: '#2B2118', // Brand ink
    subtextColor: '#635345',
    priceColor: '#8B3A62',
    accentColor: '#E8A33D',
    watermarkColor: '#8C7C6D',
    chipBg: '#8B3A62',
    chipText: '#FBF1DE',
  },
  kraft: {
    name: 'Vintage Kraft',
    bg: '#EBD8B8',
    photoBorder: '#CCA978',
    textColor: '#261B12',
    subtextColor: '#574230',
    priceColor: '#6E2A4C',
    accentColor: '#C4801F',
    watermarkColor: '#786048',
    chipBg: '#2B2118',
    chipText: '#EBD8B8',
  },
  midnight: {
    name: 'Midnight Charcoal',
    bg: '#1C1917',
    photoBorder: '#332E2A',
    textColor: '#FBF1DE',
    subtextColor: '#A8A29E',
    priceColor: '#E8A33D', // Gold/Marigold
    accentColor: '#2F7A6E',
    watermarkColor: '#78716C',
    chipBg: '#8B3A62',
    chipText: '#FFFFFF',
  },
};

export default function PolaroidCardModal({
  product,
  categories,
  isOpen,
  onClose,
}: PolaroidCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Card Settings
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('portrait');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPrice, setShowPrice] = useState(true);
  const [showBengali, setShowBengali] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [customNote, setCustomNote] = useState('Half lion, half deer, entirely hand-stitched ✦');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Normalize product images
  const images: string[] = product
    ? Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
      ? JSON.parse(product.images || '[]')
      : []
    : [];

  const category = product
    ? product.category || categories.find((c) => c.id === product.categoryId)
    : null;

  // Selected image src
  const activeImageRaw = images[selectedImageIndex] || images[0] || '';
  const activeImageSrc = activeImageRaw
    ? getProductImagePath(category?.folder, activeImageRaw)
    : '/placeholder-product.svg';

  // Format price string
  const getDisplayPrice = (): string => {
    if (!product) return '';
    const variants: Variant[] = Array.isArray(product.variants)
      ? product.variants
      : typeof product.variants === 'string'
      ? JSON.parse(product.variants || '[]')
      : [];

    if (variants && variants.length > 0) {
      const prices = variants.map((v) => v.price).filter((p) => typeof p === 'number');
      if (prices.length > 0) {
        return `FROM ${formatPrice(Math.min(...prices))}`;
      }
    }
    return formatPrice(product.price);
  };

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setCopied(false);
    }
  }, [product]);

  // Render Polaroid to Canvas
  const renderCard = useCallback(async () => {
    if (!product || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    // Ensure custom fonts are loaded
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore font readiness errors
      }
    }

    const isPortrait = aspectRatio === 'portrait';
    const canvasWidth = 1080;
    const canvasHeight = isPortrait ? 1350 : 1080;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const currentTheme = THEMES[theme];

    // 1. Draw Card Background
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle paper grain / fine noise simulation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * canvasWidth;
      const ry = Math.random() * canvasHeight;
      const rw = Math.random() * 200 + 50;
      const rh = Math.random() * 200 + 50;
      ctx.fillRect(rx, ry, rw, rh);
    }

    // 2. Photo Frame Coordinates
    const marginX = 64;
    const marginY = 64;
    const photoWidth = canvasWidth - marginX * 2; // 952px
    const photoHeight = isPortrait ? 952 : 740; // square or landscape cut
    const photoX = marginX;
    const photoY = marginY;

    // Outer subtle border around photo cutout
    ctx.strokeStyle = currentTheme.photoBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX - 1, photoY - 1, photoWidth + 2, photoHeight + 2);

    // 3. Load & Draw Image with Cover Aspect Ratio
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        ctx.save();
        // Clip to photo cutout
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.clip();

        // Calculate aspect-fill dimensions
        const imgAspect = img.width / img.height;
        const frameAspect = photoWidth / photoHeight;

        let drawW: number;
        let drawH: number;
        let offsetX: number;
        let offsetY: number;

        if (imgAspect > frameAspect) {
          drawH = photoHeight;
          drawW = photoHeight * imgAspect;
          offsetX = photoX - (drawW - photoWidth) / 2;
          offsetY = photoY;
        } else {
          drawW = photoWidth;
          drawH = photoWidth / imgAspect;
          offsetX = photoX;
          offsetY = photoY - (drawH - photoHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        // Subtle inner shadow at the edges of the photo cut
        const shadowGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + 20);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.12)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(photoX, photoY, photoWidth, 20);

        ctx.restore();
        resolve();
      };

      img.onerror = () => {
        // Fallback placeholder pattern
        ctx.save();
        ctx.fillStyle = '#EBE3D5';
        ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
        ctx.fillStyle = currentTheme.textColor;
        ctx.font = '600 36px "Quicksand", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ Shinghorin Specimen ✦', photoX + photoWidth / 2, photoY + photoHeight / 2);
        ctx.restore();
        resolve();
      };

      img.src = activeImageSrc;
    });

    // 4. Badge Sticker (if enabled and exists)
    if (showBadge && product.badge) {
      ctx.save();
      const badgeText = product.badge.toUpperCase();
      ctx.font = '700 24px "Space Mono", monospace';
      const textMetrics = ctx.measureText(badgeText);
      const badgePaddingX = 24;
      const badgeHeight = 44;
      const badgeWidth = textMetrics.width + badgePaddingX * 2;
      const badgeX = photoX + 24;
      const badgeY = photoY + 24;

      // Badge background pill with drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = currentTheme.chipBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = currentTheme.chipText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
      ctx.restore();
    }

    // 5. Bottom Info Area (The Classic Polaroid Margin)
    const contentStartY = photoY + photoHeight + 48;
    ctx.textAlign = 'left';

    // (A) Category & Brand Tag
    ctx.font = '700 20px "Space Mono", monospace';
    ctx.fillStyle = currentTheme.accentColor;
    const categoryLabel = (category?.label || 'HANDMADE CRAFT').toUpperCase();
    ctx.fillText(`✦ ${categoryLabel}`, marginX, contentStartY);

    // (B) Product Name (Bold Display Title)
    ctx.fillStyle = currentTheme.textColor;
    ctx.font = '700 48px "Baloo 2", sans-serif';
    ctx.textBaseline = 'top';

    const titleY = contentStartY + 24;
    // Truncate title if too long to fit
    let titleText = product.name;
    const maxTitleWidth = canvasWidth - marginX * 2 - (showPrice ? 240 : 0);
    while (ctx.measureText(titleText).width > maxTitleWidth && titleText.length > 5) {
      titleText = titleText.slice(0, -2) + '…';
    }
    ctx.fillText(titleText, marginX, titleY);

    // (C) Bengali Name (if enabled and exists)
    let nextTextY = titleY + 54;
    if (showBengali && product.bn) {
      ctx.font = '600 28px "Noto Serif Bengali", serif';
      ctx.fillStyle = currentTheme.subtextColor;
      ctx.fillText(product.bn, marginX, nextTextY);
      nextTextY += 38;
    }

    // (D) Custom Note / Caption
    if (customNote.trim()) {
      ctx.font = '500 26px "Kalam", cursive';
      ctx.fillStyle = currentTheme.subtextColor;
      ctx.fillText(`"${customNote.trim()}"`, marginX, nextTextY);
    }

    // (E) Price Tag on the Right Side
    if (showPrice) {
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';

      const priceStr = getDisplayPrice();
      ctx.font = '800 44px "Baloo 2", "Space Mono", sans-serif';
      ctx.fillStyle = currentTheme.priceColor;
      ctx.fillText(priceStr, canvasWidth - marginX, titleY);

      ctx.font = '700 16px "Space Mono", monospace';
      ctx.fillStyle = currentTheme.subtextColor;
      ctx.fillText('CASH ON DELIVERY', canvasWidth - marginX, titleY + 48);
      ctx.restore();
    }

    // (F) Bottom Watermark / Signature
    if (showWatermark) {
      const watermarkY = canvasHeight - 34;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = '700 18px "Space Mono", monospace';
      ctx.fillStyle = currentTheme.watermarkColor;
      ctx.fillText('🌿 SHINGHORIN • DHAKA • HALF LION, HALF DEER', canvasWidth / 2, watermarkY);

      // Fine line accent above footer
      ctx.strokeStyle = currentTheme.photoBorder;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(marginX, watermarkY - 24);
      ctx.lineTo(canvasWidth - marginX, watermarkY - 24);
      ctx.stroke();
    }

    setIsGenerating(false);
  }, [
    product,
    theme,
    aspectRatio,
    selectedImageIndex,
    showPrice,
    showBengali,
    showBadge,
    showWatermark,
    customNote,
    activeImageSrc,
    category,
  ]);

  // Trigger render on mount and parameter change
  useEffect(() => {
    if (isOpen && product) {
      renderCard();
    }
  }, [isOpen, product, renderCard]);

  if (!isOpen || !product) return null;

  // Handle PNG Download
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (product.name || 'craft')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      a.download = `shinghorin-${safeName}-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          alert('Could not write image to clipboard directly in this browser. Please use "Download Card".');
        }
      }, 'image/png');
    } catch {
      alert('Clipboard API not supported in your browser.');
    }
  };

  return (
    <div className="modal-overlay open z-50 p-4">
      <div className="modal-box w-11/12 max-w-5xl max-h-[92vh] overflow-y-auto p-5 md:p-7">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[var(--ink)] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--marigold)]/20 border border-[var(--ink)] flex items-center justify-center text-base">
              📸
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">
                Polaroid Social Card Studio
              </h2>
              <p className="text-xs text-[var(--ink)]/70 font-mono">
                100% private to admin • Instantly generated client-side • Free social media graphics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none hover:text-[var(--plum)] p-1 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[var(--ink)]/5 p-4 rounded-xl border border-[var(--line)]">
            <div className="relative max-w-full flex justify-center">
              <canvas
                ref={canvasRef}
                className="w-auto max-h-[58vh] max-w-full rounded-md shadow-2xl border border-[var(--line)] transition-all"
                style={{ imageRendering: 'auto' }}
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-xs rounded-md">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <RefreshCw className="animate-spin" size={16} /> Rendering high-res card...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-5 w-full justify-center">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5 px-6 font-bold shadow-md hover:scale-102 active:scale-98 transition-all"
              >
                <Download size={16} /> Download Card (High-Res PNG)
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary flex items-center justify-center gap-2 text-sm py-2.5 px-5 font-bold hover:scale-102 active:scale-98 transition-all"
              >
                {copied ? <Check size={16} className="text-emerald-700" /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Image'}
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-5 space-y-4 text-sm">
            {/* Image Selector (if multiple) */}
            {images.length > 1 && (
              <div>
                <label className="block font-mono text-xs uppercase font-bold mb-1.5">
                  Select Product Photo
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => {
                    const src = getProductImagePath(category?.folder, img);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-[var(--plum)] scale-105 shadow-md'
                            : 'border-[var(--line)] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Card Theme */}
            <div>
              <label className="block font-mono text-xs uppercase font-bold mb-1.5">
                Card Palette & Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeType[]).map((tKey) => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTheme(tKey)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold text-left transition-all flex items-center gap-2 ${
                      theme === tKey
                        ? 'border-[var(--ink)] bg-[var(--paper-deep)] ring-2 ring-[var(--plum)]/30 font-extrabold'
                        : 'border-[var(--line)] bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-stone-400 shrink-0"
                      style={{ backgroundColor: THEMES[tKey].bg }}
                    />
                    <span>{THEMES[tKey].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block font-mono text-xs uppercase font-bold mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('portrait')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all ${
                    aspectRatio === 'portrait'
                      ? 'border-[var(--ink)] bg-[var(--paper-deep)] ring-2 ring-[var(--plum)]/30'
                      : 'border-[var(--line)] bg-white'
                  }`}
                >
                  📱 4:5 Instagram Feed
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('square')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all ${
                    aspectRatio === 'square'
                      ? 'border-[var(--ink)] bg-[var(--paper-deep)] ring-2 ring-[var(--plum)]/30'
                      : 'border-[var(--line)] bg-white'
                  }`}
                >
                  ⏹️ 1:1 Classic Square
                </button>
              </div>
            </div>

            {/* Content Toggles */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)]">
              <label className="block font-mono text-xs uppercase font-bold">
                Card Elements
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="accent-[var(--plum)] w-4 h-4 rounded"
                  />
                  <span>Show Price</span>
                </label>
                {product.bn && (
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBengali}
                      onChange={(e) => setShowBengali(e.target.checked)}
                      className="accent-[var(--plum)] w-4 h-4 rounded"
                    />
                    <span>Show Bengali Name</span>
                  </label>
                )}
                {product.badge && (
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBadge}
                      onChange={(e) => setShowBadge(e.target.checked)}
                      className="accent-[var(--plum)] w-4 h-4 rounded"
                    />
                    <span>Show Badge Sticker</span>
                  </label>
                )}
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="accent-[var(--plum)] w-4 h-4 rounded"
                  />
                  <span>Store Watermark</span>
                </label>
              </div>
            </div>

            {/* Custom Caption Field */}
            <div className="pt-2 border-t border-[var(--line)]">
              <label className="block font-mono text-xs uppercase font-bold mb-1">
                Custom Handwritten Note / Caption
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Pre-order now • Stitched with love"
                maxLength={60}
                className="field text-xs mb-1"
              />
              <p className="text-[10px] text-[var(--ink)]/60 font-mono">
                Rendered on the card in a storybook handwritten font (max 60 chars)
              </p>
            </div>

            {/* Social Media Tips */}
            <div className="p-3 bg-[var(--paper)] rounded-lg border border-[var(--ink)]/20 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1 text-[var(--plum)]">
                <Sparkles size={14} /> Social Media Tip:
              </p>
              <p className="text-[11px] text-[var(--ink)]/80 leading-relaxed">
                Download this card and post directly to Instagram, Facebook, or WhatsApp Stories.
                Because it renders at full 1080p, text and craft details remain ultra-crisp!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
