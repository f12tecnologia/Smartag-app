import React from 'react';
import { motion } from 'framer-motion';
import { Link, MousePointer, TrendingUp, BarChart3 } from 'lucide-react';

const MetricsCards = ({ totalUrls, totalClicks, avgClicksPerUrl }) => {
  const metrics = [
    {
      title: 'Total de URLs',
      value: totalUrls,
      icon: Link,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Total de Cliques',
      value: totalClicks,
      icon: MousePointer,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Média por URL',
      value: avgClicksPerUrl,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Taxa de Conversão',
      value: totalUrls > 0 ? `${((totalClicks / totalUrls) * 10).toFixed(1)}%` : '0%',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`metric-card ${metric.bgColor} ${metric.borderColor} border`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                className="text-right"
              >
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
              </motion.div>
            </div>
            
            <h3 className="text-gray-300 font-medium">
              {metric.title}
            </h3>
            
            <div className="mt-3 flex items-center text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${metric.color} mr-2`} />
              Atualizado agora
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MetricsCards;