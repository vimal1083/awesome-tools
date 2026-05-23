import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ConfirmationDialog from './components/ConfirmationDialog';
import ControlPanel from './components/ControlPanel';
import YoutubeMockups from './components/YoutubeMockups';
import ImageAnalyzer from './components/ImageAnalyzer';
import SeoHub from './components/SeoHub';
import { ImageMetadata, MockMetadata, PreviewTheme, ThumbnailAdjustment } from './types';
import { generateDefaultDynamicPattern } from './utils';
import { 
  Shield, 
  Sparkles, 
  AlertCircle, 
  LayoutGrid, 
  Heart, 
  Sliders, 
  FileText, 
  Award, 
  HelpCircle, 
  Activity, 
  ChevronRight 
} from 'lucide-react';
import { 
  initGoogleAnalytics, 
  startEngagementTimer, 
  logTelemetryEvent, 
  trackButtonClick, 
  trackParameterTweak 
} from './analytics';

const INITIAL_METADATA: MockMetadata = {
  title: 'How to build premium high-performance web applications using local reactive loops',
  channelName: 'Creative Sandbox Studio',
  avatarSrc: '',
  avatarColor: '#2E7D32',
  duration: '11:42',
  views: '482K',
  publishTime: '4 hours ago',
  unread: true,
  progress: 74,
};

export default function App() {
  const [currentImage, setCurrentImage] = useState<ImageMetadata | null>(null);
  const [adjustment, setAdjustment] = useState<ThumbnailAdjustment | null>(null);
  const [theme, setTheme] = useState<PreviewTheme>('light');
  const [metadata, setMetadata] = useState<MockMetadata>(() => {
    try {
      const saved = localStorage.getItem('ytt_metadata');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_METADATA, ...parsed };
      }
    } catch (e) {
      console.error('Error reading metadata from localStorage:', e);
    }
    return INITIAL_METADATA;
  });
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [viewportView, setViewportView] = useState<string>('studio'); // 'studio' | 'ctr-formula' | 'psychology' | 'features-faq' | 'analytics-monitor'

  // Initialize Google Analytics (GA4) and track engagement seconds
  useEffect(() => {
    initGoogleAnalytics();
    const cleanEngagementTimer = startEngagementTimer();
    
    // Read route on load from location hash
    const currentHash = window.location.hash;
    if (currentHash === '#ctr-guide') setViewportView('ctr-formula');
    else if (currentHash === '#thumbnail-psychology') setViewportView('psychology');
    else if (currentHash === '#technical-faq') setViewportView('features-faq');
    
    return () => {
      if (cleanEngagementTimer) cleanEngagementTimer();
    };
  }, []);

  // Track viewport view shifts
  useEffect(() => {
    logTelemetryEvent('User Engagement', 'page_view_changed', {
      view_name: viewportView,
      path: window.location.hash || '#preview',
    });
  }, [viewportView]);

  // Sync metadata to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ytt_metadata', JSON.stringify(metadata));
    } catch (e) {
      console.error('Error saving metadata to localStorage:', e);
    }
  }, [metadata]);

  // Load beautiful placeholder visual dynamically on first mount
  useEffect(() => {
    const demoPatternBase64 = generateDefaultDynamicPattern();
    if (demoPatternBase64) {
      setCurrentImage({
        src: demoPatternBase64,
        name: 'default_placeholder_youtube_thumbnail.jpg',
        size: 245312, // ~245KB
        width: 1280,
        height: 720,
        aspectRatio: 16 / 9,
      });
      setAdjustment({
        mode: 'original',
        processedSrc: demoPatternBase64,
        paddingStyle: 'black',
      });
      setIsDemoActive(true);
    }
  }, []);

  const handleImageLoaded = (meta: ImageMetadata) => {
    setCurrentImage(meta);
    setIsDemoActive(false);
    
    // Log beautiful custom GA telemetry event
    logTelemetryEvent('Interactions', 'image_uploaded', {
      file_name: meta.name,
      file_size_bytes: meta.size,
      width: meta.width,
      height: meta.height,
      aspect_ratio: meta.aspectRatio.toFixed(2)
    });
  };

  const handleClearImage = () => {
    trackButtonClick('clear_image', 'Clear current uploaded thumbnail');
    setCurrentImage(null);
    setAdjustment(null);
    setIsDemoActive(false);
  };

  const handleActivateDemo = () => {
    trackButtonClick('load_demo_template', 'Load futuristic tech demo template background');
    const demoPatternBase64 = generateDefaultDynamicPattern();
    setCurrentImage({
      src: demoPatternBase64,
      name: 'default_placeholder_youtube_thumbnail.jpg',
      size: 245312,
      height: 720,
      width: 1280,
      aspectRatio: 16 / 9,
    });
    setAdjustment({
      mode: 'original',
      processedSrc: demoPatternBase64,
      paddingStyle: 'black',
    });
    setIsDemoActive(true);
  };

  const handleSeoTabChange = (tabId: string) => {
    if (tabId === 'ctr-formula') setViewportView('ctr-formula');
    else if (tabId === 'psychology') setViewportView('psychology');
    else if (tabId === 'features-faq') setViewportView('features-faq');
  };

  return (
    <div className="min-h-screen bg-yt-black text-white selection:bg-yt-red/30 transition-colors duration-200">
      
      {/* Header section with high-quality SEO texts */}
      <Header />

      {/* Main Top Horizontal Tabs Navigation - Search Engine Optimized */}
      <div className="border-b border-yt-line bg-[#0c0c0c]/90 backdrop-blur-md sticky top-0 z-50 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 py-3">
          
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-3xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              Live App Version 2.4.0
            </span>
          </div>

          <nav className="flex flex-wrap gap-1 sm:gap-2">
            {[
              { id: 'studio', label: 'Interactive CTR Studio', icon: Sliders, hash: '#preview' },
              { id: 'ctr-formula', label: 'YouTube SEO Formula', icon: FileText, hash: '#ctr-guide' },
              { id: 'psychology', label: 'Contrast Psychology', icon: Award, hash: '#thumbnail-psychology' },
              { id: 'features-faq', label: 'Technical Specs & FAQ', icon: HelpCircle, hash: '#technical-faq' },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = viewportView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setViewportView(tab.id);
                    window.location.hash = tab.hash;
                    trackButtonClick('top_nav_tab_click', `Navigate to tab ${tab.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-yt-red text-white shadow-md shadow-yt-red/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-yt-line'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span className="hidden leading-none sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ').slice(-1)[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        
        {viewportView === 'studio' ? (
          /* View A: Core Creator Workspace Grid */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 animate-fade-in">
            
            {/* Left Column (Upload configuration & Options panels) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Header/Title block for settings */}
              <div className="border-b border-yt-line pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-yt-red flex items-center gap-1.5 mb-2">
                  <Shield className="h-4 w-4" />
                  Control &amp; Metrics
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Check and convert aspect ratios instantly in your browser. All processing is kept private in device memory.
                </p>
              </div>

              {/* Uploader Dropzone */}
              <UploadZone
                onImageLoaded={handleImageLoaded}
                onClear={handleClearImage}
                currentImage={currentImage}
              />

              {/* Demo Trigger Panel if user has deleted original picture */}
              {!currentImage && (
                <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-center bg-zinc-900/10">
                  <p className="text-xs font-semibold text-zinc-300">
                    Don&#39;t have an image ready right now?
                  </p>
                  <p className="text-3xs text-zinc-500 mt-1 leading-normal">
                    Load our programmatically drawn tech background to see how different mockup ratios display.
                  </p>
                  <button
                    type="button"
                    onClick={handleActivateDemo}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-2xs font-bold text-zinc-200 hover:bg-zinc-805 transition-colors cursor-pointer"
                    id="load-demo-btn"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Use Futuristic Demo Template
                  </button>
                </div>
              )}

              {/* Aspect Ratio Confirmation dialogue */}
              {currentImage && (
                <ConfirmationDialog
                  imageMetadata={currentImage}
                  onChangeAdjustment={setAdjustment}
                  currentAdjustment={adjustment}
                />
              )}

              {/* CTR Diagnostic Score details */}
              {currentImage && (
                <ImageAnalyzer
                  imageMetadata={currentImage}
                  mockMetadata={metadata}
                />
              )}

              {/* Simulated parameter tweaks cards */}
              <ControlPanel
                metadata={metadata}
                onChangeMetadata={(updatedMeta) => {
                  setMetadata(updatedMeta);
                  // Track parameter adjustments in Google Analytics live telemetry helper
                  Object.keys(updatedMeta).forEach((key) => {
                    const typedKey = key as keyof MockMetadata;
                    if (updatedMeta[typedKey] !== metadata[typedKey]) {
                      trackParameterTweak(typedKey, updatedMeta[typedKey]);
                    }
                  });
                }}
                theme={theme}
                onChangeTheme={(newTheme) => {
                  setTheme(newTheme);
                  logTelemetryEvent('Interactions', 'theme_changed', { theme: newTheme });
                }}
                adjustment={adjustment}
                imageName={currentImage?.name}
              />
            </div>

            {/* Right Column (Live pre-render feeds simulation cards list) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header toolbar with Anchor shortcuts to target preview screens */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-yt-line pb-4">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-widest">
                    <LayoutGrid className="h-4 w-4 text-yt-red" />
                    Live Feeds Mockups
                  </span>
                  <p className="text-3xs text-zinc-400 mt-0.5">
                    Click anchors to scroll instantly to target layout feed simulators.
                  </p>
                </div>

                {/* Navigation chips for convenience */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'home-view', label: 'Home Feed' },
                    { id: 'search-view', label: 'Search Results' },
                    { id: 'history-view', label: 'History' },
                    { id: 'watch-later-view', label: 'Watch Later' },
                    { id: 'playlist-view', label: 'Playlist' }
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                        trackButtonClick('scroll_anchor_click', `Scroll to ${sec.label}`);
                      }}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-3xs font-bold text-zinc-300 hover:text-yt-red cursor-pointer pointer-events-auto transition-colors border border-yt-line"
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informational banner when in Demo Mode */}
              {isDemoActive && (
                <div className="flex gap-2.5 rounded-2xl bg-indigo-500/5 p-4 border border-indigo-500/20 text-xs text-indigo-300 animate-fade-in">
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-indigo-300 uppercase tracking-wide">Viewing Active Demo Presentation</p>
                    <p className="mt-0.5 text-zinc-400 leading-normal text-2xs">
                      This sample 1280×720 visual preview was created locally using interactive Canvas shapes. Upload your personal banner cover above at any time to instantly analyze your designs.
                    </p>
                  </div>
                </div>
              )}

              {/* Actual Previews list */}
              {adjustment ? (
                <YoutubeMockups
                  metadata={metadata}
                  adjustment={adjustment}
                  theme={theme}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-yt-line min-h-[360px] text-center p-6 bg-[#161616]/20">
                  <AlertCircle className="h-10 w-10 text-zinc-600 mb-3" />
                  <h4 className="text-sm font-bold text-zinc-300">Awaiting Image Selection</h4>
                  <p className="text-2xs text-zinc-500 mt-1 max-w-sm mx-auto leading-normal">
                    Drop a custom image or click the fallback trigger to pre-render layout interfaces.
                  </p>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* View B: Focused Interactive SEO Resource Slide */
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setViewportView('studio');
                  window.location.hash = '#preview';
                }}
                className="flex items-center gap-1.5 text-3xs font-black uppercase text-yt-red hover:text-white transition-colors cursor-pointer bg-zinc-900 border border-yt-line rounded-lg px-4 py-2"
              >
                <span>&larr; Back to Interactive CTR Studio</span>
              </button>
              <div className="flex items-center gap-1.5 text-3xs font-mono text-zinc-400">
                <span>Active Page Route:</span>
                <code className="bg-zinc-950 px-2 py-0.5 rounded text-zinc-300">{window.location.hash}</code>
              </div>
            </div>
            
            <SeoHub 
              activeTab={viewportView}
              onTabChange={setViewportView}
            />
          </div>
        )}

      </main>

      {/* SEO Bottom Footer Knowledge Hub (Always visible to web spiders/spiders for maximum keyword backlinking!) */}
      {viewportView === 'studio' && (
        <SeoHub 
          activeTab="ctr-formula"
          onTabChange={handleSeoTabChange}
        />
      )}

      {/* Footer section with clear privacy & utility details */}
      <footer className="bg-slate-100 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-900 py-10 mt-16 text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-300">
              YTT Previewer — YouTube Thumbnail Diagnostic Tool
            </p>
            <p className="text-slate-400 font-medium">
              Unlimited processing, 100% Client-Side. Developed for creators, designers, and web developers. Including GA4 instrumentation.
            </p>
          </div>

          <div className="flex items-center gap-1.5 justify-center md:justify-end text-slate-400 dark:text-slate-500 font-semibold font-mono tracking-tight select-none">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>for the YouTube Community</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
