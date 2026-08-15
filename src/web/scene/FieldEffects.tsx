import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * Field 后处理（仅 Balanced）：动态 import，独立 chunk，
 * 不进 Field 首包（设计文档 §10 加载策略）。
 */
export default function FieldEffects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.25} luminanceThreshold={0.72} mipmapBlur />
      <Vignette offset={0.22} darkness={0.55} />
    </EffectComposer>
  );
}
