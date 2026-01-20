import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, ExternalLink, Trash2, Eye, Calendar, MousePointer, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const URLList = ({ urls, onDelete, onShowQR }) => {
  const { toast } = useToast();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: "URL copiada para a área de transferência.",
    });
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-center mb-8 gradient-text">
        Suas URLs
      </h2>
      
      {urls.map((url, index) => (
        <motion.div
          key={url.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="url-card"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {url.title}
                </h3>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Ativo
                </span>
              </div>
              
              {url.description && (
                <p className="text-gray-400 text-sm mt-2">
                  {url.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(url.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="h-3 w-3" />
                  {url.clicks} cliques
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowQR(url)}
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <QrCode className="h-4 w-4 mr-1" />
                QR Code
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url.url, '_blank')}
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Abrir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(url.url)}
                className="border-gray-500 text-gray-400 hover:bg-gray-600 hover:text-white"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta URL?')) {
                    onDelete(url.id);
                  }
                }}
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Engajamento</span>
              <span>{url.clicks} cliques</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((url.clicks / 100) * 100, 100)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default URLList;