import "./index.css";
import { loadBrandFonts } from "./fonts";
import { CalculateMetadataFunction, Composition, Folder, Still } from "remotion";
import { timed, timedAlpha } from "./lib/motion";
import { LogoSting, LogoStingProps, logoStingDefaults } from "./templates/LogoSting";
import { FontCheck } from "./FontCheck";
import { Intro, IntroProps, introDefaults } from "./templates/Intro";
import { ChapterCard, ChapterCardProps, chapterDefaults } from "./templates/ChapterCard";
import { LowerThird, LowerThirdProps, lowerThirdDefaults } from "./templates/LowerThird";
import { Callout, CalloutProps, calloutDefaults } from "./templates/Callout";
import { KeyPoints, KeyPointsProps, keyPointsDefaults } from "./templates/KeyPoints";
import { SubscribeReminder, SubscribeReminderProps, subscribeDefaults } from "./templates/SubscribeReminder";
import { Outro, OutroProps, outroDefaults } from "./templates/Outro";
import { Thumbnail, thumbnailDefaults } from "./templates/Thumbnail";

// Every clip is 1920×1080. Length and fps come from the durationSec / fps props, so a render
// can match the footage: --props='{"durationSec":6,"fps":60,...}'.
loadBrandFonts();

const HD = { width: 1920, height: 1080, durationInFrames: 150, fps: 30 } as const;

const stingMetadata: CalculateMetadataFunction<LogoStingProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round(props.durationSec * props.fps)),
  fps: props.fps,
  width: props.orientation === "portrait" ? 1080 : 1920,
  height: props.orientation === "portrait" ? 1920 : 1080,
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Brand">
        <Composition id="LogoSting" component={LogoSting} {...HD} defaultProps={logoStingDefaults} calculateMetadata={stingMetadata} />
        <Composition
          id="LogoStingVertical"
          component={LogoSting}
          {...HD}
          defaultProps={{ ...logoStingDefaults, orientation: "portrait" as const }}
          calculateMetadata={stingMetadata}
        />
      </Folder>
      <Folder name="Full-screen">
        <Composition id="Intro" component={Intro} {...HD} defaultProps={introDefaults} calculateMetadata={timed<IntroProps>()} />
        <Composition id="ChapterCard" component={ChapterCard} {...HD} defaultProps={chapterDefaults} calculateMetadata={timed<ChapterCardProps>()} />
        <Composition id="Outro" component={Outro} {...HD} defaultProps={outroDefaults} calculateMetadata={timed<OutroProps>()} />
      </Folder>
      <Folder name="Overlays-alpha">
        <Composition id="LowerThird" component={LowerThird} {...HD} defaultProps={lowerThirdDefaults} calculateMetadata={timedAlpha<LowerThirdProps>()} />
        <Composition id="Callout" component={Callout} {...HD} defaultProps={calloutDefaults} calculateMetadata={timedAlpha<CalloutProps>()} />
        <Composition id="KeyPoints" component={KeyPoints} {...HD} defaultProps={keyPointsDefaults} calculateMetadata={timedAlpha<KeyPointsProps>()} />
        <Composition
          id="SubscribeReminder"
          component={SubscribeReminder}
          {...HD}
          defaultProps={subscribeDefaults}
          calculateMetadata={timedAlpha<SubscribeReminderProps>()}
        />
        <Composition
          id="ChapterPanel"
          component={ChapterCard}
          {...HD}
          defaultProps={{ ...chapterDefaults, fullscreen: false }}
          calculateMetadata={timedAlpha<ChapterCardProps>()}
        />
      </Folder>
      <Folder name="Diagnostics">
        {/* Each family falls back to serif: any line in a serif face means that font failed to load. */}
        <Still id="FontCheck" component={FontCheck} width={1920} height={1080} />
      </Folder>
      <Folder name="Stills">
        <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={thumbnailDefaults} />
      </Folder>
    </>
  );
};
