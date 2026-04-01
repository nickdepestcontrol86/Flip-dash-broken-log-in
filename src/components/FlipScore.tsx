import { useState, useEffect } from "react";

interface FlipScoreProps {
  score?: number;
  profit?: number;
  risk?: string;
  speed?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function FlipScore({
  score = 8.6,
  profit = 3200,
  risk = "Low",
  speed = "Fast",
  size = "lg",
  animated = true,
}: FlipScoreProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [visible, setVisible] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, [animated]);

  useEffect(() => {
    if (!animated || !visible) return;
    let current = 0;
    const step = score / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current * 10) / 10);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [score, animated, visible]);

  const getScoreColor = (s: number) => {
    if (s >= 8) return { ring: "#3dd45c", bg: "rgba(61,212,92,0.12)", text: "text-[#3dd45c]" };
    if (s >= 6) return { ring: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "text-amber-400" };
    return { ring: "#ef4444", bg: "rgba(239,68,68,0.12)", text: "text-red-400" };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const progress = (displayScore / 10) * circumference;
  const dashOffset = circumference - progress;

  const dims = size === "lg" ? "w-40 h-40" : size === "md" ? "w-28 h-28" : "w-20 h-20";
  const scoreSize = size === "lg" ? "text-5xl" : size === "md" ? "text-3xl" : "text-xl";
  const labelSize = size === "lg" ? "text-xs" : "text-[10px]";

  const getRiskColor = (r: string) => {
    if (r === "Low") return "text-[#3dd45c]";
    if (r === "Medium") return "text-amber-400";
    return "text-red-400";
  };

  const getSpeedColor = (s: string) => {
    if (s === "Fast") return "text-[#00c9a7]";
    if (s === "Medium") return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className={`flex flex-col items-center gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Score Ring */}
      <div className={`relative ${dims}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 8px ${colors.ring}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${scoreSize} font-extrabold ${colors.text} tabular-nums`}>
            {displayScore.toFixed(1)}
          </span>
          <span className={`${labelSize} text-gray-400 font-medium uppercase tracking-widest mt-0.5`}>Flip Score</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Profit</p>
          <p className="text-sm font-bold text-[#3dd45c]">${profit.toLocaleString()}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Risk</p>
          <p className={`text-sm font-bold ${getRiskColor(risk)}`}>{risk}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Speed</p>
          <p className={`text-sm font-bold ${getSpeedColor(speed)}`}>{speed}</p>
        </div>
      </div>
    </div>
  );
}

export function FlipScoreInline({ score = 8.6 }: { score?: number }) {
  const color = score >= 8 ? "text-[#3dd45c]" : score >= 6 ? "text-amber-400" : "text-red-400";
  const bg = score >= 8 ? "bg-[#3dd45c]/10" : score >= 6 ? "bg-amber-400/10" : "bg-red-400/10";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg}`}>
      <span className={`text-sm font-bold ${color} tabular-nums`}>{score.toFixed(1)}</span>
      <span className="text-[10px] text-gray-400 font-medium">/ 10</span>
    </span>
  );
}
