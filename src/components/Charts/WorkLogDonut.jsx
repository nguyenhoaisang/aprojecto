import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './Charts.css';

const COLORS = ['#fa4343', '#2a9ddb', '#f7931e', '#f9c74f', '#90be6d'];

// Biểu đồ vành khuyên. data: [{ id, product, hours }]
function WorkLogDonut({ data }) {
  return (
    <div className="chart-row">
      <div className="chart-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="hours" nameKey="product" innerRadius="55%" outerRadius="95%" stroke="none">
              {data.map(function (item, index) {
                return <Cell key={item.id} fill={COLORS[index % COLORS.length]} />;
              })}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="chart-legend">
        {data.map(function (item, index) {
          return <li key={item.id}><i style={{ background: COLORS[index % COLORS.length] }}></i>{item.product}</li>;
        })}
      </ul>
    </div>
  );
}

export default WorkLogDonut;
