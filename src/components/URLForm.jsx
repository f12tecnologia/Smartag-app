import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Link, FileText, Save, Copy, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { normalizeSlugInput, validateSlugClient, buildShortLink } from '@/lib/shortLink';

const URLForm = ({ onSubmit, onClose, initialData = null, mode = 'create' }) => {
  const isEdit = mode === 'edit' && initialData;
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    shortId: initialData?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const originalShortId = initialData?.id || '';
  const normalizedShortId = normalizeSlugInput(formData.shortId);
  const slugChanged =
    isEdit && normalizedShortId && normalizedShortId !== originalShortId.toLowerCase();

  const previewShortLink = useMemo(() => {
    if (!normalizedShortId) return null;
    return buildShortLink(normalizedShortId);
  }, [normalizedShortId]);

  const copyShortLink = () => {
    if (!previewShortLink) return;
    navigator.clipboard.writeText(previewShortLink);
    toast({
      title: 'Link copiado',
      description: 'O link curto do QR foi copiado.',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o título e a URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(formData.url);
    } catch {
      toast({
        title: 'URL inválida',
        description: 'Por favor, insira uma URL válida (ex: https://exemplo.com).',
        variant: 'destructive',
      });
      return;
    }

    if (normalizedShortId) {
      const slugCheck = validateSlugClient(normalizedShortId);
      if (!slugCheck.ok) {
        toast({
          title: 'Identificador inválido',
          description: slugCheck.error,
          variant: 'destructive',
        });
        return;
      }
    } else if (isEdit) {
      toast({
        title: 'Identificador obrigatório',
        description: 'Informe o identificador do link curto.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        shortId: normalizedShortId || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleShortIdChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData((prev) => ({ ...prev, shortId: value }));
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
        className="glass-effect rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {isEdit ? 'Editar URL' : 'Nova URL'}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Hash className="inline h-4 w-4 mr-1" />
              Identificador do link curto
              {!isEdit && (
                <span className="text-gray-500 font-normal"> (opcional)</span>
              )}
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-600 focus-within:border-purple-400">
              <span className="px-3 py-3 bg-black/50 text-gray-400 text-xs sm:text-sm whitespace-nowrap border-r border-gray-600">
                {window.location.origin}/redirect/
              </span>
              <input
                type="text"
                name="shortId"
                value={formData.shortId}
                onChange={handleShortIdChange}
                placeholder={isEdit ? 'promo-foz' : 'promo-foz (ou vazio = automático)'}
                className="flex-1 min-w-0 px-3 py-3 bg-black/30 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            {!isEdit && !normalizedShortId && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para gerar um identificador automático.
              </p>
            )}
            {previewShortLink && (
              <div className="flex gap-2 mt-2">
                <p className="text-xs text-gray-400 truncate flex-1">{previewShortLink}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyShortLink}
                  className="shrink-0 h-7 text-gray-400"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>
            )}
          </div>

          {isEdit && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-300">
                {slugChanged
                  ? 'QR codes já impressos com o link antigo deixarão de funcionar. Gere um novo QR após salvar.'
                  : 'Alterar a URL de destino não exige novo QR. O link curto permanece o mesmo.'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Meu Site Pessoal"
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Link className="inline h-4 w-4 mr-1" />
              {isEdit ? 'URL de destino *' : 'URL *'}
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://exemplo.com"
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição da URL..."
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? 'Salvar alterações' : 'Salvar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default URLForm;
