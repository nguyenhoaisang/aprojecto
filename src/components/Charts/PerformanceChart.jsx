import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './Charts.css';

// Biểu đồ đường Achieved / Target. data: [{ month, achieved, target }]
function PerformanceChart({ data }) {
  return (
    <div>
      <div className="chart-legend line">
        <span><i style={{ background: '#ff8a65' }}></i>Achieved</span>
        <span><i style={{ background: '#6c4fe0' }}></i>Target</span>
      </div>
      <div className="chart-line">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="#eef1f6" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="achieved" stroke="#ff8a65" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="target" stroke="#6c4fe0" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PerformanceChart;
