'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScoreDataPoint {
  quarter: string;
  homeScore: number;
  awayScore: number;
}

interface ScoreProgressChartProps {
  data: ScoreDataPoint[];
}

const ScoreProgressChart: React.FC<ScoreProgressChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg">
        <p className="text-white/40 text-sm">No game data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-sm font-bold text-white mb-4 uppercase">Score Progression</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="quarter"
            stroke="rgba(255,255,255,0.4)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
            }}
            labelStyle={{ color: 'white' }}
            formatter={(value: any) => [(value ?? 0).toString(), '']}
          />
          <Legend
            wrapperStyle={{ color: 'white' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="homeScore"
            stroke="#60A5FA"
            strokeWidth={3}
            dot={{ fill: '#60A5FA', r: 5 }}
            activeDot={{ r: 7 }}
            name="Local"
          />
          <Line
            type="monotone"
            dataKey="awayScore"
            stroke="#F87171"
            strokeWidth={3}
            dot={{ fill: '#F87171', r: 5 }}
            activeDot={{ r: 7 }}
            name="Visitante"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreProgressChart;
