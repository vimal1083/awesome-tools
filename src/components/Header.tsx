import { Youtube, Shield, FileImage, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-yt-black border-b border-yt-line py-10 md:py-12 text-white">
      {/* Precision accent overlays */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />
      <div className="absolute left-0 bottom-0 -ml-16 -mb-16 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-11 items-center justify-center rounded-lg bg-yt-red shadow-lg shadow-red-900/10">
              <Youtube className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <span className="font-sans text-lg font-extrabold tracking-tight text-white uppercase">ThumbVisual</span>
              <span className="ml-2 rounded bg-yt-red/10 px-1.5 py-0.5 text-3xs font-mono font-bold tracking-widest text-yt-red uppercase">
                Pro
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="hidden sm:flex items-center gap-1.5 bg-zinc-900/60 border border-yt-line px-3 py-1 rounded-full">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              100% Secure Client-Side Sandbox
            </span>
          </div>
        </div>

        <div className="mt-8 text-center md:mt-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-yt-line px-3 py-1 text-2xs font-bold text-yt-red tracking-wide">
            <Sparkles className="h-3 w-3 text-yt-red" />
            <span>SEO Optimized &amp; Pixel-Perfect Instant Feeds</span>
          </div>
          
          <h1 className="mt-3 font-sans text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl uppercase">
            Unlimited <span className="text-yt-red">YouTube Thumbnail</span> Preview
          </h1>
          
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-zinc-400">
            Render your custom artwork layouts instantly across high fidelity dark and light feeds, searchable lists, active queues, and playlist panels. No caps.
          </p>

          {/* Core Feature Badges under the High Density design guidelines */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 rounded-xl border border-yt-line bg-[#161616]/40 p-4 text-left transition-all hover:bg-[#161616]/60">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-yt-red">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <dt className="text-xs font-bold text-white uppercase tracking-wider">Free &amp; Unlimited Previews</dt>
                <dd className="mt-0.5 text-3xs text-zinc-400 leading-normal">
                  Generate unlimited thumbnail feeds instantly. Fully optimized, active, and free to use forever.
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-yt-line bg-[#161616]/40 p-4 text-left transition-all hover:bg-[#161616]/60">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FileImage className="h-4.5 w-4.5" />
              </div>
              <div>
                <dt className="text-xs font-bold text-white uppercase tracking-wider">Up to 100MB Raw Sizes</dt>
                <dd className="mt-0.5 text-3xs text-zinc-400 leading-normal">
                  Upload absolute RAW high-fidelity images up to 100MB directly. No server limits or compression loss.
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-yt-line bg-[#161616]/40 p-4 text-left transition-all hover:bg-[#161616]/60">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <dt className="text-xs font-bold text-white uppercase tracking-wider">Completed Client-Side</dt>
                <dd className="mt-0.5 text-3xs text-zinc-400 leading-normal">
                  No images ever touch external clouds. Processed fully in-browser with complete memory privacy.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

