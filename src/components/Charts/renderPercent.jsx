// Hiện số % bên trong mỗi miếng của biểu đồ tròn (dùng cho thuộc tính label của recharts)
export function renderPercent(props) {
  const radian = Math.PI / 180;
  const r = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.55;
  const x = props.cx + r * Math.cos(-props.midAngle * radian);
  const y = props.cy + r * Math.sin(-props.midAngle * radian);
  if (props.percent === 0) {
    return null;
  }
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={18}>
      {Math.round(props.percent * 100) + '%'}
    </text>
  );
}
