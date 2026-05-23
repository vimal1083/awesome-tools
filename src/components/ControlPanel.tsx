import React, { useRef, useState } from 'react';
import { ToggleLeft, ToggleRight, Download, Sliders, Type, Play, Users, Eye, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { MockMetadata, PreviewTheme, ThumbnailAdjustment } from '../types';
import { downloadDataUrl } from '../utils';
import { trackButtonClick } from '../analytics';

interface ControlPanelProps {
  metadata: MockMetadata;
  onChangeMetadata: (meta: MockMetadata) => void;
  theme: PreviewTheme;
  onChangeTheme: (theme: PreviewTheme) => void;
  adjustment: ThumbnailAdjustment | null;
  imageName?: string;
}

export default function ControlPanel({
  metadata,
  onChangeMetadata,
  theme,
  onChangeTheme,
  adjustment,
  imageName,
}: ControlPanelProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleTextChange = (key: keyof MockMetadata, value: string | number | boolean) => {
    onChangeMetadata({
      ...metadata,
      [key]: value,
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          onChangeMetadata({
            ...metadata,
            avatarSrc: base64,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = () => {
    onChangeMetadata({
      ...metadata,
      avatarSrc: '',
    });
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const getRandomVibrantColor = () => {
    const defaultColors = [
      '#FF4D4D', '#FFB300', '#2E7D32', '#00ACC1', '#1565C0', '#6A1B9A', '#D81B60'
    ];
    const randomIndex = Math.floor(Math.random() * defaultColors.length);
    handleTextChange('avatarColor', defaultColors[randomIndex]);
  };

  const handleDownload = () => {
    if (!adjustment?.processedSrc) return;
    trackButtonClick('download_thumbnail', 'Download processed 16:9 JPEG thumbnail image');
    const name = imageName 
      ? `preview_${imageName.replace(/\.[^/.]+$/, "")}.jpg` 
      : 'youtube_thumbnail_16_9.jpg';
    downloadDataUrl(adjustment.processedSrc, name);
  };

  // Extract initials from channel name (max 2 characters)
  const getInitials = (name: string) => {
    if (!name) return 'Y';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-xl border border-yt-line bg-[#161616]/40 p-5" id="controls-outer-card">
      <div className={`flex items-center justify-between pb-4 ${isOpen ? 'border-b border-yt-line mb-4' : 'border-b border-transparent md:border-b-yt-line md:mb-4'}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-sans text-xs font-black text-white uppercase tracking-wider cursor-pointer select-none focus:outline-none"
        >
          <Sliders className="h-4 w-4 text-yt-red" />
          <span>Pre-render parameters</span>
          <span className="md:hidden">
            {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </span>
        </button>
        
        {/* Theme Switcher Button */}
        <div className="flex items-center gap-2.5">
          <span className="text-3xs font-mono font-bold tracking-wider text-zinc-400 capitalize">
            {theme === 'dark' ? 'Dark theme' : 'Light theme'}
          </span>
          <button
            type="button"
            onClick={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-zinc-400 focus:outline-none cursor-pointer"
            id="theme-switcher-toggle"
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? (
              <ToggleRight className="h-6 w-6 text-yt-red" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 gap-4">
        {/* Core texts */}
        <div className="space-y-4.5">
          <div>
            <label className="flex items-center gap-1.5 text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              <Type className="h-3.5 w-3.5" /> Video Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
              placeholder="e.g. Setting Up React inside Cloud Environments..."
              className="w-full rounded-lg border border-yt-line bg-[#0F0F0F] px-3.5 py-2 text-xs font-medium text-white focus:border-yt-red focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              <Users className="h-3.5 w-3.5" /> Channel Name
            </label>
            <input
              type="text"
              value={metadata.channelName}
              onChange={(e) => handleTextChange('channelName', e.target.value)}
              placeholder="e.g. Creative Code Studio"
              className="w-full rounded-lg border border-yt-line bg-[#0F0F0F] px-3.5 py-2 text-xs font-medium text-white focus:border-yt-red focus:outline-none transition-all"
            />
          </div>

          {/* Channel Avatar customization */}
          <div>
            <label className="flex items-center justify-between text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              <span>Channel Avatar Mockup</span>
              {metadata.avatarSrc && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="flex items-center gap-1 text-3xs text-yellow-500 hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Reset Custom Avatar
                </button>
              )}
            </label>
            
            <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-2 border border-yt-line">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-3xs font-bold text-white shadow-inner"
                style={{
                  backgroundColor: metadata.avatarSrc ? undefined : metadata.avatarColor,
                  backgroundImage: metadata.avatarSrc ? `url(${metadata.avatarSrc})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!metadata.avatarSrc && getInitials(metadata.channelName)}
              </div>
              
              <div className="flex-1 flex gap-2">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded bg-zinc-900 border border-yt-line px-2.5 py-1 text-3xs font-bold text-zinc-350 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex-1 uppercase tracking-wide"
                >
                  Upload custom icon
                </button>
                {!metadata.avatarSrc && (
                  <button
                    type="button"
                    onClick={getRandomVibrantColor}
                    className="rounded bg-zinc-900 border border-yt-line px-2.5 py-1 text-3xs font-bold text-zinc-350 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 uppercase tracking-wide"
                    title="Change fallback color"
                  >
                    Random color
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video properties & sliders */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                <Clock className="h-3.5 w-3.5" /> Video Length
              </label>
              <input
                type="text"
                value={metadata.duration}
                onChange={(e) => handleTextChange('duration', e.target.value)}
                placeholder="10:00"
                className="w-full rounded-lg border border-yt-line bg-[#0F0F0F] px-3 py-1.5 text-xs font-semibold text-white focus:border-yt-red focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                <Eye className="h-3.5 w-3.5" /> View Count
              </label>
              <input
                type="text"
                value={metadata.views}
                onChange={(e) => handleTextChange('views', e.target.value)}
                placeholder="250K views"
                className="w-full rounded-lg border border-yt-line bg-[#0F0F0F] px-3 py-1.5 text-xs font-semibold text-white focus:border-yt-red focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                <Play className="h-3.5 w-3.5" /> Upload Date
              </label>
              <input
                type="text"
                value={metadata.publishTime}
                onChange={(e) => handleTextChange('publishTime', e.target.value)}
                placeholder="3 hours ago"
                className="w-full rounded-lg border border-yt-line bg-[#0F0F0F] px-3 py-1.5 text-xs font-semibold text-white focus:border-yt-red focus:outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col justify-end">
              <label className="flex items-center justify-between text-3xs font-bold text-zinc-450 uppercase tracking-widest mb-1.5 select-none">
                <span>Indicators</span>
              </label>
              <div className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  id="unread-checkbox"
                  checked={metadata.unread}
                  onChange={(e) => handleTextChange('unread', e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-800 text-yt-red bg-[#0F0F0F] focus:ring-yt-red focus:ring-offset-0"
                />
                <label htmlFor="unread-checkbox" className="text-3xs font-bold uppercase text-zinc-400 select-none cursor-pointer tracking-wider">
                  Show Blue Mark
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-3xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              <span>Simulated Progress ({metadata.progress}%)</span>
              <button 
                type="button" 
                onClick={() => handleTextChange('progress', 0)}
                className="text-3xs text-zinc-500 hover:text-white hover:underline cursor-pointer uppercase tracking-wider"
              >
                Reset
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={metadata.progress}
              onChange={(e) => handleTextChange('progress', parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-yt-red focus:outline-none"
            />
          </div>
        </div>
      </div>

      {adjustment?.processedSrc && (
        <div className="mt-5 pt-4 border-t border-yt-line">
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yt-red hover:bg-red-650 px-4 py-2.5 text-2xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/20 transition-all pointer-events-auto cursor-pointer"
            id="download-processed-btn"
          >
            <Download className="h-3.5 w-3.5" />
            Download Processed Visual
          </button>
          
          <p className="mt-2 text-center text-3xs text-zinc-500 font-medium">
            Export cropped or padded image to active raw 16:9 file.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
