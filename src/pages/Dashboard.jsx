import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, QrCode, BarChart3, Loader2, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { qrCodes } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import URLForm from '@/components/URLForm';
import URLList from '@/components/URLList';
import MetricsCards from '@/components/MetricsCards';
import QRCodeModal from '@/components/QRCodeModal';
import WelcomeMessage from '@/components/WelcomeMessage';
import AnalyticsCharts from '@/components/AnalyticsCharts';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut, profile } = useAuth();

  const fetchUrls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await qrCodes.getAll();
      setUrls(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar URLs",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const addUrl = async (urlData) => {
    try {
      const data = await qrCodes.create(urlData);
      setUrls(currentUrls => [data, ...currentUrls]);
      setShowForm(false);
      toast({
        title: "URL cadastrada com sucesso!",
        description: "Agora você pode gerar o QR Code para esta URL.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar URL",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteUrl = async (id) => {
    try {
      await qrCodes.delete(id);
      setUrls(currentUrls => currentUrls.filter(url => url.id !== id));
      toast({
        title: "URL removida",
        description: "A URL foi removida com sucesso do dashboard.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover URL",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const totalUrls = urls.length;
  const avgClicksPerUrl = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold">
            Dashboard QRCode
          </h1>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <WelcomeMessage profile={profile} />

        <MetricsCards 
          totalUrls={totalUrls}
          totalClicks={totalClicks}
          avgClicksPerUrl={avgClicksPerUrl}
        />
        
        <AnalyticsCharts />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova URL
          </Button>
          
          <Link to="/reports">
            <Button
              variant="outline"
              className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 w-full"
              size="lg"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Relatórios
            </Button>
          </Link>
        </motion.div>

        {showForm && (
          <URLForm
            onSubmit={addUrl}
            onClose={() => setShowForm(false)}
          />
        )}

        {selectedQR && (
          <QRCodeModal
            url={selectedQR}
            onClose={() => setSelectedQR(null)}
          />
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 text-pink-400 animate-spin" />
          </div>
        ) : urls.length > 0 ? (
          <URLList
            urls={urls}
            onDelete={deleteUrl}
            onShowQR={setSelectedQR}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-16"
          >
            <QrCode className="h-24 w-24 text-pink-400 mx-auto mb-6 animate-pulse-slow" />
            <h3 className="text-2xl font-semibold text-gray-300 mb-4">
              Nenhuma URL cadastrada ainda
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Comece criando sua primeira URL e gere QR Codes incríveis para compartilhar!
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeira URL
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
