import { MoreVertical, CheckCircle2, Play, Shuffle, GripVertical, Trash2, Globe, Clock, LayoutGrid, ListVideo } from 'lucide-react';
import { MockMetadata, PreviewTheme, ThumbnailAdjustment } from '../types';

interface YoutubeMockupsProps {
  metadata: MockMetadata;
  adjustment: ThumbnailAdjustment | null;
  theme: PreviewTheme;
}

export default function YoutubeMockups({ metadata, adjustment, theme }: YoutubeMockupsProps) {
  const isDark = theme === 'dark';

  // Aesthetic styling classes matching YouTube specifications perfectly
  const ytColors = {
    bg: isDark ? 'bg-[#0F0F0F]' : 'bg-[#FFFFFF]',
    cardBg: isDark ? 'bg-[#1F1F1F]' : 'bg-[#F9F9F9]',
    textMain: isDark ? 'text-[#F1F1F1]' : 'text-[#0F0F0F]',
    textSub: isDark ? 'text-[#AAAAAA]' : 'text-[#606060]',
    badgeBg: isDark ? 'bg-[#272727]' : 'bg-[#000000]/05',
    border: isDark ? 'border-[#272727]' : 'border-[#E5E5E5]',
    hoverBg: isDark ? 'hover:bg-[#272727]' : 'hover:bg-[#000000]/05',
    sidebarBg: isDark ? 'bg-[#181818]' : 'bg-[#F2F2F2]',
    progressBg: 'bg-red-600',
    verified: 'text-slate-400 dark:text-slate-500',
    accentText: 'text-red-500'
  };

  const imageSrc = adjustment?.processedSrc || '';

  // Mini helper components
  const Avatar = ({ size = 'h-9 w-9 text-xs' }: { size?: string }) => (
    <div
      className={`flex shrink-0 ${size} items-center justify-center rounded-full text-white font-bold select-none`}
      style={{
        backgroundColor: metadata.avatarSrc ? undefined : metadata.avatarColor,
        backgroundImage: metadata.avatarSrc ? `url(${metadata.avatarSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!metadata.avatarSrc && (metadata.channelName ? metadata.channelName.slice(0, 2).toUpperCase() : 'Y')}
    </div>
  );

  // Play button overlay that appears on hover
  const ThumbnailImage = ({ className = "aspect-video w-full" }: { className?: string }) => (
    <div className={`relative overflow-hidden group rounded-xl bg-slate-100 dark:bg-slate-900 shadow-sm ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Thumbnail rendering"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-3xs font-medium text-slate-400 dark:text-slate-600">No Image Uploaded</p>
        </div>
      )}

      {/* Red watch progress overlay */}
      {metadata.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div 
            className={`h-full ${ytColors.progressBg}`} 
            style={{ width: `${metadata.progress}%` }} 
          />
        </div>
      )}

      {/* Duration overlay badge */}
      {metadata.duration && (
        <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1 py-0.5 font-mono text-[10px] font-medium text-white tracking-wide">
          {metadata.duration}
        </span>
      )}

      {/* Blue unread notification dot top right */}
      {metadata.unread && (
        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-md animate-pulse" />
      )}

      {/* Click play hover cover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-950/20 transform scale-90 group-hover:scale-100 transition-transform duration-200">
          <Play className="h-5 w-5 fill-white ml-0.5" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12" id="youtube-mockup-previews-list">
      
      {/* 1. Youtube Home Feed Mockup */}
      <section id="home-view" className="scroll-mt-8">
        <div className="flex items-center justify-between border-b border-yt-line pb-3 mb-6">
          <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
            <LayoutGrid className="h-4 w-4 text-yt-red" />
            Home Feed Mockup
          </span>
          <span className="text-3xs text-zinc-500 font-bold uppercase tracking-wider">
            Large Card standard desktop grid representation
          </span>
        </div>

        <div className={`rounded-xl p-6 ${ytColors.bg} border border-yt-line transition-colors duration-200 shadow-inner`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* The primary target video item */}
            <div className="flex flex-col gap-3 group" id="mock-home-card-target">
              <ThumbnailImage />
              
              <div className="flex gap-3">
                <Avatar />
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold leading-tight line-clamp-2 ${ytColors.textMain}`}>
                    {metadata.title || "Your Engaging Title | Previews Instantly and Beautifully in Both Themes"}
                  </h3>
                  
                  <div className={`mt-1.5 flex flex-col text-xs leading-normal ${ytColors.textSub}`}>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                      {metadata.channelName || "Creative Creator"}
                      <CheckCircle2 className="h-3 w-3 fill-slate-400 text-slate-900 dark:fill-slate-500 dark:text-[#0F0F0F]" />
                    </span>
                    <span className="text-[11px] truncate">
                      {metadata.views ? `${metadata.views} views` : "0 views"} • {metadata.publishTime || "Just now"}
                    </span>
                  </div>
                </div>
                <button type="button" className={`h-6 w-6 text-slate-400 shrink-0 rounded-full flex items-center justify-center ${ytColors.hoverBg} self-start`}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulated Adjacent Video 1 (To give perfect visual contrast & validation context) */}
            <div className="flex flex-col gap-3 opacity-65 group select-none pointer-events-none">
              <div className="relative aspect-video rounded-xl bg-slate-200 dark:bg-[#212121] flex items-center justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-800">
                  <Play className="h-5 w-5 text-slate-400" />
                </div>
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1 py-0.5 font-mono text-[10px] text-white">08:15</span>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-[#212121]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-[#212121] rounded w-11/12" />
                  <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-2/3" />
                  <div className="h-2 bg-slate-200 dark:bg-[#212121] rounded w-1/3" />
                </div>
              </div>
            </div>

            {/* Simulated Adjacent Video 2 */}
            <div className="flex flex-col gap-3 opacity-65 group select-none pointer-events-none hidden lg:flex">
              <div className="relative aspect-video rounded-xl bg-slate-200 dark:bg-[#212121] flex items-center justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-800">
                  <Play className="h-5 w-5 text-slate-400" />
                </div>
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1 py-0.5 font-mono text-[10px] text-white">22:40</span>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-[#212121]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-[#212121] rounded w-5/6" />
                  <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-3/4" />
                  <div className="h-2 bg-slate-200 dark:bg-[#212121] rounded w-1/2" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Youtube Search Result Mockup */}
      <section id="search-view" className="scroll-mt-8">
        <div className="flex items-center justify-between border-b border-yt-line pb-3 mb-6">
          <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
            <LayoutGrid className="h-4 w-4 text-yt-red" />
            Search Result Mockup
          </span>
          <span className="text-3xs text-zinc-500 font-bold uppercase tracking-wider">
            Horizontal layout on desktop search feeds
          </span>
        </div>

        <div className={`rounded-xl p-6 ${ytColors.bg} border border-yt-line transition-colors duration-200 shadow-inner`}>
          <div className="flex flex-col md:flex-row gap-5 items-start" id="mock-search-card-target">
            
            {/* Left aligned thumbnail */}
            <div className="w-full md:w-[320px] lg:w-[360px] shrink-0">
              <ThumbnailImage />
            </div>

            {/* Right aligned details */}
            <div className="flex-1 min-w-0 py-1">
              <h3 className={`text-base md:text-lg font-semibold leading-snug line-clamp-2 ${ytColors.textMain}`}>
                {metadata.title || "Your Engaging Title | Previews Instantly and Beautifully in Both Themes"}
              </h3>
              
              <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${ytColors.textSub}`}>
                <span className="truncate">{metadata.views ? `${metadata.views} views` : "0 views"}</span>
                <span>•</span>
                <span className="truncate">{metadata.publishTime || "Just now"}</span>
              </div>

              {/* Creator details row */}
              <div className="mt-3.5 flex items-center gap-2.5">
                <Avatar size="h-6 w-6 text-3xs" />
                <span className={`text-[12px] font-medium flex items-center gap-1 ${ytColors.textSub}`}>
                  {metadata.channelName || "Creative Creator"}
                  <CheckCircle2 className="h-3 w-3 fill-slate-400 text-slate-900 dark:fill-slate-500 dark:text-[#0F0F0F]" />
                </span>
              </div>

              {/* Simulated description snippet */}
              <p className={`mt-3.5 text-xs line-clamp-1 leading-normal hidden sm:block ${ytColors.textSub}`}>
                Check how video previews render inside multiple channels! Complete aspect-ratio fit triggers automatically upon file upload.
              </p>

              {/* Simulated badge */}
              <span className={`mt-3 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${ytColors.badgeBg} ${ytColors.textMain}`}>
                4K UHD
              </span>
            </div>
            
            <button type="button" className={`h-8 w-8 text-slate-400 shrink-0 rounded-full flex items-center justify-center ${ytColors.hoverBg} self-start`}>
              <MoreVertical className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Youtube History Section Mockup */}
      <section id="history-view" className="scroll-mt-8">
        <div className="flex items-center justify-between border-b border-yt-line pb-3 mb-6">
          <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
            <LayoutGrid className="h-4 w-4 text-yt-red" />
            History Feed Mockup
          </span>
          <span className="text-3xs text-zinc-500 font-bold uppercase tracking-wider">
            Compact layout inside historical watched lists
          </span>
        </div>

        <div className={`rounded-xl p-6 ${ytColors.bg} border border-yt-line transition-colors duration-200 shadow-inner`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="mock-history-list">
            
            {/* Main thumbnail mockup */}
            <div className="flex flex-col gap-2 group relative">
              <ThumbnailImage />
              
              <div className="pr-6 mt-1">
                <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${ytColors.textMain}`}>
                  {metadata.title || "Your Engaging Title | Previews Instantly and Beautifully in Both Themes"}
                </h4>
                <div className={`mt-1 text-4xs leading-normal flex flex-col ${ytColors.textSub}`}>
                  <span className="flex items-center gap-0.5 font-semibold">
                    {metadata.channelName || "Creative Creator"}
                    <CheckCircle2 className="h-2.5 w-2.5 fill-slate-500 dark:fill-slate-500" />
                  </span>
                  <span className="mt-0.5">
                    {metadata.views ? `${metadata.views} views` : "0 views"}
                  </span>
                </div>
              </div>

              {/* Simulation absolute close button */}
              <button 
                type="button" 
                title="Remove from history"
                className="absolute right-0 bottom-6 shrink-0 rounded-full h-5 w-5 bg-black/5 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 select-none cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {/* Sample History Item 2 */}
            <div className="flex flex-col gap-2 opacity-50 select-none pointer-events-none">
              <div className="aspect-video rounded-xl bg-slate-200 dark:bg-[#212121]" />
              <div>
                <div className="h-3 bg-slate-200 dark:bg-[#212121] rounded w-5/6" />
                <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-1/2 mt-1.5" />
              </div>
            </div>

            {/* Sample History Item 3 */}
            <div className="flex flex-col gap-2 opacity-50 select-none pointer-events-none hidden md:flex">
              <div className="aspect-video rounded-xl bg-slate-200 dark:bg-[#212121]" />
              <div>
                <div className="h-3 bg-slate-200 dark:bg-[#212121] rounded w-4/5" />
                <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-1/3 mt-1.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Youtube Watch List Mockup */}
      <section id="watch-later-view" className="scroll-mt-8">
        <div className="flex items-center justify-between border-b border-yt-line pb-3 mb-6">
          <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
            <LayoutGrid className="h-4 w-4 text-yt-red" />
            Watch List Mockup
          </span>
          <span className="text-3xs text-zinc-500 font-bold uppercase tracking-wider">
            Highly dense list row components
          </span>
        </div>

        <div className={`rounded-xl p-6 ${ytColors.bg} border border-yt-line transition-colors duration-200 shadow-inner`}>
          <div className="space-y-4" id="mock-queue-list">
            
            {/* The Row */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl ${ytColors.hoverBg} transition-colors group`}>
              <GripVertical className="h-4 w-4 text-slate-400 cursor-grab shrink-0" />
              
              <span className={`text-xs font-sans font-bold w-5 shrink-0 text-center ${ytColors.textSub}`}>
                1
              </span>

              {/* Compressed Thumbnail aspect ratio box */}
              <div className="w-28 sm:w-36 shrink-0">
                <ThumbnailImage />
              </div>

              {/* Row description text */}
              <div className="flex-1 min-w-0 pr-3">
                <h4 className={`text-xs sm:text-xs font-bold line-clamp-1 leading-normal ${ytColors.textMain}`}>
                  {metadata.title || "Your Engaging Title | Previews Instantly and Beautifully in Both Themes"}
                </h4>
                
                <p className={`text-[10px] leading-tight mt-1 flex items-center gap-1 truncate ${ytColors.textSub}`}>
                  <span>{metadata.channelName || "Creative Creator"}</span>
                  <span className="inline-block h-1 w-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
                  <span>{metadata.duration || "10:00"}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button type="button" className={`h-7 w-7 text-slate-400 rounded-full flex items-center justify-center ${ytColors.hoverBg} cursor-pointer`}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Adjacent item 2 */}
            <div className="flex items-center gap-3 p-2.5 opacity-40 select-none pointer-events-none">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <span className="text-xs font-sans font-bold w-5 text-center text-slate-400">2</span>
              <div className="w-28 sm:w-36 aspect-video rounded-lg bg-slate-200 dark:bg-[#212121]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-1/2" />
                <div className="h-2 bg-slate-200 dark:bg-[#212121] rounded w-1/4" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Youtube Playlist View Mockup */}
      <section id="playlist-view" className="scroll-mt-8">
        <div className="flex items-center justify-between border-b border-yt-line pb-3 mb-6">
          <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
            <LayoutGrid className="h-4 w-4 text-yt-red" />
            Playlist Mockup Panel
          </span>
          <span className="text-3xs text-zinc-500 font-bold uppercase tracking-wider">
            Horizontal dual layout split view
          </span>
        </div>

        <div className={`rounded-xl p-6 ${ytColors.bg} border border-yt-line transition-colors duration-200 shadow-inner`}>
          <div className="flex flex-col lg:flex-row gap-6" id="mock-playlist-split">
            
            {/* Playlist vertical header column */}
            <div className={`w-full lg:w-[320px] rounded-xl p-5 shrink-0 ${ytColors.sidebarBg} relative overflow-hidden flex flex-col border border-yt-line`}>
              
              {/* Overlay blurred background representing contemporary modern playlist style */}
              {imageSrc && (
                <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-2xl pointer-events-none scale-105" style={{ backgroundImage: `url(${imageSrc})` }} />
              )}

              <div className="relative z-10">
                <ThumbnailImage />
                
                <h3 className={`mt-4 text-base font-extrabold tracking-tight line-clamp-2 ${ytColors.textMain}`}>
                  Trending Thumbnail Previews 
                </h3>

                <p className={`mt-2 text-xs font-semibold ${ytColors.textMain}`}>
                  {metadata.channelName || "Creative Creator"}
                </p>

                <p className={`mt-1 text-[11px] font-medium leading-none ${ytColors.textSub}`}>
                  5 items • Created today • 1,240 views
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] leading-tight font-medium pb-4 border-b border-yt-line">
                  <Globe className="h-3 w-3 text-zinc-500" />
                  <span className={`${ytColors.textSub}`}>Public Playlist</span>
                </div>

                {/* Simulated Control Pill Buttons */}
                <div className="mt-4.5 grid grid-cols-2 gap-2.5">
                  <button type="button" className="flex items-center justify-center gap-1.5 rounded-full bg-white text-black hover:bg-slate-100 dark:bg-white dark:text-black dark:hover:bg-slate-100 py-1.5 text-xs font-bold leading-none cursor-pointer">
                    <Play className="h-3 w-3 fill-black text-black" /> Play All
                  </button>
                  <button type="button" className={`flex items-center justify-center gap-1.5 rounded-full bg-black/10 text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15 py-1.5 text-xs font-bold leading-none cursor-pointer`}>
                    <Shuffle className="h-3 w-3" /> Shuffle
                  </button>
                </div>
              </div>
            </div>

            {/* Playlist sequential rows to watch */}
            <div className="flex-1 space-y-3 pt-1">
              
              {/* Row item #1 (Our beautiful target) */}
              <div className={`flex items-center gap-2.5 p-2 rounded-xl border border-transparent ${ytColors.hoverBg}`}>
                <span className={`text-2xs font-bold w-4 shrink-0 text-center ${ytColors.textSub}`}>1</span>
                
                <div className="w-[110px] shrink-0">
                  <ThumbnailImage />
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className={`text-xs font-bold line-clamp-1 truncate ${ytColors.textMain}`}>
                    {metadata.title || "Your Engaging Title | Previews Instantly and Beautifully in Both Themes"}
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${ytColors.textSub}`}>
                    {metadata.channelName || "Creative Creator"}
                  </p>
                </div>
                <button type="button" className="h-6 w-6 text-slate-400"><MoreVertical className="h-3.5 w-3.5" /></button>
              </div>

              {/* Mock item #2 */}
              <div className="flex items-center gap-2.5 p-2 opacity-40 select-none pointer-events-none">
                <span className="text-2xs font-bold w-4 text-center text-slate-400">2</span>
                <div className="w-[110px] aspect-video rounded-lg bg-slate-200 dark:bg-[#212121]" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-2/3" />
                  <div className="h-2 bg-slate-200 dark:bg-[#212121] rounded w-1/3" />
                </div>
              </div>

              {/* Mock item #3 */}
              <div className="flex items-center gap-2.5 p-2 opacity-40 select-none pointer-events-none">
                <span className="text-2xs font-bold w-4 text-center text-slate-400">3</span>
                <div className="w-[110px] aspect-video rounded-lg bg-slate-200 dark:bg-[#212121]" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 bg-slate-200 dark:bg-[#212121] rounded w-3/4" />
                  <div className="h-2 bg-slate-200 dark:bg-[#212121] rounded w-1/4" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
