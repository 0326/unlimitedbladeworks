import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * Field 后处理（仅 Balanced）：动态 import，独立 chunk，
 * 不进 Field 首包（设计文档 §10 加载策略）。
 */
export default function FieldEffects({ depthOfField }: { depthOfField: boolean }) {
  return (
    <EffectComposer>
      <Bloom intensity={0.25} luminanceThreshold={0.72} mipmapBlur />
      {depthOfField && (
        <DepthOfField focusDistance={0.06} focalLength={0.02} bokehScale={0.5} height={480} />
      )}
      <Vignette offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
