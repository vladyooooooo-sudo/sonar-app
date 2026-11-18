import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Composition, Folder } from "remotion";

import { FeatureScene, HookScene, LogoScene, OfferScene, type FeatureProps } from "./scenes";

const T = 12;

const features: FeatureProps[] = [
  { kicker: "PORTAFOGLIO DEMO", title: "Prezzi reali,", highlight: "zero rischio.", shot: "shots/home.png", chip: "LIVE" },
  { kicker: "IL RADAR", title: "Scansiona i mercati", highlight: "al posto tuo.", shot: "shots/radar.png", chip: "Segnale 89" , chipColor: "#3D7BFF" },
  { kicker: "IMPARA", title: "Impara giocando.", highlight: "Sfida gli amici.", shot: "shots/impara.png", chip: "+50 XP", chipColor: "#7A5CFF" },
];

export const SonarPromo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={95}>
      <HookScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="Logo" durationInFrames={80}>
      <LogoScene />
    </TransitionSeries.Sequence>
    {features.map((p, i) => [
      <TransitionSeries.Transition
        key={`t${i}`}
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />,
      <TransitionSeries.Sequence key={`s${i}`} name={p.kicker} durationInFrames={100}>
        <FeatureScene {...p} />
      </TransitionSeries.Sequence>,
    ])}
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
    <TransitionSeries.Sequence name="Offer" durationInFrames={120}>
      <OfferScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

const TOTAL = 95 + 80 + 3 * 100 + 120 - 5 * T;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Scenes">
      <Composition id="Hook" component={HookScene} width={1080} height={1920} fps={30} durationInFrames={95} />
      <Composition id="Logo" component={LogoScene} width={1080} height={1920} fps={30} durationInFrames={80} />
      <Composition
        id="Feature"
        component={FeatureScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={100}
        defaultProps={features[1]}
      />
      <Composition id="Offer" component={OfferScene} width={1080} height={1920} fps={30} durationInFrames={120} />
    </Folder>
    <Composition id="SonarPromo" component={SonarPromo} width={1080} height={1920} fps={30} durationInFrames={TOTAL} />
  </>
);

