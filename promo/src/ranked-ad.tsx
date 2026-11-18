import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

import { Backdrop, C, FONT_BODY, FONT_DISPLAY, GemText, SonarMark, gemGradient } from "./brand";

// ---------- data (mirrors src/data/ranks.ts in the app) ----------
type Tier = { id: string; name: string; title: string; min: number; colors: [string, string, string]; glow: string };
const TIERS: Tier[] = [
  { id: "bronzo", name: "Bronzo", title: "Investitore dilettante", min: 1000, colors: ["#F3C09A", "#B8733F", "#6E3B17"], glow: "rgba(205,127,50,0.55)" },
  { id: "argento", name: "Argento", title: "Investitore medio-basso", min: 1100, colors: ["#FFFFFF", "#C3CBD9", "#7D8799"], glow: "rgba(200,210,230,0.6)" },
  { id: "oro", name: "Oro", title: "Investitore medio", min: 1250, colors: ["#FFF3C4", "#F2C14E", "#A8740F"], glow: "rgba(242,193,78,0.6)" },
  { id: "platino", name: "Platino", title: "Investitore esperto", min: 1450, colors: ["#E9FFFB", "#7FE3D3", "#22897D"], glow: "rgba(127,227,211,0.6)" },
  { id: "diamante", name: "Diamante", title: "Investitore avanzato", min: 1700, colors: ["#FFFFFF", "#9FD4FF", "#7A6CFF"], glow: "rgba(159,212,255,0.7)" },
  { id: "leggenda", name: "Leggenda", title: "Maestro dei mercati", min: 2000, colors: ["#FFE6F6", "#FF6FB5", "#7A1FD1"], glow: "rgba(255,111,181,0.65)" },
];

export type Lang = "it" | "en";
type P = { lang?: Lang };

const EN_TIERS: Record<string, [string, string]> = {
  bronzo: ["Bronze", "Rookie investor"],
  argento: ["Silver", "Novice investor"],
  oro: ["Gold", "Intermediate investor"],
  platino: ["Platinum", "Expert investor"],
  diamante: ["Diamond", "Advanced investor"],
  leggenda: ["Legend", "Market master"],
};
const tName = (t: Tier, lang: Lang) => (lang === "en" ? EN_TIERS[t.id][0] : t.name);
const tTitle = (t: Tier, lang: Lang) => (lang === "en" ? EN_TIERS[t.id][1] : t.title);

const TX = {
  it: {
    hook: ["Quanto", "sei", "bravo", "davvero", "a investire?"],
    promoted: "PROMOSSO",
    how: "COME FUNZIONA",
    start1: "Tutti partono",
    start2: "da Bronzo.",
    points: [
      { k: "01", t: "Investi con prezzi reali", s: "e SONAR COIN finti" },
      { k: "02", t: "Ogni operazione chiusa", s: "muove il tuo SR" },
      { k: "03", t: "Conta la percentuale,", s: "non quanti soldi hai" },
    ],
    ch1: "Sfida",
    ch2: "i tuoi amici.",
    you: "Tu",
    find1: "Scopri",
    find2: "il tuo grado.",
    cta: "Scarica SONAR",
    legal: "Grado calcolato su operazioni simulate con valuta virtuale. Non garantisce risultati con denaro reale.",
  },
  en: {
    hook: ["How", "good", "are", "you", "really", "at investing?"],
    promoted: "PROMOTED",
    how: "HOW IT WORKS",
    start1: "Everyone starts",
    start2: "at Bronze.",
    points: [
      { k: "01", t: "Invest with real prices", s: "and fake SONAR COIN" },
      { k: "02", t: "Every closed trade", s: "moves your SR" },
      { k: "03", t: "Percent return counts,", s: "not how much you hold" },
    ],
    ch1: "Challenge",
    ch2: "your friends.",
    you: "You",
    find1: "Discover",
    find2: "your rank.",
    cta: "Get SONAR",
    legal: "Rank based on simulated trades with virtual currency. It does not guarantee real-money results.",
  },
};

const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

export const Badge: React.FC<{ tier: Tier; size: number }> = ({ tier, size }) => {
  const [a, b, c] = tier.colors;
  const level = TIERS.indexOf(tier);
  const id = `b-${tier.id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {level >= 3 && (
        <>
          <path d="M28 46 C10 44 4 30 6 20 C14 30 22 32 30 32 Z" fill={`url(#${id}m)`} />
          <path d="M92 46 C110 44 116 30 114 20 C106 30 98 32 90 32 Z" fill={`url(#${id}m)`} />
        </>
      )}
      {level >= 5 && <path d="M42 18 L48 6 L54 14 L60 2 L66 14 L72 6 L78 18 Z" fill={`url(#${id}m)`} />}
      <path d="M60 14 L96 26 L96 60 C96 84 80 102 60 112 C40 102 24 84 24 60 L24 26 Z" fill={`url(#${id}m)`} />
      <path d="M60 22 L88 32 L88 60 C88 80 76 94 60 103 C44 94 32 80 32 60 L32 32 Z" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
      {level >= 1 && <circle cx="60" cy="62" r={26 + level} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />}
      <polygon points="44,56 52,46 68,46 76,56 60,80" fill={`url(#${id}g)`} />
      <path d="M44 56 L76 56 M52 46 L56 56 L60 46 L64 56 L68 46 M56 56 L60 80 L64 56" stroke={c} strokeWidth={1} fill="none" opacity={0.7} />
      <path d="M34 30 L58 22" stroke="rgba(255,255,255,0.7)" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};

const Dark: React.FC<{ children: React.ReactNode; tint?: string }> = ({ children, tint = "rgba(122,108,255,0.25)" }) => (
  <AbsoluteFill style={{ background: "#04050D" }}>
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${tint}, rgba(0,0,0,0) 60%)` }} />
    {children}
  </AbsoluteFill>
);

// ---------- 1. Hook ----------
const HookScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = TX[lang].hook;
  const flash = interpolate(f, [58, 62, 70], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Dark>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 30 }}>
          {words.map((w, i) => {
            const p = spring({ frame: f - i * 6, fps, config: { damping: 11 } });
            const last = i >= words.length - 2;
            return (
              <span
                key={w + i}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 132,
                  lineHeight: 1.05,
                  letterSpacing: -4,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 70}px) scale(${0.8 + p * 0.2})`,
                  display: "inline-block",
                  ...(last
                    ? { backgroundImage: gemGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                    : { color: C.white }),
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </Dark>
  );
};

// ---------- 2. Climb through the tiers ----------
const CLIMB = 150;
const ClimbScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const per = CLIMB / TIERS.length;
  const idx = Math.min(TIERS.length - 1, Math.floor(f / per));
  const local = (f - idx * per) / per;
  const tier = TIERS[idx];
  const sr = Math.round(interpolate(f, [0, CLIMB - 10], [1000, 2040], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }));
  const pop = spring({ frame: f - idx * per, fps: 30, config: { damping: 9, stiffness: 180 } });
  return (
    <Dark tint={tier.glow}>
      {/* ladder on the left */}
      <div style={{ position: "absolute", left: 70, top: 420, display: "flex", flexDirection: "column-reverse", gap: 34 }}>
        {TIERS.map((t, i) => (
          <div key={t.id} style={{ opacity: i <= idx ? 1 : 0.22, transform: `scale(${i === idx ? 1.15 : 0.9})`, transition: "none" }}>
            <Badge tier={t} size={130} />
          </div>
        ))}
      </div>
      {/* progress rail */}
      <div style={{ position: "absolute", left: 40, top: 430, width: 8, height: 1160, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: 8,
            borderRadius: 4,
            height: `${interpolate(f, [0, CLIMB - 10], [6, 100], { extrapolateRight: "clamp" })}%`,
            background: `linear-gradient(0deg, ${TIERS[0].colors[1]}, ${tier.colors[1]})`,
            boxShadow: `0 0 30px ${tier.glow}`,
          }}
        />
      </div>
      {/* big current badge */}
      <div style={{ position: "absolute", right: 40, top: 520, width: 620, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ filter: `drop-shadow(0 0 70px ${tier.glow})`, transform: `scale(${0.6 + pop * 0.4}) rotate(${(1 - pop) * -14}deg)` }}>
          <Badge tier={tier} size={460} />
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 104, color: "#fff", letterSpacing: -2, marginTop: 10, opacity: Math.min(1, local * 4) }}>
          {tName(tier, lang)}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, color: tier.colors[0], opacity: Math.min(1, local * 4) }}>{tTitle(tier, lang)}</div>
      </div>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: "rgba(220,232,255,0.6)" }}>SONAR RATING</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 150, color: "#fff", letterSpacing: -4, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
          {sr}
        </div>
      </div>
    </Dark>
  );
};

// ---------- 3. Promotion burst ----------
const PromoScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tier = TIERS[4];
  const p = spring({ frame: f - 4, fps, config: { damping: 7, stiffness: 160 } });
  const flash = interpolate(f, [0, 3, 14], [1, 0.9, 0], { extrapolateRight: "clamp" });
  return (
    <Dark tint={tier.glow}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 540,
            top: 860,
            width: 8,
            height: 900,
            marginLeft: -4,
            transformOrigin: "50% 0%",
            transform: `rotate(${i * 22.5 + f * 0.6}deg)`,
            background: `linear-gradient(180deg, ${tier.colors[1]}55, transparent 70%)`,
            opacity: ease(f, 2, 20) * 0.7,
          }}
        />
      ))}
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2 + i;
        const d = ease(f, 2, 40) * (300 + (i % 5) * 90);
        return (
          <div
            key={`s${i}`}
            style={{
              position: "absolute",
              left: 540 + Math.cos(a) * d,
              top: 860 + Math.sin(a) * d,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: tier.colors[i % 3],
              opacity: 1 - ease(f, 20, 60),
              boxShadow: `0 0 20px ${tier.colors[1]}`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 52, letterSpacing: 14, color: tier.colors[1], opacity: ease(f, 6, 16) }}>{TX[lang].promoted}</div>
        <div style={{ marginTop: 40, transform: `scale(${p})`, filter: `drop-shadow(0 0 90px ${tier.glow})` }}>
          <Badge tier={tier} size={560} />
        </div>
        <GemText size={150} style={{ letterSpacing: -4, marginTop: 30, opacity: ease(f, 10, 22), display: "block" }}>
          {tName(tier, lang).toUpperCase()}
        </GemText>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 48, color: "rgba(220,232,255,0.8)", opacity: ease(f, 16, 28) }}>{tTitle(tier, lang)}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </Dark>
  );
};

// ---------- 4. How it works ----------
const HowScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phone = spring({ frame: f, fps, config: { damping: 14 } });
  const points = TX[lang].points;
  const W = 470;
  const H = Math.round((W * 1688) / 780);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", top: 150, left: 80, right: 80 }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: C.ice, opacity: ease(f, 0, 10) }}>{TX[lang].how}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 96, lineHeight: 1.04, letterSpacing: -3, color: "#fff", marginTop: 10, opacity: ease(f, 2, 14) }}>
          {TX[lang].start1}
        </div>
        <GemText size={96} style={{ letterSpacing: -3, display: "block", opacity: ease(f, 6, 18) }}>
          {TX[lang].start2}
        </GemText>
      </div>
      <div
        style={{
          position: "absolute",
          left: -40 + (1 - phone) * -500,
          top: 640,
          width: W,
          height: H,
          borderRadius: 70,
          padding: 14,
          background: "linear-gradient(145deg, #2A3770, #0A0F2A)",
          boxShadow: "0 60px 140px rgba(0,0,0,0.55), 0 0 0 3px rgba(159,212,255,0.45)",
          transform: `rotate(${-6 + (1 - phone) * -10}deg)`,
        }}
      >
        <Img src={staticFile("shots/ranked.png")} style={{ width: "100%", height: "100%", borderRadius: 58, objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ position: "absolute", right: 60, top: 720, width: 560, display: "flex", flexDirection: "column", gap: 34 }}>
        {points.map((p, i) => {
          const s = spring({ frame: f - 14 - i * 12, fps, config: { damping: 12 } });
          return (
            <div
              key={p.k}
              style={{
                padding: "30px 34px",
                borderRadius: 34,
                background: "rgba(255,255,255,0.07)",
                border: "2px solid rgba(159,212,255,0.25)",
                opacity: s,
                transform: `translateX(${(1 - s) * 220}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 34, color: C.ice }}>{p.k}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: "#fff", lineHeight: 1.15, marginTop: 6 }}>{p.t}</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 38, color: C.dim }}>{p.s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Leaderboard ----------
const BoardScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { n: "Giulia_R", sr: 2140 },
    { n: TX[lang].you, sr: 1985 },
    { n: "Ale99", sr: 1810 },
    { n: "SaraInvest", sr: 1620 },
    { n: "Fede_btc", sr: 1475 },
  ];
  const tierFor = (sr: number) => [...TIERS].reverse().find((t) => sr >= t.min) ?? TIERS[0];
  return (
    <Dark tint="rgba(255,111,181,0.22)">
      <div style={{ position: "absolute", top: 190, left: 90, right: 90 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 112, lineHeight: 1.02, letterSpacing: -4, color: "#fff" }}>{TX[lang].ch1}</div>
        <GemText size={112} style={{ letterSpacing: -4, display: "block" }}>
          {TX[lang].ch2}
        </GemText>
      </div>
      <div style={{ position: "absolute", top: 640, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 22 }}>
        {rows.map((r, i) => {
          const s = spring({ frame: f - 6 - i * 6, fps, config: { damping: 13 } });
          const me = r.n === TX[lang].you;
          const t = tierFor(r.sr);
          return (
            <div
              key={r.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "26px 36px",
                borderRadius: 40,
                background: me ? "linear-gradient(120deg, rgba(159,212,255,0.35), rgba(182,166,255,0.25))" : "rgba(255,255,255,0.06)",
                border: me ? "3px solid rgba(207,234,255,0.9)" : "2px solid rgba(255,255,255,0.08)",
                boxShadow: me ? "0 0 80px rgba(159,212,255,0.35)" : "none",
                opacity: s,
                transform: `translateY(${(1 - s) * 120}px) scale(${me ? 1 + 0.03 * Math.sin(f / 5) : 1})`,
              }}
            >
              <div style={{ width: 70, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 60, color: i === 0 ? "#FF6FB5" : C.ice }}>{i + 1}</div>
              <Badge tier={t} size={110} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 54, color: "#fff" }}>{r.n}</div>
                <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: t.colors[1] }}>{tName(t, lang)}</div>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 56, color: "#fff" }}>{r.sr}</div>
            </div>
          );
        })}
      </div>
    </Dark>
  );
};

// ---------- 6. CTA ----------
const CtaScene: React.FC<P> = ({ lang = "it" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 10 } });
  const c = spring({ frame: f - 18, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Backdrop />
      <div style={{ display: "flex", gap: 10, marginTop: 260 }}>
        {TIERS.map((t, i) => {
          const s = spring({ frame: f - i * 3, fps, config: { damping: 11 } });
          return (
            <div key={t.id} style={{ transform: `translateY(${(1 - s) * 80 + Math.sin(f / 9 + i) * 8}px)`, opacity: s }}>
              <Badge tier={t} size={150} />
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 116, color: "#fff", letterSpacing: -4, marginTop: 90, opacity: a, transform: `scale(${0.9 + a * 0.1})` }}>
        {TX[lang].find1}
      </div>
      <GemText size={116} style={{ letterSpacing: -4, display: "inline-block", opacity: a, transform: `scale(${0.9 + a * 0.1})` }}>
        {TX[lang].find2}
      </GemText>
      <div style={{ marginTop: 100, transform: `scale(${a})` }}>
        <SonarMark size={170} spin={f * 2} />
      </div>
      <div
        style={{
          marginTop: 70,
          padding: "40px 96px",
          borderRadius: 999,
          backgroundImage: gemGradient,
          boxShadow: "0 30px 90px rgba(159,212,255,0.5)",
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: 62,
          color: C.ink,
          transform: `scale(${c * (1 + Math.sin(f / 6) * 0.03)})`,
        }}
      >
        {TX[lang].cta}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 100,
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
        {TX[lang].legal}
      </div>
    </AbsoluteFill>
  );
};

const T = 10;
export const RANKED_DURATION = 75 + CLIMB + 75 + 120 + 90 + 110 - 5 * T;

export const RankedAd: React.FC<P> = ({ lang = "it" }) => (
  <>
  <Audio src={staticFile("music/ranked.wav")} />
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={75}>
      <HookScene lang={lang} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="Climb" durationInFrames={CLIMB}>
      <ClimbScene lang={lang} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="Promotion" durationInFrames={75}>
      <PromoScene lang={lang} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="How" durationInFrames={120}>
      <HowScene lang={lang} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="Board" durationInFrames={90}>
      <BoardScene lang={lang} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="CTA" durationInFrames={110}>
      <CtaScene lang={lang} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
  </>
);

export { HookScene as RankedHook, ClimbScene as RankedClimb, PromoScene as RankedPromo, HowScene as RankedHow, BoardScene as RankedBoard, CtaScene as RankedCta };
