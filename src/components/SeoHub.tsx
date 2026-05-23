import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Eye, 
  TrendingUp, 
  Settings, 
  BookOpen, 
  Award, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink,
  Sliders,
  ShieldCheck,
  MousePointerClick,
  Timer
} from 'lucide-react';
import { TelemetryEvent, subscribeToTelemetry, getCumulativeTimeSeconds, trackButtonClick } from '../analytics';

interface SeoHubProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SeoHub({ activeTab, onTabChange }: SeoHubProps) {
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEvent[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [timeOnline, setTimeOnline] = useState(0);

  // Subscribe to live tracking telemetry
  useEffect(() => {
    return subscribeToTelemetry((logs) => {
      setTelemetryLogs(logs);
    });
  }, []);

  // Sync session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnline(getCumulativeTimeSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = (hash: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(hash);
      setTimeout(() => setCopiedLink(null), 2000);
    });
    trackButtonClick('copy_seo_anchor', `Copy anchor ${hash}`);
  };

  // Structured Data Schema (JSON-LD) for Google Rich Snippets
  const seoSchemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free YouTube Thumbnail Previewer & CTR Analyzer",
    "operatingSystem": "All major web browsers (Chrome, Safari, Firefox, Edge)",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Instant multi-grid YouTube feed mockups (Home Feed, Search Results, Watching Now, Sidebar Mobile/Desktop layouts)",
      "Zero-latency pixel client-side image fitting and custom 16:9 padded scale analyzer",
      "Dynamic in-browser contrast, entropy, focal saturation, and readable text safe-zone grid detector",
      "Google Analytics telemetry integration for CTR tracking testing",
      "100% Secure private offline sandbox running strictly on device memory"
    ],
    "about": {
      "@type": "Thing",
      "name": "YouTube Click-Through Rate (CTR) and Metadata Optimizer"
    }
  };

  const faqSchemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is a 16:9 aspect ratio critical for YouTube thumbnails?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "YouTube's player and search index card components require standard images of exactly 1280x720 pixels (a ratio of 16:9). Images of other shapes are cropped automatically or given ugly black margin margins, which visually dilutes your branding and decreases your Click-Through Rate (CTR)."
        }
      },
      {
        "@type": "Question",
        "name": "How does dynamic pixel contrast help a video rank first on search?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "YouTube's Recommendation Neural Network (Recommendation Algorithm) operates primarily on viewer engagement signals: CTR (Click-Through Rate) and AVD (Average View Duration). High-contrast thumbnail art catches user eyes up to three times faster inside high-density lists, forcing higher immediate click conversions."
        }
      }
    ]
  };

  return (
    <section className="bg-zinc-900/40 border-t border-yt-line py-12 px-4 sm:px-6" id="seo-knowledge-center">
      
      {/* Dynamic injection of the rich Structured Data into the web page */}
      <script type="application/ld+json">
        {JSON.stringify(seoSchemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchemaData)}
      </script>

      <div className="mx-auto max-w-6xl">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yt-red/10 border border-yt-red/20 rounded-full text-xs font-black uppercase text-yt-red tracking-wider">
            <TrendingUp className="h-3 w-3" />
            <span>Search Engine Optimization &amp; Analytics Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            How Static Landing Pages &amp; CTR Scoring Launch Videos to Page #1
          </h2>
          <p className="text-2xs text-zinc-400 leading-relaxed">
            Crawlers seek high structured-relevance. Use our deep SEO resources and static visual psychological schemas below to optimize production feeds.
          </p>
        </div>

        {/* SEO Navigation Bar */}
        <div className="flex flex-wrap justify-center border-b border-yt-line mb-8 p-1 gap-1.5 bg-zinc-950/80 rounded-xl max-w-3xl mx-auto">
          {[
            { id: 'ctr-formula', label: '1. YouTube SEO Formula', icon: FileText, hash: '#ctr-guide' },
            { id: 'psychology', label: '2. Contrast Psychology', icon: Award, hash: '#thumbnail-psychology' },
            { id: 'features-faq', label: '3. Technical Specs & FAQ', icon: HelpCircle, hash: '#technical-faq' },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  window.location.hash = tab.hash;
                  trackButtonClick('seo_hub_nav_click', `Navigate to ${tab.label}`);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-2xs font-extrabold uppercase tracking-wide rounded-lg cursor-pointer transition-all ${
                  isTabActive 
                    ? 'bg-yt-red text-white shadow-lg shadow-yt-red/10' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Static-like Page Views Container */}
        <div className="bg-[#121212] border border-yt-line rounded-2xl p-6 sm:p-8">
          
          {/* TAB 1: CTR Formula Guide */}
          {activeTab === 'ctr-formula' && (
            <div className="space-y-6 animate-fade-in text-zinc-305 text-xs">
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-yt-line pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-normal flex items-center gap-2">
                    <FileText className="text-yt-red h-5 w-5" />
                    How YouTube Search and Recommended Engines Rate Your CTR
                  </h3>
                  <p className="text-2xs text-zinc-400 mt-1">SEO Ranking Factor: The Core Equation Linking Metadata Relevance to User Impressions.</p>
                </div>
                <button
                  onClick={() => handleCopyLink('#ctr-guide')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-90 w-full sm:w-auto text-3xs font-bold uppercase tracking-wider text-zinc-400 border border-yt-line hover:text-white transition-colors cursor-pointer"
                >
                  {copiedLink === '#ctr-guide' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink === '#ctr-guide' ? 'Copied Static URL!' : 'Share SEO Section'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-4">
                  <p className="leading-relaxed text-zinc-350">
                    To make your web app or videos rank first on search engines and the YouTube algorithm tab, crawlers evaluate textual density alongside high-relevance backlinking. Search engines like Google prioritize page structures that answer actual user intents directly. Here is a technical breakdown of how SEO indexing maps:
                  </p>

                  <div className="p-4 bg-[#0A0A0A] border-l-4 border-yt-red rounded-r-lg space-y-2">
                    <h4 className="font-extrabold uppercase text-white tracking-wide text-xs">
                      The Algorithmic CTR Value Funnel
                    </h4>
                    <p className="text-2xs text-zinc-400 leading-relaxed">
                      Every video upload is fed to an initial test cohort (approx. 500 impressions). If the video receives a <strong className="text-white">low Click-Through Rate (&lt;3%)</strong>, the algorithm truncates subsequent recommendations, fearing bad viewer retention. A <strong className="text-white">high Click-Through Rate (&gt;8%)</strong> triggers downstream impressions on mobile home screens.
                    </p>
                  </div>

                  <h4 className="text-xs font-black uppercase text-white tracking-widest pt-2 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-yt-red" />
                    Crucial Thumbnail SEO Guidelines
                  </h4>
                  <ul className="space-y-3 text-2xs pl-2 text-zinc-300 list-none">
                    <li className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-yt-red mt-1 shrink-0" />
                      <div>
                        <strong>Syntactic Visual Redundancy:</strong> Never duplicate your exact title's text verbatim in the thumbnail graphic. Instead, write supplementary punching phrases (3-4 words max) to act as a tag-team semantic combo.
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start border-t border-yt-line/60 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yt-red mt-1 shrink-0" />
                      <div>
                        <strong>Mobile Text Scale Multiplier:</strong> Over 70% of YouTube plays happen on mobile viewports. Thumbnail texts must span at least 30% of the image size in height, paired with thick charcoal drop shadows for legible separation.
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start border-t border-yt-line/60 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yt-red mt-1 shrink-0" />
                      <div>
                        <strong>File Meta Tags Injection:</strong> Before saving your thumbnail, rename the local file using target high-value keyword chains (e.g. <code>free-youtube-ctr-previewer-tool.jpg</code>) instead of random default camera prefixes (e.g. <code>IMG_3482.jpg</code>). Crowlers parse image alt strings and binary descriptors carefully.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="md:col-span-4 bg-[#161616]/70 border border-yt-line rounded-xl p-4.5 space-y-4">
                  <span className="text-3xs uppercase tracking-widest font-black text-yt-red flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5" /> Keyword Mapping Checklist
                  </span>
                  <div>
                    <h5 className="text-3xs font-extrabold uppercase text-white">1. Title Length Limit</h5>
                    <p className="text-3xs text-zinc-450 mt-0.5">Keep below 60 characters so Google and YouTube search do not clip with suspension dots (...).</p>
                  </div>
                  <div>
                    <h5 className="text-3xs font-extrabold uppercase text-white">2. Semantic Description Density</h5>
                    <p className="text-3xs text-zinc-450 mt-0.5">Embed target focal tags in the first 2 lines. This forms the search snippet shown inside Google results.</p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-lg border border-yt-line">
                    <span className="text-[10px] font-black text-white uppercase block mb-1">CTR Impact Estimator</span>
                    <p className="text-[10px] text-zinc-450 leading-relaxed">
                      Optimizing contrast thresholds and color-pairing can bump Average Search CTR by <strong className="text-green-400">+18%</strong>, pushing organic discovery up 3.5x on feed cycles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Contrast & Color Psychology */}
          {activeTab === 'psychology' && (
            <div className="space-y-6 animate-fade-in text-zinc-305 text-xs">
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-yt-line pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-normal flex items-center gap-2">
                    <Award className="text-yt-red h-5 w-5" />
                    Thumbnail Color Psychology &amp; Visual Dynamic Range
                  </h3>
                  <p className="text-2xs text-zinc-400 mt-1">Applying scientific color contrast ratios and cognitive visual weight to maximize immediate attention.</p>
                </div>
                <button
                  onClick={() => handleCopyLink('#thumbnail-psychology')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-90 w-full sm:w-auto text-3xs font-bold uppercase tracking-wider text-zinc-400 border border-yt-line hover:text-white transition-colors cursor-pointer"
                >
                  {copiedLink === '#thumbnail-psychology' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink === '#thumbnail-psychology' ? 'Copied Static URL!' : 'Share SEO Section'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#12c2e9]" />
                    Complementary Palette Contrasts
                  </h4>
                  <p className="text-zinc-350 text-2xs leading-relaxed">
                    Most feed cards in standard applications utilize neutral charcoal backgrounds (Dark Mode) or blinding paper whites (Light Mode). Having saturated visual highlights that rely on complementary relationships is vital:
                  </p>
                  <ul className="space-y-2.5 text-2xs">
                    <li className="bg-[#0c0c0c] border border-yt-line p-2.5 rounded-lg">
                      <strong className="text-amber-400 block uppercase text-3xs">Cyan &amp; Golden Orange Highlights</strong>
                      Produces extreme contrast dynamic depth. Yellow glows evoke urgency, while Cyan binds high professional technical authority.
                    </li>
                    <li className="bg-[#0c0c0c] border border-yt-line p-2.5 rounded-lg">
                      <strong className="text-rose-400 block uppercase text-3xs">Lime Green &amp; Violet Purple</strong>
                      Highly eccentric, less crowded inside main YouTube home page rows. Excels for game tutorials, tech reveals, and reviews.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yt-red" />
                    Interactive Depth Composition (Rules of Thumb for Designers)
                  </h4>
                  <div className="p-4 bg-zinc-950 rounded-xl border border-yt-line space-y-3 text-2xs">
                    <div>
                      <span className="font-extrabold uppercase text-white block">A. Face Mapping</span>
                      <p className="text-zinc-400 mt-0.5">
                        Human eyes are neurally pre-programmed to track other eyes. Thumbnails featuring human faces showing dramatic emotions (fear, awe, shock, curiosity) convert up to 45% better than flat graphics alone.
                      </p>
                    </div>
                    <div className="border-t border-yt-line/60 pt-2.5">
                      <span className="font-extrabold uppercase text-white block">B. The Sub-Second Scan Limit</span>
                      <p className="text-zinc-400 mt-0.5">
                        A typical phone reader scans through 5 thumbs per second. If the user cannot grasp the core narrative of your thumbnail card in under 0.2 seconds, they scroll past. Simplify composition down to no more than <strong>3 primary layers</strong> (Subject, Typography, Accent Background).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Features & Technical FAQ */}
          {activeTab === 'features-faq' && (
            <div className="space-y-6 animate-fade-in text-zinc-305 text-xs">
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-yt-line pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-normal flex items-center gap-2">
                    <HelpCircle className="text-yt-red h-5 w-5" />
                    Product Capability Sheet &amp; Technical FAQ
                  </h3>
                  <p className="text-2xs text-zinc-400 mt-1">Exploring offline sandbox integrity, 16:9 auto-converters, and feed card specs.</p>
                </div>
                <button
                  onClick={() => handleCopyLink('#technical-faq')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-90 w-full sm:w-auto text-3xs font-bold uppercase tracking-wider text-zinc-400 border border-yt-line hover:text-white transition-colors cursor-pointer"
                >
                  {copiedLink === '#technical-faq' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink === '#technical-faq' ? 'Copied Static URL!' : 'Share SEO Section'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-4 bg-zinc-900 border border-yt-line rounded-xl space-y-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  <h4 className="font-black text-white uppercase tracking-wider text-xs">Zero Server Sandboxing</h4>
                  <p className="text-2xs text-zinc-400 leading-normal">
                    We never upload your files to external databases. All image rendering, canvas padding, and pixel contrast calculations happen inside your local browser memory space. Your concepts are completely secure from corporate espionage.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 border border-yt-line rounded-xl space-y-2">
                  <Sliders className="h-6 w-6 text-yt-red" />
                  <h4 className="font-black text-white uppercase tracking-wider text-xs">16:9 Smart Padders</h4>
                  <p className="text-2xs text-zinc-400 leading-normal">
                    If your image ratio deviates from 16:9, standard systems distort or stretch the graphic. Our in-browser converter adds elegant blurred fillers, pitch-black containers, or precise center crops so no branding is clipped.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 border border-yt-line rounded-xl space-y-2">
                  <Sliders className="h-6 w-6 text-blue-400" />
                  <h4 className="font-black text-white uppercase tracking-wider text-xs">Responsive Feed Mockups</h4>
                  <p className="text-2xs text-zinc-400 leading-normal">
                    Instantly test looks inside dynamic layouts: standard high-density YouTube desktop grids, vertical mobile feed streams, playlist sequences, side recommendations, and dark vs. light template views.
                  </p>
                </div>
              </div>

              <div className="border-t border-yt-line pt-6">
                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">Frequently Asked Technical Questions</h4>
                <div className="space-y-4 text-2xs leading-relaxed text-zinc-350">
                  <div className="p-4 bg-[#0a0a0a] rounded-lg border border-yt-line">
                    <p className="font-extrabold text-white uppercase">Q: Why does YouTube restrict maximum thumbnail file payloads to 2 Megabytes?</p>
                    <p className="text-zinc-400 mt-1">
                      YouTube indexes billions of thumbnails daily for search feed cards. To keep page-loads at under 300ms, their asset caches automatically reject file uploads above 2,000,000 bytes. Our tool analyzes size, and when you export process-optimized files, it automatically compacts files to fit parameters.
                    </p>
                  </div>

                  <div className="p-4 bg-[#0a0a0a] rounded-lg border border-yt-line">
                    <p className="font-extrabold text-white uppercase">Q: What aspect ratio is recommended for standard desktop and smart TV feed cards?</p>
                    <p className="text-zinc-400 mt-1">
                      YouTube feeds globally rely on standard horizontal proportions of exactly <strong className="text-white">16:9</strong>. If you upload vertical cell shots (9:16) or standard square frames (1:1), YouTube will force gray containers in the margins which reduces visual impact by 40% in dense listings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
