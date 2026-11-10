import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Fades a scene in and out over its own duration. */
export const SceneFade: React.FC<{
  duration: number;
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ duration, children, fadeIn = 10, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const opacityIn =
    fadeIn === 0 ? 1 : interpolate(frame, [0, fadeIn], [0, 1], clamp);
  const opacityOut =
    fadeOut === 0
      ? 1
      : interpolate(frame, [duration - fadeOut, duration], [1, 0], clamp);
  const opacity = Math.min(opacityIn, opacityOut);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Animated background: dark gradient with slowly drifting glows. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const x1 = 30 + Math.sin(frame / 60) * 10;
  const y1 = 30 + Math.cos(frame / 70) * 8;
  const x2 = 70 + Math.cos(frame / 55) * 10;
  const y2 = 75 + Math.sin(frame / 65) * 8;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(255,90,31,0.22), transparent 45%),
          radial-gradient(circle at ${x2}% ${y2}%, rgba(255,194,60,0.14), transparent 45%),
          linear-gradient(160deg, ${COLORS.bg2}, ${COLORS.bg})`,
      }}
    />
  );
};

/** The Talkie Walkie logo: a stylised walkie-talkie. */
export const WalkieIcon: React.FC<{ size: number; pressed?: number }> = ({
  size,
  pressed = 0,
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="tw-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.yellow} />
          <stop offset="100%" stopColor={COLORS.orange} />
        </linearGradient>
      </defs>
      {/* antenna */}
      <rect x="62" y="4" width="8" height="26" rx="4" fill={COLORS.orange} />
      {/* body */}
      <rect x="26" y="22" width="48" height="72" rx="14" fill="url(#tw-body)" />
      {/* screen */}
      <rect x="34" y="31" width="32" height="16" rx="5" fill={COLORS.bg} />
      <rect
        x="38"
        y="37"
        width={6 + pressed * 18}
        height="4"
        rx="2"
        fill={COLORS.yellow}
      />
      {/* speaker grille */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="36"
          y={56 + i * 8}
          width="28"
          height="4"
          rx="2"
          fill={COLORS.bg}
          opacity={0.55}
        />
      ))}
      {/* push-to-talk side button */}
      <rect
        x={20 + pressed * 3}
        y="40"
        width="8"
        height="20"
        rx="3"
        fill={COLORS.yellow}
      />
    </svg>
  );
};

/** Concentric expanding radio waves. */
export const RadioWaves: React.FC<{
  size: number;
  color?: string;
  count?: number;
  period?: number;
  intensity?: number;
}> = ({
  size,
  color = COLORS.orange,
  count = 3,
  period = 45,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {new Array(count).fill(0).map((_, i) => {
        const p = ((frame + (i * period) / count) % period) / period;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `4px solid ${color}`,
              transform: `scale(${0.4 + p * 1.2})`,
              opacity: (1 - p) * 0.7 * intensity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Live audio waveform bars. */
export const Waveform: React.FC<{
  bars: number;
  height: number;
  active: number;
  color?: string;
  barWidth?: number;
  gap?: number;
}> = ({
  bars,
  height,
  active,
  color = COLORS.orange,
  barWidth = 8,
  gap = 6,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap, height }}>
      {new Array(bars).fill(0).map((_, i) => {
        const wave =
          Math.abs(Math.sin(frame / 4 + i * 0.9)) * 0.6 +
          Math.abs(Math.sin(frame / 7 + i * 1.7)) * 0.4;
        const h = 0.12 + wave * 0.88 * active;
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: height * h,
              borderRadius: barWidth,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
};

export const Avatar: React.FC<{
  initials: string;
  color: string;
  size: number;
  ring?: boolean;
}> = ({ initials, color, size, ring }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      color: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: size * 0.38,
      boxShadow: ring ? `0 0 0 ${size * 0.07}px ${COLORS.orange}` : undefined,
    }}
  >
    {initials}
  </div>
);
