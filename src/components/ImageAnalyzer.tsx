import React, { useEffect, useState } from 'react';
import { ImageMetadata, MockMetadata } from '../types';
import { 
  Award, 
  Sparkles, 
  FileWarning, 
  CheckCircle2, 
  Info, 
  Flame, 
  BarChart4, 
  Layout, 
  AlertTriangle 
} from 'lucide-react';
import { formatFileSize } from '../utils';

interface ImageAnalyzerProps {
  imageMetadata: ImageMetadata;
  mockMetadata: MockMetadata;
}

interface AnalysisResults {
  overallScore: number;
  contrastScore: number;
  vibrancyScore: number;
  resolutionScore: number;
  aspectRatioScore: number;
  fileSizeScore: number;
  averageBrightness: number;
  contrastValue: number; // SD
  vibrancyValue: number; // Saturation avg
  quadrants: {
    topLeft: number; // SD
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  bestTextQuadrant: 'Top-Left' | 'Top-Right' | 'Bottom-Left' | 'Bottom-Right';
  focusQuadrant: 'Top-Left' | 'Top-Right' | 'Bottom-Left' | 'Bottom-Right';
}

export default function ImageAnalyzer({ imageMetadata, mockMetadata }: ImageAnalyzerProps) {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'quadrants' | 'checklist'>('overview');

  useEffect(() => {
    if (!imageMetadata.src) return;

    setAnalyzing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageMetadata.src;

    img.onload = () => {
      try {
        // Build diagnostic Canvas
        const canvas = document.createElement('canvas');
        // A standard small grid is perfect for rapid pixel-by-pixel color math in 1 turn
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setAnalyzing(false);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let totalLuminance = 0;
        let luminanceValues: number[] = [];
        let totalSaturation = 0;

        // Quadrants bounds
        const qW = canvas.width / 2;
        const qH = canvas.height / 2;

        const quadLums = {
          topLeft: [] as number[],
          topRight: [] as number[],
          bottomLeft: [] as number[],
          bottomRight: [] as number[],
        };

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Standard ITU-R BT.709 formulas for luminance
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            totalLuminance += lum;
            luminanceValues.push(lum);

            // Saturated color pop measurement
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const sat = maxVal - minVal; // raw saturation distance
            totalSaturation += sat;

            // Sort luminance into 4 visual quadrants
            if (x < qW && y < qH) quadLums.topLeft.push(lum);
            else if (x >= qW && y < qH) quadLums.topRight.push(lum);
            else if (x < qW && y >= qH) quadLums.bottomLeft.push(lum);
            else quadLums.bottomRight.push(lum);
          }
        }

        const pixelCount = canvas.width * canvas.height;
        const avgBrightness = totalLuminance / pixelCount;
        const avgSaturation = totalSaturation / pixelCount;

        // Calculate Standard Deviation of Luminosity (Contrast score)
        let sumSqDiff = 0;
        for (let i = 0; i < luminanceValues.length; i++) {
          const diff = luminanceValues[i] - avgBrightness;
          sumSqDiff += diff * diff;
        }
        const stdDev = Math.sqrt(sumSqDiff / pixelCount);

        // Quad Standard Deviations (measures entropy or structural busy-ness)
        const getSD = (vals: number[]) => {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          const sqDiffs = vals.map(v => (v - avg) * (v - avg));
          return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / vals.length);
        };

        const quadSDs = {
          topLeft: getSD(quadLums.topLeft),
          topRight: getSD(quadLums.topRight),
          bottomLeft: getSD(quadLums.bottomLeft),
          bottomRight: getSD(quadLums.bottomRight),
        };

        // Determine best quadrant for text overlay (lowest deviation = flattest background = best readability)
        // and focus quadrant (highest deviation = high-frequency graphic components like faces, objects)
        const orderedQuads = Object.entries(quadSDs).sort((a, b) => a[1] - b[1]);
        const formatQuadName = (name: string): 'Top-Left' | 'Top-Right' | 'Bottom-Left' | 'Bottom-Right' => {
          switch (name) {
            case 'topLeft': return 'Top-Left';
            case 'topRight': return 'Top-Right';
            case 'bottomLeft': return 'Bottom-Left';
            default: return 'Bottom-Right';
          }
        };

        const bestTextQuadrant = formatQuadName(orderedQuads[0][0]);
        const focusQuadrant = formatQuadName(orderedQuads[3][0]);

        // Scoring rules:
        // 1. Resolution score:
        let resScore = 40;
        if (imageMetadata.width >= 1280 && imageMetadata.height >= 720) resScore = 100;
        else if (imageMetadata.width >= 640 && imageMetadata.height >= 360) resScore = 75;

        // 2. Aspect ratio score:
        const idealRatio = 16 / 9;
        const ratioDev = Math.abs(imageMetadata.aspectRatio - idealRatio);
        const aspectScore = Math.max(0, Math.round(100 - (ratioDev * 150)));

        // 3. Contrast dynamic range score:
        // Ideal standard deviation for pop CTR is roughly 35 to 65.
        let contrastScore = 30;
        if (stdDev >= 40) contrastScore = 100;
        else if (stdDev >= 28) contrastScore = 85;
        else if (stdDev >= 15) contrastScore = 60;

        // 4. Vibrancy score:
        // Ideal saturation pop avg is over 45
        let vibrancyScore = 40;
        if (avgSaturation >= 55) vibrancyScore = 100;
        else if (avgSaturation >= 35) vibrancyScore = 88;
        else if (avgSaturation >= 18) vibrancyScore = 65;

        // 5. File size safety score (YouTube recommends under 2MB):
        let sizeScore = 100;
        const sizeMb = imageMetadata.size / (1024 * 1024);
        if (sizeMb > 10) sizeScore = 30; // extreme, warning
        else if (sizeMb > 2) sizeScore = 60; // larger than default upload target, but fine with our client conversion

        // Combined score weighting:
        // 20% Resolution, 20% Aspect Ratio, 30% Dynamic Contrast, 30% Color Pop/Vibrancy
        const weightedScore = Math.round(
          (resScore * 0.20) + 
          (aspectScore * 0.20) + 
          (contrastScore * 0.30) + 
          (vibrancyScore * 0.30)
        );

        setResults({
          overallScore: Math.min(100, Math.max(1, weightedScore)),
          contrastScore,
          vibrancyScore,
          resolutionScore: resScore,
          aspectRatioScore: aspectScore,
          fileSizeScore: sizeScore,
          averageBrightness: Math.round(avgBrightness / 2.55), // convert 0-255 to percentage
          contrastValue: stdDev,
          vibrancyValue: avgSaturation,
          quadrants: quadSDs,
          bestTextQuadrant,
          focusQuadrant,
        });
      } catch (err) {
        console.error('Front-end analysis error:', err);
      } finally {
        setAnalyzing(false);
      }
    };

    img.onerror = () => {
      setAnalyzing(false);
    };
  }, [imageMetadata.src, imageMetadata.width, imageMetadata.height, imageMetadata.size, imageMetadata.aspectRatio]);

  if (analyzing) {
    return (
      <div className="rounded-xl border border-yt-line bg-[#161616]/40 p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-yt-red border-t-transparent mb-3" />
        <p className="text-xs font-black uppercase text-zinc-300 tracking-wider">Analyzing Visual Integrity...</p>
        <p className="text-3s text-zinc-500 mt-1">Inspecting pixel depth, dynamic range, and focus entropy natively in-browser.</p>
      </div>
    );
  }

  if (!results) return null;

  // Visual classes based on score tiers
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', ring: 'ring-emerald-500/20' };
    if (score >= 50) return { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', ring: 'ring-yellow-500/20' };
    return { text: 'text-yt-red', border: 'border-red-500/20', bg: 'bg-red-500/5', ring: 'ring-red-500/20' };
  };

  const colors = getScoreColor(results.overallScore);
  const sizeMb = imageMetadata.size / (1024 * 1024);

  return (
    <div className="rounded-xl border border-yt-line bg-[#161616]/40 p-5 space-y-4" id="thumbnail-diagnostic-panel">
      
      {/* Title & Overall Meter */}
      <div className="flex items-center justify-between border-b border-yt-line pb-4">
        <div className="flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-yt-red" />
          <h2 className="font-sans text-xs font-black text-white uppercase tracking-wider">
            CTR Pop Diagnostic
          </h2>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors.border} ${colors.bg} ${colors.ring} ring-1`}>
          <span className="text-3xs font-mono font-bold uppercase tracking-wider text-zinc-400">CTR Rank:</span>
          <span className={`text-xs font-black ${colors.text}`}>{results.overallScore} / 100</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-yt-line p-0.5 gap-1 bg-zinc-950/60 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1 px-2 text-3xs font-extrabold uppercase tracking-wide rounded transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#2E2E2E] text-white border-b border-yt-red' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('quadrants')}
          className={`flex-1 py-1 px-2 text-3xs font-extrabold uppercase tracking-wide rounded transition-all cursor-pointer ${
            activeTab === 'quadrants' ? 'bg-[#2E2E2E] text-white border-b border-yt-red' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Layout (OCR helper)
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 py-1 px-2 text-3xs font-extrabold uppercase tracking-wide rounded transition-all cursor-pointer ${
            activeTab === 'checklist' ? 'bg-[#2E2E2E] text-white border-b border-yt-red' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Checklist
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fade-in text-zinc-400">
          {/* Main Visual Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0F0F0F] rounded-lg border border-yt-line flex flex-col justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-zinc-500">Color Luminance</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-base font-black text-white">{results.averageBrightness}%</span>
                <span className="text-3xs font-mono font-bold uppercase text-zinc-400">Brightness</span>
              </div>
              <p className="text-3xs text-zinc-500 mt-1 lines-clamp-1">
                {results.averageBrightness > 75 ? 'Too bright (washes details)' : results.averageBrightness < 20 ? 'Too dark (leaks details)' : 'Optimal balance'}
              </p>
            </div>

            <div className="p-3 bg-[#0F0F0F] rounded-lg border border-yt-line flex flex-col justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-zinc-500">Color Pop Pop</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-base font-black text-white">{results.vibrancyValue.toFixed(0)}</span>
                <span className="text-3xs font-mono font-bold uppercase text-zinc-400">Saturation</span>
              </div>
              <p className="text-3xs text-zinc-500 mt-1 lines-clamp-1">
                {results.vibrancyValue > 50 ? 'Outstanding color highlight' : results.vibrancyValue > 25 ? 'Moderate capture rate' : 'Muted coloring'}
              </p>
            </div>
          </div>

          {/* Quick analysis line */}
          <div className="p-3 bg-[#1e1ea5]/5 border border-indigo-500/10 rounded-lg flex gap-2.5 items-start">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-3xs font-bold text-indigo-300 uppercase tracking-wide">Dynamic Contrast Rating ({results.contrastValue.toFixed(0)})</p>
              <p className="text-3xs text-zinc-300 mt-0.5 leading-relaxed">
                {results.contrastValue >= 35 
                  ? 'High local contrast detected. Visual elements pop strongly, which statistically increases click-through frequency in crowded lists.' 
                  : 'Low dynamic contrast. The elements blend together which might make it harder to grab the viewer’s eye on high-density displays.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Layout analysis */}
      {activeTab === 'quadrants' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-3xs text-zinc-400 leading-normal font-semibold uppercase tracking-wider mb-2">
            🖼️ Screen Grid Entropy Analysis (Text Overlays Guide)
          </p>

          {/* Visual quadrant mini-preview map */}
          <div className="relative aspect-video max-w-xs mx-auto rounded-lg overflow-hidden border border-yt-line bg-[#0F0F0F] p-1 flex justify-center items-center">
            {/* The small 4 grids layout */}
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-yt-line/60 rounded">
              
              {/* Top Left */}
              <div className={`relative flex flex-col justify-center items-center text-center p-2 rounded-tl ${results.bestTextQuadrant === 'Top-Left' ? 'bg-[#3b82f6]/10' : results.focusQuadrant === 'Top-Left' ? 'bg-yt-red/10' : 'bg-transparent'}`}>
                <span className="text-[9px] font-black text-white uppercase">TL</span>
                <span className="text-3xs font-mono text-zinc-550 mt-0.5">SD: {results.quadrants.topLeft.toFixed(0)}</span>
                {results.bestTextQuadrant === 'Top-Left' && (
                  <span className="absolute bottom-1 bg-blue-500 text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Optimal Text</span>
                )}
                {results.focusQuadrant === 'Top-Left' && (
                  <span className="absolute bottom-1 bg-yt-red text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Focal Graphic</span>
                )}
              </div>

              {/* Top Right */}
              <div className={`relative flex flex-col justify-center items-center text-center p-2 rounded-tr ${results.bestTextQuadrant === 'Top-Right' ? 'bg-[#3b82f6]/10' : results.focusQuadrant === 'Top-Right' ? 'bg-yt-red/10' : 'bg-transparent'}`}>
                <span className="text-[9px] font-black text-white uppercase">TR</span>
                <span className="text-3xs font-mono text-zinc-550 mt-0.5">SD: {results.quadrants.topRight.toFixed(0)}</span>
                {results.bestTextQuadrant === 'Top-Right' && (
                  <span className="absolute bottom-1 bg-blue-500 text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Optimal Text</span>
                )}
                {results.focusQuadrant === 'Top-Right' && (
                  <span className="absolute bottom-1 bg-yt-red text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Focal Graphic</span>
                )}
              </div>

              {/* Bottom Left */}
              <div className={`relative flex flex-col justify-center items-center text-center p-2 rounded-bl ${results.bestTextQuadrant === 'Bottom-Left' ? 'bg-[#3b82f6]/10' : results.focusQuadrant === 'Bottom-Left' ? 'bg-yt-red/10' : 'bg-transparent'}`}>
                <span className="text-[9px] font-black text-white uppercase">BL</span>
                <span className="text-3xs font-mono text-zinc-550 mt-0.5">SD: {results.quadrants.bottomLeft.toFixed(0)}</span>
                {results.bestTextQuadrant === 'Bottom-Left' && (
                  <span className="absolute bottom-1 bg-blue-500 text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Optimal Text</span>
                )}
                {results.focusQuadrant === 'Bottom-Left' && (
                  <span className="absolute bottom-1 bg-yt-red text-white text-[7px] font-bold px-1 rounded uppercase tracking-wider">Focal Graphic</span>
                )}
              </div>

              {/* Bottom Right */}
              <div className={`relative flex flex-col justify-center items-center text-center p-2 rounded-br ${results.bestTextQuadrant === 'Bottom-Right' ? 'bg-[#3b82f6]/10' : results.focusQuadrant === 'Bottom-Right' ? 'bg-yt-red/10' : 'bg-transparent'}`}>
                <span className="text-[9px] font-black text-white uppercase text-red-400">BR</span>
                <span className="text-3xs font-mono text-zinc-550 mt-0.5">SD: {results.quadrants.bottomRight.toFixed(0)}</span>
                
                {/* Duration overlay badge representation */}
                <div className="absolute right-1 bottom-1 bg-black/90 text-[7px] font-bold text-white px-1.5 py-0.5 rounded uppercase font-mono tracking-wide flex items-center gap-0.5">
                  <span>{mockMetadata.duration}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-2.5 text-zinc-300">
            <div className="flex gap-2 items-start text-3xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <span className="font-extrabold uppercase text-blue-400">Text Friendly Zone ({results.bestTextQuadrant}):</span>
                <p className="text-zinc-400 mt-0.5">
                  This quadrant is structurally flat and clean. Placing high-contrast typographic overlays, bold titles, or icons here ensures crisp, clutter-free readability.
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-start text-3xs border-t border-yt-line pt-2.5">
              <div className="w-2 h-2 rounded-full bg-yt-red mt-1 shrink-0" />
              <div>
                <span className="font-extrabold uppercase text-yt-red">Focal Subject Area ({results.focusQuadrant}):</span>
                <p className="text-zinc-400 mt-0.5">
                  Contains complex high-frequency pixels (likely containing faces, core icons, or branding illustrations). **Keep text clear from this quadrant** to avoid covering your core graphical elements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Actionable suggestions checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-3.5 text-3xs animate-fade-in">
          
          {/* 1. File size limits */}
          <div className="flex gap-2.5 items-start">
            {sizeMb > 2 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold uppercase tracking-wide text-white">YouTube Upload Sizing ({formatFileSize(imageMetadata.size)})</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                {sizeMb > 2 ? (
                  <>
                    Your raw file is <strong className="text-yellow-400">{sizeMb.toFixed(2)} MB</strong>. YouTube strictly restricts native thumbnail payloads to <strong className="text-white">2 MB</strong>. Use our <strong>Processed JPEG Download</strong> button below to instantly save a highly optimized file of ~1MB!
                  </>
                ) : (
                  'File meets native payload restrictions. It is perfectly ready for direct submission to YouTube Studio without any payload rejection.'
                )}
              </p>
            </div>
          </div>

          {/* 2. Aspect Ratio */}
          <div className="flex gap-2.5 items-start border-t border-yt-line pt-3.5">
            {results.aspectRatioScore >= 95 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold uppercase tracking-wide text-white">Aspect Ratio Ratio Check ({imageMetadata.width}x{imageMetadata.height})</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                {results.aspectRatioScore >= 95 ? (
                  'Your file matches 16:9 natively. No cropping padding adjustments are technically required to display beautifully inside the video cards.'
                ) : (
                  'Non-standard image shape detected. If uploaded directly, YouTube will fill the margins or force standard scale. We highly recommend selecting standard "Fit & Crop 16:9" below.'
                )}
              </p>
            </div>
          </div>

          {/* 3. Youtube Overlay Stamp Safe Zone */}
          <div className="flex gap-2.5 items-start border-t border-yt-line pt-3.5">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wide text-yellow-400">Timestamp badge safety block</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Note that YouTube places a solid black length stamp (<strong className="text-white bg-black/50 px-1 rounded font-mono">{mockMetadata.duration}</strong>) on the <strong>Bottom-Right</strong> corner. Ensure that crucial faces, illustrations, or copy texts are kept out of this zone to prevent important graphic blocks from being cut off.
              </p>
            </div>
          </div>

          {/* 4. Contrast Pop */}
          <div className="flex gap-2.5 items-start border-t border-yt-line pt-3.5">
            {results.vibrancyValue >= 30 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold uppercase tracking-wide text-white">Color Saturation Pop ({results.vibrancyValue.toFixed(0)})</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                {results.vibrancyValue < 30 ? (
                  'Palette looks highly muted or monochromatic. Thumbnails featuring bright, highly saturated warm icons, text offsets, or vibrant graphics grab CTR significantly faster. Try raising color vibrancy +5% to +15%.'
                ) : (
                  'Visual boasts solid color density. The vibrancy pop is strong enough to attract eyes inside multi-column feed sections.'
                )}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
