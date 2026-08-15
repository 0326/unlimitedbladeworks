/**
 * 02 右上罗盘：随相机方位角旋转，N 恒指向场景北方（-Z）。
 * heading 为弧度（相机绕 Y 的方位角），由 FieldCamera 低频上报。
 */
export function Compass({ heading }: { heading: number }) {
  const deg = (-heading * 180) / Math.PI;
  const points = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];
  return (
    <div className="field-compass" aria-hidden="true">
      <div className="field-compass__ring" style={{ transform: `rotate(${deg}deg)` }}>
        {points.map((p) => (
          <span
            key={p.label}
            className={`field-compass__pt${p.label === "N" ? " is-north" : ""}`}
            style={{ "--a": `${p.angle}deg` } as React.CSSProperties}
          >
            {p.label}
          </span>
        ))}
      </div>
      <span className="field-compass__sun">☀</span>
    </div>
  );
}
