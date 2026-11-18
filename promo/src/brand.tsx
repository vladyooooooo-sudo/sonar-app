import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";

export const FONT_DISPLAY = "SoraX";
export const FONT_BODY = "ManropeX";

loadFont({ family: FONT_DISPLAY, url: staticFile("fonts/Sora_800ExtraBold.ttf"), weight: "800" });
loadFont({ family: FONT_DISPLAY, url: staticFile("fonts/Sora_700Bold.ttf"), weight: "700" });
loadFont({ family: FONT_BODY, url: staticFile("fonts/Manrope_600SemiBold.ttf"), weight: "600" });
loadFont({ family: FONT_BODY, url: staticFile("fonts/Manrope_700Bold.ttf"), weight: "700" });

export const C = {
  ink: "#0B1230",
  ink2: "#17235A",
  ink3: "#1F2F78",
  white: "#FFFFFF",
  dim: "rgba(220, 232, 255, 0.7)",
  gem: ["#FFFFFF", "#CFEAFF", "#9FD4FF", "#D7CCFF", "#FFFFFF"],
  ice: "#9FD4FF",
  violet: "#B6A6FF",
  up: "#12B886",
};

export const gemGradient = `linear-gradient(120deg, ${C.gem.join(", ")})`;

/** Deep navy backdrop with drifting glow orbs and fine sparkles. */
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 40) * 40;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.ink} 0%, ${C.ink2} 55%, ${C.ink3} 100%)` }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: 550,
          top: -380 + drift,
          right: -420,
          background: "radial-gradient(circle, rgba(159,212,255,0.35), rgba(159,212,255,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: 500,
          bottom: -360 - drift,
          left: -420,
          background: "radial-gradient(circle, rgba(182,166,255,0.28), rgba(182,166,255,0) 65%)",
        }}
      />
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 397) % 1080;
        const y = ((i * 733 + f * (1 + (i % 3))) % 2100) - 90;
        const o = interpolate(Math.sin(f / 12 + i), [-1, 1], [0.1, 0.7]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 1920 - y,
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              borderRadius: 6,
              background: C.gem[1 + (i % 3)],
              opacity: o,
              boxShadow: `0 0 12px ${C.ice}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** SONAR mark: cut diamond inside a sonar ring. */
export const SonarMark: React.FC<{ size: number; spin?: number }> = ({ size, spin = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        {C.gem.map((c, i) => (
          <stop key={i} offset={i / (C.gem.length - 1)} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    <g transform={`rotate(${spin} 50 50)`}>
      <circle cx="50" cy="50" r="46" stroke="url(#g)" strokeWidth="2.5" fill="none" />
      <path d="M72 14 A44 44 0 0 1 90 34" stroke="url(#g)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M24 88 A44 44 0 0 1 10 70" stroke="url(#g)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </g>
    <path d="M22 40 L37 23 L63 23 L78 40 L50 80 Z" fill="url(#g)" />
    <path
      d="M22 40 L78 40 M37 23 L43 40 L50 23 L57 40 L63 23 M43 40 L50 80 L57 40"
      stroke="rgba(11,18,48,0.35)"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M30 33 L37 25" stroke="rgba(255,255,255,0.95)" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const GemText: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({
  children,
  size,
  style,
}) => (
  <span
    style={{
      fontFamily: FONT_DISPLAY,
      fontWeight: 800,
      fontSize: size,
      backgroundImage: gemGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);
