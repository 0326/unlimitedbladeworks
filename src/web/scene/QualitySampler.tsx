import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * frame-time 采样降级（balanced → low，单向）：
 * EMA 帧时间持续 > 25ms 达 2 秒即触发；恢复不自动升档，避免抖动。
 * 仅在档位为 balanced 且页面可见时采样。
 */
export function QualitySampler({
  active,
  onDegrade,
}: {
  active: boolean;
  onDegrade: (reason: string) => void;
}) {
  const emaMs = useRef(16.7);
  const overMs = useRef(0);
  const fired = useRef(false);

  useFrame((_, delta) => {
    if (!active || fired.current) return;
    if (document.visibilityState !== "visible") return;
    const clamped = Math.min(delta, 0.25);
    emaMs.current = emaMs.current * 0.9 + clamped * 1000 * 0.1;
    if (emaMs.current > 25) {
      overMs.current += clamped * 1000;
    } else {
      overMs.current = Math.max(0, overMs.current - clamped * 1000 * 2);
    }
    if (overMs.current > 2000) {
      fired.current = true;
      onDegrade("frame_time");
    }
  });

  return null;
}
