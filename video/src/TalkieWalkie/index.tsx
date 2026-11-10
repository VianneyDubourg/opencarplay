import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SCENES } from "./theme";
import { Background, SceneFade } from "./ui";
import {
  AppScene,
  IntroScene,
  NetworkScene,
  OutroScene,
  TaglineScene,
} from "./scenes";

export const TalkieWalkie: React.FC = () => {
  const list = [
    { key: "intro", Comp: IntroScene, fadeIn: 0 },
    { key: "tagline", Comp: TaglineScene },
    { key: "app", Comp: AppScene },
    { key: "network", Comp: NetworkScene },
    { key: "outro", Comp: OutroScene, fadeOut: 15 },
  ] as const;

  return (
    <AbsoluteFill>
      <Background />
      {list.map((s) => {
        const t = SCENES[s.key];
        return (
          <Sequence
            key={s.key}
            from={t.from}
            durationInFrames={t.duration}
            name={s.key}
          >
            <SceneFade
              duration={t.duration}
              fadeIn={"fadeIn" in s ? s.fadeIn : 10}
              fadeOut={"fadeOut" in s ? s.fadeOut : 10}
            >
              <s.Comp />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
