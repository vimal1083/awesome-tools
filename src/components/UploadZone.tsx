import React, { useState, useRef } from 'react';
import { UploadCloud, FileWarning, Eye, RefreshCw } from 'lucide-react';
import { ImageMetadata } from '../types';
import { formatFileSize } from '../utils';

interface UploadZoneProps {
  onImageLoaded: (metadata: ImageMetadata) => void;
  onClear: () => void;
  currentImage: ImageMetadata | null;
}

export default function UploadZone({ onImageLoaded, onClear, currentImage }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate type is image
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload a standard image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    // Validate size (100 MB limit)
    const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_SIZE) {
      setError(`File size is too large (${formatFileSize(file.size)}). The maximum limit is 100 MB for browser memory.`);
      return;
    }

    setIsLoading(true);
    const objectUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      onImageLoaded({
        src: objectUrl,
        name: file.name,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Could not decode image features. The image file might be corrupted.');
      setIsLoading(false);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
        id="thumbnail-file-selector"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
          isDragging
            ? 'border-yt-red bg-yt-red/5'
            : currentImage
            ? 'border-zinc-700 bg-[#161616]/40'
            : 'border-zinc-800 hover:border-zinc-700 bg-[#161616]/20'
        }`}
        id="uploader-container"
      >
        {isLoading ? (
          <div className="flex flex-col items-center py-6">
            <RefreshCw className="h-9 w-9 animate-spin text-yt-red" />
            <p className="mt-3 text-xs font-semibold text-zinc-300">
              Examining and mapping dimensions...
            </p>
          </div>
        ) : currentImage ? (
          <div className="w-full">
            <div className="flex flex-col items-center justify-between gap-3 border-b border-dashed border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3 text-left w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-yt-red font-bold">
                  <Eye className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white max-w-[180px] sm:max-w-xs md:max-w-md">
                    {currentImage.name}
                  </p>
                  <p className="text-3xs font-mono text-zinc-400 mt-0.5 font-semibold">
                    {currentImage.width} × {currentImage.height}px • {formatFileSize(currentImage.size)}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onClear}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-yt-line bg-[#1E1E1E] px-3.5 py-1.5 text-3xs font-black uppercase text-zinc-300 hover:bg-[#252525] hover:text-yt-red transition-colors cursor-pointer"
                id="reset-uploader-btn"
              >
                Upload Different Image
              </button>
            </div>

            {/* Micro thumbnail preview in uploader */}
            <div className="flex justify-center">
              <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-yt-line">
                <img
                  src={currentImage.src}
                  alt="Thumbnail small representation"
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-yt-line text-zinc-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            
            <button
              type="button"
              onClick={handleButtonClick}
              className="rounded-lg bg-yt-red px-5 py-2.5 text-2xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-950/25"
              id="select-file-main-button"
            >
              Select Image File
            </button>
            
            <p className="mt-3 text-3xs font-extrabold text-zinc-400 uppercase tracking-widest">
              or drag &amp; drop file directly here
            </p>
            
            <p className="mt-4 text-3xs text-zinc-500">
              Supports PNG, JPG, WEBP, or SVG up to <strong className="text-zinc-400">100 MB</strong> size
            </p>
          </div>
        )}

        {/* Error Dialog Banner */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-950/20 p-3 text-left text-3xs font-semibold text-red-300 border border-red-900/30 w-full animate-fade-in">
            <FileWarning className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-bold text-red-200 uppercase tracking-wider">Upload Restricted</p>
              <p className="mt-0.5 leading-relaxed text-zinc-350">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
