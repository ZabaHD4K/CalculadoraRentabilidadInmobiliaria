"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProfitabilityChartProps {
  data: Array<{
    año: string;
    'Renta Anual': number;
    'Cash Flow': number;
    'Rentabilidad (%)': number;
  }>;
}

export default function ProfitabilityChart({ data }: ProfitabilityChartProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Evolución Proyectada (10 años)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="año" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend />
          <Line type="monotone" dataKey="Renta Anual" stroke="#14b8a6" strokeWidth={2} />
          <Line type="monotone" dataKey="Cash Flow" stroke="#a855f7" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
