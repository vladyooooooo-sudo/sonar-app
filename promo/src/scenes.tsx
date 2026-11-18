import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { Backdrop, C, FONT_BODY, FONT_DISPLAY, GemText, SonarMark, gemGradient } from "./brand";

export type Lang = "it" | "en";
export type LangProps = { lang?: Lang };

const TEXT = {
  it: {
    hook: ["La maggior parte", "dei principianti", "perde soldi."],
    what: "E se potessi",
    train: "allenarti prima?",
    tagline: "Mercati veri. Soldi finti.",
    gift: "REGALO DI BENVENUTO",
    trial: "+ 5 giorni gratis",
    cta: "Scarica SONAR",
    legal: "Simulazione educativa con valuta virtuale. Non è un consiglio di investimento.",
    sep: ".",
  },
  en: {
    hook: ["Most beginners", "lose money", "trading."],
    what: "What if you could",
    train: "practice first?",
    tagline: "Real markets. Fake money.",
    gift: "WELCOME GIFT",
    trial: "+ 5 days free",
    cta: "Get SONAR",
    legal: "Educational simulation with virtual currency. Not investment advice.",
    sep: ",",
  },
};

const pop = (frame: number, fps: number, delay = 0, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 140 } });

// ---------- Scene 1: hook ----------
export const HookScene: React.FC<LangProps> = ({ lang = "it" }) => {
  const tx = TEXT[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = tx.hook;
  const second = interpolate(f, [48, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#05070F", justifyContent: "center", padding: "0 90px" }}>
      <div style={{ opacity: 1 - second, transform: `translateY(${-second * 60}px)` }}>
        {lines.map((l, i) => {
          const p = pop(f, fps, i * 7);
          return (
            <div
              key={l}
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 104,
                lineHeight: 1.08,
                letterSpacing: -3,
                color: i === 2 ? "#FF5C7A" : C.white,
                opacity: p,
                transform: `translateY(${(1 - p) * 50}px)`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          opacity: second,
          transform: `scale(${0.9 + second * 0.1})`,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 112, lineHeight: 1.05, letterSpacing: -3, color: C.white }}>
          {tx.what}
        </div>
        <GemText size={112} style={{ letterSpacing: -3, lineHeight: 1.1, display: "block" }}>
          {tx.train}
        </GemText>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: logo reveal ----------
export const LogoScene: React.FC<LangProps> = ({ lang = "it" }) => {
  const tx = TEXT[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, fps, 0, 9);
  const letters = "SONAR".split("");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[0, 18, 36].map((d) => {
          const t = ((f - d + 60) % 60) / 60;
          return (
            <div
              key={d}
              style={{
                position: "absolute",
                width: 420,
                height: 420,
                borderRadius: 210,
                border: `3px solid ${C.ice}`,
                opacity: (1 - t) * 0.6 * s,
                transform: `scale(${0.8 + t * 1.1})`,
              }}
            />
          );
        })}
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, filter: `drop-shadow(0 0 60px ${C.ice})` }}>
          <SonarMark size={420} spin={f * 1.5} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 70 }}>
        {letters.map((l, i) => {
          const p = pop(f, fps, 10 + i * 4);
          return (
            <GemText key={i} size={170} style={{ opacity: p, transform: `translateY(${(1 - p) * 60}px)`, display: "inline-block" }}>
              {l}
            </GemText>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 52,
          color: C.dim,
          marginTop: 30,
          opacity: interpolate(f, [34, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {tx.tagline}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scenes 3-5: feature with phone ----------
export type FeatureProps = {
  kicker: string;
  title: string;
  highlight: string;
  shot: string;
  chip: string;
  chipColor?: string;
};

export const FeatureScene: React.FC<FeatureProps> = ({ kicker, title, highlight, shot, chip, chipColor = C.up }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tIn = pop(f, fps, 0, 14);
  const phone = pop(f, fps, 6, 13);
  const chipP = pop(f, fps, 26, 8);
  const float = Math.sin(f / 18) * 10;
  const W = 640;
  const H = Math.round((W * 1688) / 780);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", top: 150, left: 90, right: 90, opacity: tIn, transform: `translateY(${(1 - tIn) * 40}px)` }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: C.ice }}>{kicker}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 92, lineHeight: 1.05, letterSpacing: -2.5, color: C.white, marginTop: 14 }}>
          {title}
        </div>
        <GemText size={92} style={{ letterSpacing: -2.5, lineHeight: 1.1, display: "block" }}>
          {highlight}
        </GemText>
      </div>
      <div
        style={{
          position: "absolute",
          left: (1080 - W) / 2,
          top: 640 + (1 - phone) * 900 + float,
          width: W,
          height: H,
          borderRadius: 86,
          padding: 16,
          background: "linear-gradient(145deg, #2A3770, #0A0F2A)",
          boxShadow: `0 60px 140px rgba(0,0,0,0.55), 0 0 0 3px rgba(159,212,255,0.45), 0 0 120px rgba(159,212,255,0.25)`,
          transform: `rotate(${(1 - phone) * 8 - 2}deg)`,
        }}
      >
        <Img src={staticFile(shot)} style={{ width: "100%", height: "100%", borderRadius: 72, objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 860 + float * 1.6,
          padding: "22px 34px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 46,
          color: chipColor,
          transform: `scale(${chipP}) rotate(${(1 - chipP) * 20 + 4}deg)`,
        }}
      >
        {chip}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 6: offer + CTA ----------
export const OfferScene: React.FC<LangProps> = ({ lang = "it" }) => {
  const tx = TEXT[lang];
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = pop(f, fps, 0, 10);
  const b = pop(f, fps, 12, 12);
  const c = pop(f, fps, 24, 9);
  const pulse = 1 + Math.sin(f / 6) * 0.03 * c;
  const count = Math.round(interpolate(f, [0, 30], [0, 1000], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Backdrop />
      <div style={{ marginTop: 300, transform: `scale(${a})` }}>
        <SonarMark size={220} spin={f * 2} />
      </div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, letterSpacing: 6, color: C.dim, marginTop: 70, opacity: a }}>
        {tx.gift}
      </div>
      <GemText size={210} style={{ letterSpacing: -6, marginTop: 10, transform: `scale(${a})`, display: "block" }}>
        {count >= 1000 ? `${Math.floor(count / 1000)}${tx.sep}${String(count % 1000).padStart(3, "0")}` : count}
      </GemText>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 64, color: C.white, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
        SONAR COIN
      </div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 48, color: C.dim, marginTop: 18, opacity: b }}>
        {tx.trial}
      </div>
      <div
        style={{
          marginTop: 110,
          padding: "40px 90px",
          borderRadius: 999,
          backgroundImage: gemGradient,
          boxShadow: "0 30px 90px rgba(159,212,255,0.5)",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 62,
          color: C.ink,
          transform: `scale(${c * pulse})`,
        }}
      >
        {tx.cta}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 90,
          right: 90,
          textAlign: "center",
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 30,
          lineHeight: 1.35,
          color: "rgba(220,232,255,0.55)",
        }}
      >
        {tx.legal}
      </div>
    </AbsoluteFill>
  );
};
