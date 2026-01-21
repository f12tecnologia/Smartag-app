import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { qrCodes } from '@/lib/api';

const RedirectPage = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!id) {
        setError("ID do QR Code inválido.");
        return;
      }

      try {
        const data = await qrCodes.getRedirect(id);
        
        if (!data || !data.url) {
          throw new Error("O QR Code que você escaneou não é válido ou foi removido.");
        }
        
        window.location.href = data.url;

      } catch (err) {
        console.error("Redirect error:", err);
        setError(err.message);
      }
    };

    fetchAndRedirect();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-lg border border-red-500/50"
        >
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Erro no QR Code
          </h1>
          <p className="text-gray-300">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </motion.div>
        
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Redirecionando...
        </h1>
        <p className="text-gray-400">
          Por favor, aguarde um momento.
        </p>
      </motion.div>
    </div>
  );
};

export default RedirectPage;
