import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

const QRCodeModal = ({ url, onClose }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      const redirectUrl = `${window.location.origin}/redirect/${url.id}`;
      
      const qrCodeUrl = await QRCode.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrCodeUrl);

      const svgString = await QRCode.toString(redirectUrl, { 
        type: 'svg',
        color: {
          dark: '#000000',
          light: '#00000000' // Transparent background
        }
      });
      setQrCodeSvg(svgString);

    } catch (error) {
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const downloadQRCode = (format) => {
    const link = document.createElement('a');
    const fileName = `qrcode-${url.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    
    if(format === 'svg') {
      const svgBlob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(svgBlob);
      link.download = `${fileName}.svg`;
    } else {
      link.href = qrCodeDataUrl;
      link.download = `${fileName}.png`;
    }
    
    link.click();
    
    toast({
      title: "📥 QR Code baixado!",
      description: `O arquivo ${format.toUpperCase()} foi salvo na sua pasta de downloads.`,
    });
  };

  const copyQRLink = () => {
    const redirectUrl = `${window.location.origin}/redirect/${url.id}`;
    navigator.clipboard.writeText(redirectUrl);
    
    toast({
      title: "📋 Link copiado!",
      description: "O link do QR Code foi copiado para a área de transferência.",
    });
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${url.title}`,
          text: `Escaneie este QR Code para acessar: ${url.title}`,
          url: `${window.location.origin}/redirect/${url.id}`
        });
      } catch (error) {
        copyQRLink();
      }
    } else {
      copyQRLink();
    }
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
        className="glass-effect rounded-2xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            QR Code
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

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {url.title}
          </h3>
          {url.description && (
            <p className="text-sm text-gray-400">
              {url.description}
            </p>
          )}
        </div>

        <div className="flex justify-center mb-6">
          {isGenerating ? (
            <div className="qr-container flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="qr-container"
            >
              <img
                src={qrCodeDataUrl}
                alt={`QR Code para ${url.title}`}
                className="w-full h-auto"
              />
            </motion.div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => downloadQRCode('png')}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar PNG
            </Button>
             <Button
              onClick={() => downloadQRCode('svg')}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar SVG
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={copyQRLink}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            
            <Button
              variant="outline"
              onClick={shareQRCode}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-xs text-blue-400 text-center">
            💡 Escaneie este QR Code para ser redirecionado automaticamente para a URL configurada
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeModal;