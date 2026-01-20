import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const engagementData = [
  { name: 'Seg', uv: 4000, pv: 2400 },
  { name: 'Ter', uv: 3000, pv: 1398 },
  { name: 'Qua', uv: 2000, pv: 9800 },
  { name: 'Qui', uv: 2780, pv: 3908 },
  { name: 'Sex', uv: 1890, pv: 4800 },
  { name: 'Sáb', uv: 2390, pv: 3800 },
  { name: 'Dom', uv: 3490, pv: 4300 },
];

const clickData = [
  { name: 'Social Media', value: 400 },
  { name: 'Website', value: 300 },
  { name: 'Email', value: 300 },
  { name: 'Outros', value: 200 },
];
const COLORS = ['#ff69b4', '#8884d8', '#82ca9d', '#ffc658'];

const conversionData = [
  { name: 'Jan', conversões: 400 },
  { name: 'Fev', conversões: 300 },
  { name: 'Mar', conversões: 500 },
  { name: 'Abr', conversões: 200 },
  { name: 'Mai', conversões: 600 },
];

const AnalyticsCharts = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="my-12"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Análise de Dados</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Engajamento Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff69b4' }} />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" name="Visualizações" />
              <Bar dataKey="uv" fill="#ff69b4" name="Cliques" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Origem dos Cliques</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clickData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {clickData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff69b4' }}/>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Conversões Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <XAxis dataKey="name" stroke="#ffffff"/>
              <YAxis stroke="#ffffff"/>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff69b4' }}/>
              <Legend />
              <Line type="monotone" dataKey="conversões" stroke="#ff69b4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsCharts;