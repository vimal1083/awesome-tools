import { useState, useEffect } from 'react';
import { HelpCircle, Layers, Crop, Check } from 'lucide-react';
import { ImageMetadata, ThumbnailAdjustment } from '../types';
import { cropCenterTo16v9, padTo16v9, checkIs16v9 } from '../utils';
import { trackButtonClick } from '../analytics';

interface ConfirmationDialogProps {
  imageMetadata: ImageMetadata;
  onChangeAdjustment: (adjustment: ThumbnailAdjustment) => void;
  currentAdjustment: ThumbnailAdjustment | null;
}

export default function ConfirmationDialog({
  imageMetadata,
  onChangeAdjustment,
  currentAdjustment,
}: ConfirmationDialogProps) {
  const { is16v9, ratio } = checkIs16v9(imageMetadata.width, imageMetadata.height);
  const [processing, setProcessing] = useState(false);

  // Calculate clean aspect ratio fraction for user view
  const getFittedFraction = (w: number, h: number): string => {
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const divisor = gcd(w, h);
    const rx = w / divisor;
    const ry = h / divisor;
    
    // Check if it's super close to some standards
    if (Math.abs(w/h - 1.7777) < 0.02) return '16:9 (Standard)';
    if (Math.abs(w/h - 1.3333) < 0.02) return '4:3 (Traditional)';
    if (Math.abs(w/h - 1) < 0.02) return '1:1 (Square)';
    if (Math.abs(w/h - 0.5625) < 0.02) return '9:16 (Shorts/Vertical)';
    
    return `${rx.toFixed(0)}:${ry.toFixed(0)}`;
  };

  const handleDecision = async (mode: 'original' | 'converted', paddingStyle: 'black' | 'blurred' | 'gray' = 'black') => {
    setProcessing(true);
    trackButtonClick('ratio_refactor_choice', `Configure ${mode} resizing with padding ${paddingStyle}`);
    try {
      if (mode === 'converted') {
        const cropped = await cropCenterTo16v9(imageMetadata.src);
        onChangeAdjustment({
          mode: 'converted',
          processedSrc: cropped,
          paddingStyle: 'black',
        });
      } else {
        const padded = await padTo16v9(imageMetadata.src, paddingStyle);
        onChangeAdjustment({
          mode: 'original',
          processedSrc: padded,
          paddingStyle,
        });
      }
    } catch (e) {
      console.error('Error of processing canvas adjustments: ', e);
    } finally {
      setProcessing(false);
    }
  };

  // Run automatically on mount or when the image metadata changes
  useEffect(() => {
    if (is16v9) {
      // It is 16:9, auto-set to original source directly with no extra padding
      onChangeAdjustment({
        mode: 'original',
        processedSrc: imageMetadata.src,
        paddingStyle: 'black',
      });
    } else {
      // Default choice is converted
      handleDecision('converted');
    }
  }, [imageMetadata.src]);

  if (is16v9) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-400 flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
          <Check className="h-4.5 w-4.5 animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-emerald-300 uppercase tracking-wide">
            Perfect Aspect Ratio Verified
          </p>
          <p className="mt-0.5 text-zinc-300 leading-relaxed text-2xs">
            Your image matches standard YouTube player <strong className="text-emerald-450">16:9</strong> aspect ratio perfectly. All mockup previews will display your pristine crop natively with absolute edge-to-edge precision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-yt-line bg-[#161616]/40 p-5 md:p-6" id="ratio-decision-panel">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-sans text-xs font-black text-white uppercase tracking-wider">
              Ratio advisory: youtube target format (16:9)
            </h3>
            <span className="rounded bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 text-3xs font-mono font-bold tracking-wide text-yellow-500 uppercase">
              Aspect: {getFittedFraction(imageMetadata.width, imageMetadata.height)}
            </span>
          </div>
          
          <p className="mt-2 text-2xs text-zinc-400 leading-normal font-semibold">
            Yes, you are indeed correct! YouTube utilizes exactly a <strong className="font-bold text-zinc-200">16:9</strong> aspect ratio for its thumbnail overlays. Your uploaded file has a non-standard shape representing <strong className="font-extrabold text-[#FFF]">{imageMetadata.width} × {imageMetadata.height}px</strong> (Ratio: {ratio.toFixed(2)}). How should we proceed with your mock previews?
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        {/* Option 1: Convert/Crop */}
        <button
          type="button"
          onClick={() => handleDecision('converted')}
          disabled={processing}
          className={`relative text-left rounded-lg border p-4 cursor-pointer transition-all ${
            currentAdjustment?.mode === 'converted'
              ? 'border-yt-red bg-yt-red/5 ring-1 ring-yt-red/20'
              : 'border-yt-line bg-[#1E1E1E] hover:bg-[#252525]'
          } ${processing ? 'opacity-80 pointer-events-none' : ''}`}
          id="crop-option-card"
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              currentAdjustment?.mode === 'converted'
                ? 'bg-yt-red text-white'
                : 'bg-zinc-900 text-zinc-400 border border-yt-line'
            }`}>
              <Crop className="h-4.5 w-4.5" />
            </div>
            
            <div className="min-w-0 flex-1">
              <span className="block font-sans text-xs font-extrabold text-white uppercase tracking-wider">
                Crop to 16:9 (Recommended)
              </span>
              <span className="mt-0.5 block text-3xs text-zinc-400 leading-normal">
                Perfect center-cropped standard. Discards excess boundaries to fill cards edge-to-edge.
              </span>
            </div>
          </div>
          {currentAdjustment?.mode === 'converted' && (
            <div className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-yt-red text-white">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Option 2: Keep with borders */}
        <div
          className={`relative flex flex-col justify-between rounded-lg border p-4 transition-all ${
            currentAdjustment?.mode === 'original'
              ? 'border-yt-red bg-yt-red/5 ring-1 ring-yt-red/20'
              : 'border-yt-line bg-[#1E1E1E]'
          }`}
          id="pad-option-card"
        >
          <button
            type="button"
            onClick={() => handleDecision('original', currentAdjustment?.paddingStyle || 'black')}
            disabled={processing}
            className="text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                currentAdjustment?.mode === 'original'
                  ? 'bg-yt-red text-white'
                  : 'bg-zinc-900 text-zinc-400 border border-yt-line'
              }`}>
                <Layers className="h-4.5 w-4.5" />
              </div>
              
              <div className="min-w-0 flex-1 pr-4">
                <span className="block font-sans text-xs font-extrabold text-white uppercase tracking-wider">
                  Add letterbox Padding
                </span>
                <span className="mt-0.5 block text-3xs text-zinc-400 leading-normal">
                  Retain every pixel. Adds letterbox backgrounds to auto-fill the target bounds. Choose style:
                </span>
              </div>
            </div>
          </button>

          {/* Padding Style Radio Indicators */}
          <div className="mt-4 flex flex-wrap gap-2 pt-2.5 border-t border-yt-line">
            {(['black', 'gray', 'blurred'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleDecision('original', style)}
                disabled={processing}
                className={`rounded bg-zinc-955 px-2 py-1 text-3xs font-extrabold uppercase tracking-wide pointer-events-auto cursor-pointer transition-all border ${
                  currentAdjustment?.mode === 'original' && currentAdjustment.paddingStyle === style
                    ? 'border-yt-red text-yt-red bg-yt-red/5'
                    : 'border-yt-line text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {style === 'blurred' ? 'Blurred Cover' : `${style} fill`}
              </button>
            ))}
          </div>

          {currentAdjustment?.mode === 'original' && (
            <div className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-yt-red text-white">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </div>
          )}
        </div>
      </div>

      {processing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-2xs font-medium text-zinc-500">
          <span className="h-3 w-3 animate-spin rounded-full border border-zinc-550 border-t-transparent" />
          Refactoring layout parameters...
        </div>
      )}
    </div>
  );
}
