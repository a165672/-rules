import { sealVisualTrack } from "@hypit/hypit/composition";
import { browserProgram, hyperframesResourceUri } from "@hypit/hypit/hyperframes";
import type { FontArtifactRef } from "@hypit/hypit/media";
import type { Timeline } from "@hypit/hypit/timeline";
import type { CanvasSpace } from "@hypit/hypit/spatial";
import { assertTemporalWindowFor } from "@hypit/hypit/temporal";
import type { TemporalWindow } from "@hypit/hypit/temporal";
import { ENGINE_SOURCE, STYLE_SOURCE } from "./web-bundle.js";

/** The five exact faces the design uses (headline serif, body sans). */
export type ExplainerFonts = {
  serifBlack: FontArtifactRef;
  serifBold: FontArtifactRef;
  sansRegular: FontArtifactRef;
  sansMedium: FontArtifactRef;
  sansBold: FontArtifactRef;
};
export type ExplainerOptions = { id: string };

/** Design coordinates of the scenes in web/; the stage is scaled to the Canvas. */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

/**
 * The whole explainer is one coordinated scene: chapter marker, progress bar, background glow and
 * every chapter share one stage and one clock, so they are drawn by a single browser program.
 * Its internal schedule follows the program clock (seconds = frame / fps) because every reveal is
 * placed on a beat of the reused score.
 */
export function renderExplainer(timeline: Timeline, canvas: CanvasSpace, window: TemporalWindow,
  fonts: ExplainerFonts, options: ExplainerOptions) {
  assertTemporalWindowFor(window, { subjectId: options.id, space: timeline });
  if (canvas.widthPx * DESIGN_HEIGHT !== canvas.heightPx * DESIGN_WIDTH) {
    throw new Error(`Kinetic explainer is designed for 16:9; got ${canvas.widthPx}x${canvas.heightPx}.`);
  }
  const faces: [string, number, FontArtifactRef][] = [
    ["NSerif", 900, fonts.serifBlack], ["NSerif", 700, fonts.serifBold],
    ["NSans", 400, fonts.sansRegular], ["NSans", 500, fonts.sansMedium], ["NSans", 700, fonts.sansBold],
  ];
  const artifacts = faces.flatMap(([, , face]) => face.sources.map((source) => source.artifact));
  const program = browserProgram({
    html: "",
    css: ":scope{background:#0b0a0c;overflow:hidden}",
    data: {
      fonts: faces.flatMap(([family, weight, face]) => face.sources.map((source) =>
        ({ family, weight, url: hyperframesResourceUri(source.artifact.resource) }))),
      style: STYLE_SOURCE,
      fpsNumerator: timeline.frameRate.numerator,
      fpsDenominator: timeline.frameRate.denominator,
      startFrame: window.span.startFrame,
      scale: canvas.widthPx / DESIGN_WIDTH,
    },
    setup: `window.__KX_PROGRAM__ = true;
${ENGINE_SOURCE}
;
/* 场景脚本通过全局 window.V 访问引擎；这里不能再声明同名局部变量，否则会遮蔽它 */
const KX = window.V;
KX.installFonts(data.fonts);
KX.el('style', { text: data.style, parent: document.head });
const stage = document.createElement('div');
stage.id = 'stage';
stage.style.position = 'absolute';
stage.style.left = '0px';
stage.style.top = '0px';
stage.style.transformOrigin = '0 0';
stage.style.transform = 'scale(' + data.scale + ')';
root.appendChild(stage);
KX.init(stage);
return (frame) => KX.renderAt((data.startFrame + frame) * data.fpsDenominator / data.fpsNumerator);`,
  }, artifacts);
  return sealVisualTrack({
    id: options.id, programSpaceId: timeline.id, visualIr: "hypit.visual-ir@1",
    presents: [{
      id: options.id, span: window.span, stacking: { order: 0, tieBreak: options.id },
      elements: [{
        id: `${options.id}-stage`, kind: "program", order: 0, program,
        style: [{ name: "position", value: "absolute" }, { name: "left", value: 0 }, { name: "top", value: 0 },
          { name: "width", value: `${canvas.widthPx}px` }, { name: "height", value: `${canvas.heightPx}px` }],
      }],
    }],
  });
}
