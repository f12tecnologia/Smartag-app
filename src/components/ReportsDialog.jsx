import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, BarChart2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const reportOptions = [
  {
    type: "Visitas",
    description: "Relatório detalhado de visitas às URLs.",
    icon: FileText,
    fields: ["data", "hora", "URL", "número_de_visitas"]
  },
  {
    type: "Clicks",
    description: "Análise do total de cliques em links particulares.",
    icon: BarChart2,
    fields: ["data", "URL", "número_de_cliques"]
  },
  {
    type: "Origem do Tráfego",
    description: "Identifica a origem dos acessos às URLs.",
    icon: Map,
    fields: ["data", "URL", "origem_do_tráfego"]
  }
];

const ReportsDialog = ({ onClose }) => {
  const { toast } = useToast();

  const handleGenerateReport = (type) => {
    toast({
      title: `📊 Gerando relatório de ${type}...`,
      description: "Seu relatório estará pronto em breve.",
    });

    setTimeout(() => {
      toast({
        title: `✅ Relatório de ${type} gerado!`,
        description: "O download começaria agora (funcionalidade simulada).",
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-effect rounded-2xl p-8 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            Gerar Relatórios
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {reportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 border border-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20"
              >
                <div className="flex items-start gap-4">
                  <Icon className="h-8 w-8 text-pink-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg text-white">{option.type}</h3>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleGenerateReport(option.type)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full sm:w-auto"
                >
                  Gerar
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportsDialog;