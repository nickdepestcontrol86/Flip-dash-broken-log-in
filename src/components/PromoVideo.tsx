import { Player } from "@remotion/player";
import { SafetySpecsPromo } from "../videos/safety-specs-promo";

export function PromoVideo() {
  return (
    <section className="w-full py-16 px-4 md:px-6 bg-[#080d18]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3dd45c] mb-3 block">New Feature</span>
          <h2 className="text-3xl font-black text-white mb-2">Safety & Specs — Powered by NHTSA</h2>
          <p className="text-gray-400">Real-time recall data, crash test ratings, and full VIN decoding on every vehicle</p>
        </div>
        <div className="w-full aspect-video min-h-[420px] rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl">
          <Player
            component={SafetySpecsPromo}
            durationInFrames={450}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: "100%", height: "100%" }}
            autoPlay
            loop
            controls
          />
        </div>
      </div>
    </section>
  );
}
