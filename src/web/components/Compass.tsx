/**
 * 02 右上罗盘：随相机方位角旋转，N 恒指向场景北方（-Z）。
 * heading 为弧度（相机绕 Y 的方位角），由 FieldCamera 低频上报。
 */
export function Compass({ heading }: { heading: number }) {
  const deg = (-heading * 180) / Math.PI;
  const points = [
    { label: "W", position: "west" },
    { label: "N", position: "north" },
    { label: "E", position: "east" },
  ] as const;
  return (
    <div className="field-compass" aria-hidden="true">
      <div className="field-compass__ring" style={{ transform: `rotate(${deg * 0.12}deg)` }}>
        {points.map((p) => (
          <span key={p.label} className={`field-compass__pt is-${p.position}`}>
            {p.label}
          </span>
        ))}
      </div>
      <span className="field-compass__sun">☀</span>
    </div>
  );
}
