import { ImageMetadata, ThumbnailAdjustment } from './types';

// Helper to format file size in a human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate a random bright pastel color for default avatar icons
export function getRandomAvatarColor(): string {
  const colors = [
    '#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#F473B9', 
    '#9C27B0', '#00BCD4', '#FF9800', '#795548', '#009688'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Load an image source into an HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

// Check if an image is exactly or highly close to 16:9 aspect ratio
export function checkIs16v9(width: number, height: number): { is16v9: boolean; ratio: number } {
  const ratio = width / height;
  const target = 16 / 9; // 1.7777...
  // Accept within a 2% margin of error (covers 1920x1080, 1280x720, and minor browser scaling rounding errors)
  const is16v9 = Math.abs(ratio - target) < 0.02;
  return { is16v9, ratio };
}

// Perform client-side 16:9 center crop using Canvas
export async function cropCenterTo16v9(imgSrc: string): Promise<string> {
  const img = await loadImage(imgSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  const { naturalWidth: w, naturalHeight: h } = img;
  const originalRatio = w / h;
  const targetRatio = 16 / 9;

  let targetW = w;
  let targetH = h;
  let sx = 0;
  let sy = 0;

  if (originalRatio > targetRatio) {
    // Original is too wide, crop left/right sides
    targetW = h * targetRatio;
    sx = (w - targetW) / 2;
  } else {
    // Original is too tall, crop top/bottom sides
    targetH = w / targetRatio;
    sy = (h - targetH) / 2;
  }

  // Set canvas size (we use a standard high quality output size based on original sizes, capped to reasonable resolution if extremely large but keeping original sharp details)
  canvas.width = targetW;
  canvas.height = targetH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw ONLY the cropped source section onto the entire canvas
  ctx.drawImage(img, sx, sy, targetW, targetH, 0, 0, targetW, targetH);
  
  return canvas.toDataURL('image/jpeg', 0.95);
}

// Fit image inside a 16:9 canvas with selectable padding styles (black, gray, or blurred container)
export async function padTo16v9(
  imgSrc: string, 
  paddingStyle: 'black' | 'blurred' | 'gray'
): Promise<string> {
  const img = await loadImage(imgSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');

  const { naturalWidth: w, naturalHeight: h } = img;
  const originalRatio = w / h;
  const targetRatio = 16 / 9;

  let canvasW = w;
  let canvasH = h;

  if (originalRatio > targetRatio) {
    // Original is too wide, add padding to height (top/bottom)
    canvasH = w / targetRatio;
  } else {
    // Original is too tall, add padding to width (left/right)
    canvasW = h * targetRatio;
  }

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background Padding based on style
  if (paddingStyle === 'black') {
    ctx.fillStyle = '#0F0F0F'; // YouTube dark mode style soft black
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else if (paddingStyle === 'gray') {
    ctx.fillStyle = '#212121'; // Neutral material dark gray
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else if (paddingStyle === 'blurred') {
    // Fill with black first to secure no canvas transparency
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Save context state, scale and blur the background image
    ctx.save();
    
    // Support blur filters when supported
    try {
      ctx.filter = 'blur(40px) brightness(40%)';
    } catch (e) {
      // Fallback if canvas filter is not supported
    }

    // Draw full-canvas stretched image for blur
    ctx.drawImage(img, 0, 0, canvasW, canvasH);
    ctx.restore();

    // Fallback semi-transparent black overlay in case blur wasn't fully dark or filter unsupported
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // 2. Draw the fitted image on top, centered
  let drawnW = w;
  let drawnH = h;
  let dx = 0;
  let dy = 0;

  if (originalRatio > targetRatio) {
    // Touches left/right, center vertically
    drawnW = canvasW;
    drawnH = canvasW / originalRatio;
    dy = (canvasH - drawnH) / 2;
  } else {
    // Touches top/bottom, center horizontally
    drawnH = canvasH;
    drawnW = canvasH * originalRatio;
    dx = (canvasW - drawnW) / 2;
  }

  ctx.drawImage(img, dx, dy, drawnW, drawnH);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// Download a data URL as a file
export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate a high-contrast elegant default thumbnail pattern programmatically (16:9)
export function generateDefaultDynamicPattern(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background smooth dark gradient
  const grad = ctx.createRadialGradient(640, 360, 50, 640, 360, 800);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // Cool tech grids in background
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.04)';
  ctx.lineWidth = 1;
  const spacing = 40;
  for (let x = 0; x < 1280; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 720);
    ctx.stroke();
  }
  for (let y = 0; y < 720; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1280, y);
    ctx.stroke();
  }

  // Draw colorful radial circular accents 
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)'; // Red neon hoop
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(640, 360, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)'; // Blue neon hoop
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(640, 360, 300, 0, Math.PI * 2);
  ctx.stroke();

  // Tech display details on top-left
  ctx.fillStyle = '#EF4444'; // Red Badge Background
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.lineTo(440, 150);
  ctx.lineTo(410, 240);
  ctx.lineTo(100, 240);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 48px system-ui, -apple-system, sans-serif';
  ctx.fillText('LIVE PREVIEW', 125, 214);

  // Title Text Overlay
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 96px system-ui, -apple-system, sans-serif';
  ctx.fillText('CRAFT THE PERFECT', 100, 370);

  ctx.fillStyle = '#FFD700'; // Yellow contrast color
  ctx.font = '900 110px system-ui, -apple-system, sans-serif';
  ctx.fillText('YOUTUBE COVER', 100, 485);

  // Subtext Highlight Badge
  ctx.fillStyle = 'rgba(59, 130, 246, 0.9)'; // Blue tag banner
  ctx.fillRect(100, 530, 680, 80);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillText('🎯 100% Free & Unlimited Size Preview', 125, 584);

  // Modern play ring representation on the right
  ctx.fillStyle = '#EF4444';
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(1040, 360, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0; // Reset shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(1005, 305);
  ctx.lineTo(1100, 360);
  ctx.lineTo(1005, 415);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.95);
}
