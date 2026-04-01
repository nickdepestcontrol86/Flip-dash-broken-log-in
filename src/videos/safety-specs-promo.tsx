import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from 'remotion';

const GREEN = '#3dd45c';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const BG = '#080d18';
const CARD = '#0f1829';

function AnimatedStar({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20, 300, 450], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: GREEN, opacity, boxShadow: `0 0 ${size * 3}px ${GREEN}` }} />;
}

function FloatingCard({ delay, x, y, title, value, color, icon }: { delay: number; x: number; y: number; title: string; value: string; color: string; icon: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ fps, frame: frame - delay, config: { damping: 180, stiffness: 80 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  return (
    <div style={{ position: 'absolute', left: x, top: y + translateY, opacity, background: CARD, border: `1px solid ${color}40`, borderRadius: 16, padding: '20px 28px', minWidth: 220 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: 'system-ui' }}>{value}</div>
    </div>
  );
}

function PulseRing({ x, y, delay }: { x: number; y: number; delay: number }) {
  const frame = useCurrentFrame();
  const t = (frame - delay) % 60;
  const scale = interpolate(t, [0, 60], [0.5, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(t, [0, 30, 60], [0.8, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame < delay) return null;
  return <div style={{ position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: '50%', border: `2px solid ${GREEN}`, transform: `scale(${scale})`, opacity }} />;
}

function StarRatingRow({ stars, label, delay }: { stars: number; label: string; delay: number }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const visibleStars = Math.floor(progress * stars);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 200, fontSize: 13, color: '#9ca3af' }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ fontSize: 22, color: i <= visibleStars ? '#fbbf24' : '#374151' }}>★</div>
        ))}
      </div>
    </div>
  );
}

export function SafetySpecsPromo() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene transitions
  const scene1 = frame < 120;
  const scene2 = frame >= 100 && frame < 240;
  const scene3 = frame >= 220 && frame < 360;
  const scene4 = frame >= 340;

  // Global fade in
  const globalOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Scene crossfades
  const s1opacity = interpolate(frame, [0, 10, 100, 120], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s2opacity = interpolate(frame, [100, 120, 220, 240], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s3opacity = interpolate(frame, [220, 240, 340, 360], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s4opacity = interpolate(frame, [340, 360, 430, 450], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Particle field
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 137.5) % width,
    y: (i * 97.3) % height,
    size: 2 + (i % 4),
    delay: i * 15,
  }));

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      {/* Particle field */}
      {particles.map((p, i) => <AnimatedStar key={i} x={p.x} y={p.y} size={p.size} delay={p.delay} />)}

      {/* Gradient overlay */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${GREEN}08 0%, transparent 70%)` }} />

      {/* ── SCENE 1: Hero intro ── */}
      <AbsoluteFill style={{ opacity: s1opacity }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{
            fontSize: 18, color: GREEN, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 24,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          }}>FlipDash Presents</div>
          <div style={{
            fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 16,
            opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(frame, [20, 50], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`
          }}>Safety &</div>
          <div style={{
            fontSize: 96, fontWeight: 900, lineHeight: 1, marginBottom: 32,
            background: `linear-gradient(135deg, ${GREEN}, #00c9a7)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(frame, [30, 60], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`
          }}>Specs</div>
          <div style={{
            fontSize: 22, color: '#6b7280', letterSpacing: 1,
            opacity: interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          }}>Real-time vehicle intelligence powered by NHTSA</div>
        </div>
        {/* Shield icon */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -50%) scale(${interpolate(frame, [0, 30], [3, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
          fontSize: 200, opacity: interpolate(frame, [0, 20, 80, 100], [0, 0.08, 0.08, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        }}>🛡️</div>
        <PulseRing x={width / 2} y={height / 2} delay={40} />
        <PulseRing x={width / 2} y={height / 2} delay={80} />
      </AbsoluteFill>

      {/* ── SCENE 2: NHTSA Crash Ratings ── */}
      <AbsoluteFill style={{ opacity: s2opacity }}>
        <div style={{ position: 'absolute', top: 80, left: 120 }}>
          <div style={{ fontSize: 14, color: GREEN, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12,
            opacity: interpolate(frame - 100, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>NHTSA Crash Test Ratings</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', marginBottom: 8,
            opacity: interpolate(frame - 100, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `translateX(${interpolate(frame - 100, [10, 35], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>Live Safety</div>
          <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 40,
            background: `linear-gradient(135deg, ${GREEN}, #00c9a7)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: interpolate(frame - 100, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `translateX(${interpolate(frame - 100, [20, 45], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>Intelligence</div>
          <div style={{ opacity: interpolate(frame - 100, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <StarRatingRow stars={5} label="Overall Safety" delay={140} />
            <StarRatingRow stars={4} label="Front Crash" delay={155} />
            <StarRatingRow stars={5} label="Side Crash" delay={170} />
            <StarRatingRow stars={4} label="Rollover" delay={185} />
          </div>
        </div>
        <FloatingCard delay={120} x={width - 420} y={120} title="Safety Score" value="5/5 ★" color={GREEN} icon="💥" />
        <FloatingCard delay={140} x={width - 420} y={300} title="ESC" value="Standard" color="#3b82f6" icon="🛡️" />
        <FloatingCard delay={160} x={width - 420} y={480} title="FCW" value="Optional" color={AMBER} icon="⚡" />
      </AbsoluteFill>

      {/* ── SCENE 3: Recalls & Complaints ── */}
      <AbsoluteFill style={{ opacity: s3opacity }}>
        <div style={{ position: 'absolute', top: 80, left: 120 }}>
          <div style={{ fontSize: 14, color: AMBER, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12,
            opacity: interpolate(frame - 220, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Recall & Complaint Tracking</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', marginBottom: 8,
            opacity: interpolate(frame - 220, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Know Before</div>
          <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 40,
            background: `linear-gradient(135deg, ${AMBER}, ${RED})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: interpolate(frame - 220, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>You Buy</div>
        </div>
        <FloatingCard delay={230} x={120} y={340} title="Open Recalls" value="0 Found" color={GREEN} icon="⚠️" />
        <FloatingCard delay={250} x={400} y={340} title="Complaints" value="12 Total" color={AMBER} icon="📋" />
        <FloatingCard delay={270} x={680} y={340} title="Crash Reports" value="0 Crashes" color={GREEN} icon="🚗" />
        <FloatingCard delay={290} x={960} y={340} title="Injuries" value="0 Reported" color={GREEN} icon="🚑" />
        {/* Lookup buttons row */}
        <div style={{ position: 'absolute', bottom: 120, left: 120, display: 'flex', gap: 16,
          opacity: interpolate(frame - 220, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          {['CARFAX', 'NICB Theft', 'Copart Auction', 'IAAI History'].map((label, i) => (
            <div key={label} style={{ padding: '10px 20px', background: `${GREEN}15`, border: `1px solid ${GREEN}40`, borderRadius: 8, fontSize: 13, color: GREEN, fontWeight: 600 }}>{label}</div>
          ))}
        </div>
      </AbsoluteFill>

      {/* ── SCENE 4: VIN Decoder & CTA ── */}
      <AbsoluteFill style={{ opacity: s4opacity }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%' }}>
          <div style={{ fontSize: 14, color: GREEN, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20,
            opacity: interpolate(frame - 340, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>VIN Decoder + Full Specs</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', marginBottom: 16,
            opacity: interpolate(frame - 340, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Every Detail.</div>
          <div style={{ fontSize: 72, fontWeight: 900, marginBottom: 40,
            background: `linear-gradient(135deg, ${GREEN}, #00c9a7)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: interpolate(frame - 340, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Every Vehicle.</div>
          {/* VIN display */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 40,
            opacity: interpolate(frame - 340, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            {'1HGBH41JXMN109186'.split('').map((c, i) => {
              const colors = ['#3b82f6','#3b82f6','#3b82f6','#a855f7','#a855f7','#a855f7','#a855f7','#a855f7','#a855f7','#fbbf24','#10b981','#f97316','#6b7280','#6b7280','#6b7280','#6b7280','#6b7280'];
              return <div key={i} style={{ width: 48, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${colors[i]}20`, border: `1px solid ${colors[i]}40`, borderRadius: 8, fontSize: 18, fontWeight: 700, color: colors[i], fontFamily: 'monospace' }}>{c}</div>;
            })}
          </div>
          <div style={{ fontSize: 22, color: '#6b7280',
            opacity: interpolate(frame - 340, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>Available now in every vehicle dashboard</div>
        </div>
      </AbsoluteFill>

      {/* Bottom brand bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${GREEN}, #00c9a7, transparent)`,
        opacity: globalOpacity
      }} />
    </AbsoluteFill>
  );
}

import { Composition } from 'remotion';
export function RemotionRoot() {
  return <Composition id="SafetySpecsPromo" component={SafetySpecsPromo} durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{}} />;
}