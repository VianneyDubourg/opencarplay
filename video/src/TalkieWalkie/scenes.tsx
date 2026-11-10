import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "./theme";
import { Avatar, RadioWaves, WalkieIcon, Waveform } from "./ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const center: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  fontFamily: FONT,
  color: COLORS.white,
};

/* ------------------------------------------------------------------ */
/* 1. Intro: logo reveal                                               */
/* ------------------------------------------------------------------ */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const title = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const letters = "Talkie Walkie".split("");

  return (
    <AbsoluteFill style={center}>
      <div style={{ position: "relative", width: 420, height: 420 }}>
        <RadioWaves size={420} intensity={pop} />
        <AbsoluteFill style={{ ...center, transform: `scale(${pop})` }}>
          <WalkieIcon size={260} />
        </AbsoluteFill>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 130,
          fontWeight: 800,
          letterSpacing: -3,
          marginTop: 20,
        }}
      >
        {letters.map((l, i) => {
          const s = spring({
            frame: frame - 25 - i * 2,
            fps,
            config: { damping: 14 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                transform: `translateY(${(1 - s) * 60}px)`,
                opacity: s,
                color: i >= 7 ? COLORS.orange : COLORS.white,
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 38,
          color: COLORS.muted,
          marginTop: 10,
          opacity: title,
          transform: `translateY(${(1 - title) * 20}px)`,
        }}
      >
        Le talkie-walkie dans votre poche
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Tagline                                                          */
/* ------------------------------------------------------------------ */
export const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = [
    { text: "Appuyez.", color: COLORS.white },
    { text: "Parlez.", color: COLORS.yellow },
    { text: "C'est tout.", color: COLORS.orange },
  ];
  return (
    <AbsoluteFill style={center}>
      <div style={{ display: "flex", gap: 34 }}>
        {words.map((w, i) => {
          const s = spring({
            frame: frame - 8 - i * 18,
            fps,
            config: { damping: 11, mass: 0.8 },
          });
          return (
            <div
              key={w.text}
              style={{
                fontSize: 120,
                fontWeight: 900,
                letterSpacing: -4,
                color: w.color,
                transform: `scale(${0.5 + s * 0.5}) translateY(${(1 - s) * 80}px)`,
                opacity: s,
              }}
            >
              {w.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. App mockup + features                                            */
/* ------------------------------------------------------------------ */
const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Press the button between these frames
  const pressStart = 45;
  const pressEnd = 120;
  const pressed =
    interpolate(frame, [pressStart, pressStart + 6], [0, 1], clamp) *
    interpolate(frame, [pressEnd, pressEnd + 6], [1, 0], clamp);
  const bubbleIn = spring({ frame: frame - pressEnd - 4, fps });
  const replyIn = spring({ frame: frame - pressEnd - 45, fps });
  const elapsed = Math.max(
    0,
    Math.min(frame, pressEnd) - pressStart,
  );
  const seconds = Math.floor(elapsed / fps);

  return (
    <div
      style={{
        width: 440,
        height: 900,
        borderRadius: 70,
        background: "#0A0812",
        padding: 16,
        boxShadow:
          "0 50px 120px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 56,
          background: `linear-gradient(180deg, ${COLORS.bg2}, ${COLORS.bg})`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 28px 40px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 18,
            width: 120,
            height: 30,
            borderRadius: 20,
            background: "#0A0812",
          }}
        />
        {/* header */}
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 18, color: COLORS.muted }}>Canal</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Équipe 🚀</div>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(46,204,113,0.18)",
              color: "#2ECC71",
            }}
          >
            ● 5 en ligne
          </div>
        </div>

        {/* members */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {[
            ["MA", "#FFC23C"],
            ["LU", "#7FD1FF"],
            ["TO", "#FF8FB1"],
            ["IN", "#9BE58C"],
            ["SA", "#C9A7FF"],
          ].map(([i, c]) => (
            <Avatar key={i} initials={i} color={c} size={58} />
          ))}
        </div>

        {/* messages */}
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 30,
            minHeight: 180,
          }}
        >
          <div
            style={{
              alignSelf: "flex-end",
              background: COLORS.orange,
              borderRadius: "24px 24px 6px 24px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: bubbleIn,
              transform: `translateY(${(1 - bubbleIn) * 30}px)`,
            }}
          >
            <span style={{ fontSize: 22 }}>▶</span>
            <Waveform
              bars={14}
              height={30}
              active={0.5}
              color={COLORS.white}
              barWidth={4}
              gap={4}
            />
            <span style={{ fontSize: 18, fontWeight: 700 }}>0:0{seconds || 2}</span>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              background: COLORS.card,
              borderRadius: "24px 24px 24px 6px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: replyIn,
              transform: `translateY(${(1 - replyIn) * 30}px)`,
            }}
          >
            <Avatar initials="MA" color="#FFC23C" size={34} />
            <Waveform
              bars={12}
              height={30}
              active={0.5}
              color={COLORS.yellow}
              barWidth={4}
              gap={4}
            />
            <span style={{ fontSize: 18, fontWeight: 700 }}>0:03</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* live waveform while talking */}
        <div
          style={{
            height: 70,
            opacity: pressed,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ color: COLORS.orange, fontWeight: 800, fontSize: 20 }}>
            ● 0:0{seconds}
          </span>
          <Waveform bars={18} height={60} active={pressed} barWidth={6} gap={5} />
        </div>

        {/* push-to-talk button */}
        <div
          style={{
            position: "relative",
            width: 230,
            height: 230,
            marginTop: 20,
          }}
        >
          <RadioWaves size={230} intensity={pressed} period={30} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `linear-gradient(145deg, ${COLORS.yellow}, ${COLORS.orange})`,
              transform: `scale(${1 - pressed * 0.08})`,
              boxShadow: `0 0 ${20 + pressed * 70}px rgba(255,90,31,${0.35 + pressed * 0.5})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicIcon size={80} />
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: COLORS.bg,
                marginTop: 6,
              }}
            >
              {pressed > 0.5 ? "En direct…" : "Maintenir"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MicIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={COLORS.bg} />
    <path
      d="M5 11a7 7 0 0 0 14 0M12 18v3"
      stroke={COLORS.bg}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const features = [
  {
    icon: "🎙️",
    title: "Appuyez pour parler",
    text: "Un seul bouton, votre voix part instantanément.",
  },
  {
    icon: "⚡",
    title: "En temps réel",
    text: "Vos proches vous entendent en direct, sans attendre.",
  },
  {
    icon: "👥",
    title: "Canaux de groupe",
    text: "Famille, amis, équipe : un canal pour chacun.",
  },
];

export const AppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ ...center, flexDirection: "row", gap: 140 }}>
      <div
        style={{
          transform: `translateY(${(1 - phoneIn) * 700}px) rotate(${(1 - phoneIn) * -8}deg)`,
        }}
      >
        <Phone />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
        {features.map((f, i) => {
          const s = spring({
            frame: frame - 30 - i * 45,
            fps,
            config: { damping: 200 },
          });
          return (
            <div
              key={f.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                opacity: s,
                transform: `translateX(${(1 - s) * 80}px)`,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 32,
                  background: COLORS.card,
                  border: `2px solid rgba(255,90,31,${0.3 + s * 0.4})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 54,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 30, color: COLORS.muted, marginTop: 6 }}>
                  {f.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Network of people                                                */
/* ------------------------------------------------------------------ */
const people = [
  ["MA", "#FFC23C"],
  ["LU", "#7FD1FF"],
  ["TO", "#FF8FB1"],
  ["IN", "#9BE58C"],
  ["SA", "#C9A7FF"],
  ["JO", "#FFD6A5"],
];

export const NetworkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cx = 960;
  const cy = 470;
  const radius = 330;
  const textIn = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const speaker = Math.floor(frame / 20) % people.length;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: COLORS.white }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {people.map((_, i) => {
          const a = (i / people.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          const draw = interpolate(frame - 5 - i * 4, [0, 20], [0, 1], clamp);
          const len = radius;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={i === speaker ? COLORS.orange : "rgba(255,255,255,0.18)"}
              strokeWidth={i === speaker ? 6 : 3}
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* center logo */}
      <div
        style={{
          position: "absolute",
          left: cx - 110,
          top: cy - 110,
          width: 220,
          height: 220,
        }}
      >
        <RadioWaves size={220} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: COLORS.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 60px rgba(255,90,31,0.35)",
          }}
        >
          <WalkieIcon size={140} />
        </div>
      </div>

      {people.map(([init, color], i) => {
        const a = (i / people.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        const s = spring({
          frame: frame - 10 - i * 4,
          fps,
          config: { damping: 12 },
        });
        const talking = i === speaker;
        return (
          <div
            key={init}
            style={{
              position: "absolute",
              left: x - 55,
              top: y - 55,
              transform: `scale(${s * (talking ? 1.15 : 1)})`,
            }}
          >
            <Avatar initials={init} color={color} size={110} ring={talking} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 70,
          width: "100%",
          textAlign: "center",
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: -1.5,
          opacity: textIn,
          transform: `translateY(${(1 - textIn) * 30}px)`,
        }}
      >
        Restez connectés,{" "}
        <span style={{ color: COLORS.orange }}>où que vous soyez.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Outro / call to action                                           */
/* ------------------------------------------------------------------ */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12 } });
  const name = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const cta = spring({ frame: frame - 30, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.03 * cta;

  return (
    <AbsoluteFill style={center}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -30}deg)` }}>
          <WalkieIcon size={200} />
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: -4,
            opacity: name,
            transform: `translateX(${(1 - name) * -40}px)`,
          }}
        >
          Talkie <span style={{ color: COLORS.orange }}>Walkie</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 60,
          padding: "26px 60px",
          borderRadius: 100,
          background: `linear-gradient(90deg, ${COLORS.yellow}, ${COLORS.orange})`,
          color: COLORS.bg,
          fontSize: 46,
          fontWeight: 800,
          opacity: cta,
          transform: `scale(${cta * pulse})`,
          boxShadow: "0 20px 60px rgba(255,90,31,0.4)",
        }}
      >
        Téléchargez l'application
      </div>
    </AbsoluteFill>
  );
};
