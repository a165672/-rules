import { assertAttributes, canonicalize, createMarkupSurfaceHostFacet, sameType, sealGraphFragment, textAttribute } from "@hypit/hypit/author-kit";
import type { ComponentPackage, ModuleManifest, StructuredSurfaceHandler, SurfaceResolvedReference, TypeRef } from "@hypit/hypit/author-kit";
import { compositionTypes } from "@hypit/hypit/composition";
import { mediaTypes } from "@hypit/hypit/media";
import type { FontArtifactRef } from "@hypit/hypit/media";
import type { Timeline } from "@hypit/hypit/timeline";
import { timelineTypes } from "@hypit/hypit/timeline";
import { spatialTypes } from "@hypit/hypit/spatial";
import type { CanvasSpace } from "@hypit/hypit/spatial";
import { temporalTypes } from "@hypit/hypit/temporal";
import type { TemporalWindow } from "@hypit/hypit/temporal";
import { createTemporalWindowProjection, resolveTemporalContext, temporalContextAttributeVocabulary,
  temporalWindowAttributeNames, temporalWindowAttributeVocabulary } from "@hypit/hypit/temporal-markup";
import { renderExplainer } from "./render.js";
import type { ExplainerOptions } from "./render.js";

const module = { name: "@lazy/kinetic-explainer", version: "1" } as const;
const types = { options: { module, name: "Options" } } as const satisfies Record<string, TypeRef>;
const producers = { render: { module, name: "render" } } as const;

/** Surface attribute → Producer input; each is one exact face of the design. */
const FONT_INPUTS = [
  ["serif-black", "serifBlack"], ["serif-bold", "serifBold"],
  ["sans-regular", "sansRegular"], ["sans-medium", "sansMedium"], ["sans-bold", "sansBold"],
] as const;

export const manifest: ModuleManifest = {
  format: "hypit.module@1", ...module,
  dependencies: [compositionTypes.visualTrack, mediaTypes.fontArtifact, timelineTypes.track, spatialTypes.canvas, temporalTypes.window]
    .map((type) => ({ module: type.module })),
  types: [{ name: types.options.name }], capabilities: [],
  producers: [{
    name: producers.render.name,
    inputs: [
      { name: "options", type: types.options }, { name: "timeline", type: timelineTypes.track },
      { name: "canvas", type: spatialTypes.canvas }, { name: "window", type: temporalTypes.window },
      ...FONT_INPUTS.map(([, input]) => ({ name: input, type: mediaTypes.fontArtifact })),
    ],
    outputs: [{ name: "track", type: compositionTypes.visualTrack }], needs: [],
  }],
};

const inline = <T>(record: { value: { kind: string; value?: unknown } } | undefined, name: string): T => {
  if (record?.value.kind !== "inline") throw new Error(`Kinetic explainer input ${name} must be an inline value.`);
  return record.value.value as T;
};
const value = (data: unknown) => ({ kind: "inline" as const, value: canonicalize(data) });

const component: ComponentPackage = { producers: [{
  producer: producers.render,
  handler: ({ inputs }) => {
    const font = (name: string) => inline<FontArtifactRef>(inputs[name], name);
    const track = renderExplainer(
      inline<Timeline>(inputs.timeline, "timeline"), inline<CanvasSpace>(inputs.canvas, "canvas"),
      inline<TemporalWindow>(inputs.window, "window"),
      { serifBlack: font("serifBlack"), serifBold: font("serifBold"), sansRegular: font("sansRegular"),
        sansMedium: font("sansMedium"), sansBold: font("sansBold") },
      inline<ExplainerOptions>(inputs.options, "options"));
    return { outputs: { track: value(track) }, needs: {} };
  },
}] };

export const decodeSurface: StructuredSurfaceHandler = ({ element, resolveReference }) => {
  assertAttributes(element, ["id", "timeline", "canvas", ...FONT_INPUTS.map(([attribute]) => attribute), ...temporalWindowAttributeNames]);
  if (element.children.some((child) => child.kind !== "text" || child.value.trim())) {
    throw new Error("Kinetic explainer Scene has no children; its copy and choreography live in the package's web/ scenes.");
  }
  const id = textAttribute(element, "id");
  const context = resolveTemporalContext({ element, resolveReference });
  const window = createTemporalWindowProjection({ id: `${id}.window`, subjectId: id, element, ...context, resolveReference });
  const reference = (name: string, type: TypeRef): SurfaceResolvedReference => {
    const raw = element.attributes[name];
    if (typeof raw !== "object" || raw.kind !== "reference") throw new Error(`${name} must be a reference.`);
    const found = resolveReference(raw.path);
    if (found === undefined || !sameType(found.type, type)) throw new Error(`${name} has the wrong Type.`);
    return found;
  };
  const options: ExplainerOptions = { id };
  const records = [...window.records, { id: `${id}.options`, type: types.options, value: value(options), range: element.range }];
  const inputs = [
    { name: "options", type: types.options }, { name: "timeline", type: timelineTypes.track },
    { name: "canvas", type: spatialTypes.canvas }, { name: "window", type: temporalTypes.window },
    ...FONT_INPUTS.map(([, input]) => ({ name: input, type: mediaTypes.fontArtifact })),
  ];
  const bindings: Record<string, SurfaceResolvedReference["ref"]> = {
    options: { kind: "record", id: `${id}.options` }, timeline: context.timeline.ref,
    canvas: reference("canvas", spatialTypes.canvas).ref, window: window.ref,
  };
  for (const [attribute, input] of FONT_INPUTS) bindings[input] = reference(attribute, mediaTypes.fontArtifact).ref;
  const input = (name: string) => ({ kind: "fragment-input" as const, name });
  const fragment = sealGraphFragment({
    inputs,
    operations: [{
      id: "render", producer: producers.render,
      inputs: Object.fromEntries(inputs.map(({ name }) => [name, input(name)])),
      result: { kind: "output", name: "track" },
    }],
    exports: [{ name: "track", type: compositionTypes.visualTrack, root: { kind: "fragment-operation", operation: "render" } }],
  });
  return {
    records, fragments: [...window.fragments, fragment],
    components: [...window.components, { id, fragment: fragment.id, inputs: bindings, outputs: { track: `${id}.track` }, range: element.range }],
    exports: [`${id}.track`],
  };
};

const declaration = {
  name: "scene", tag: "Scene", mode: "structured" as const,
  outputs: [compositionTypes.visualTrack, timelineTypes.track, temporalTypes.window, temporalTypes.instant, temporalTypes.windowSpec, temporalTypes.instantSpec, types.options],
  vocabulary: {
    summary: "The whole kinetic-typography explainer (chapter marker, progress bar, background glow and six chapters) drawn by one frame-driven browser program on the score's beat grid.",
    attributes: [
      ...temporalContextAttributeVocabulary, ...temporalWindowAttributeVocabulary,
      { name: "id", kind: "expression" as const, required: true, summary: "Scene id; publishes <id>.track." },
      { name: "canvas", kind: "expression" as const, required: true, summary: "A 16:9 Canvas; the 1280x720 design is scaled to it." },
      ...FONT_INPUTS.map(([attribute]) => ({ name: attribute, kind: "expression" as const, required: true, summary: `Exact FontArtifactRef for the ${attribute} face.` })),
    ],
    children: [],
    ports: [{ name: "track", type: compositionTypes.visualTrack, summary: "The complete animated picture." }],
    example: '<kx:Scene id="explainer" timeline={animation.timeline} canvas={canvas} during="program" serif-black={serif-black} serif-bold={serif-bold} sans-regular={sans-regular} sans-medium={sans-medium} sans-bold={sans-bold}/>',
  },
};

export const hypitPackage = {
  format: "hypit.node-package@1" as const, modules: [{ manifest }], components: [component],
  hostFacets: [createMarkupSurfaceHostFacet({ module, declaration, handler: decodeSurface })],
};
export default hypitPackage;
