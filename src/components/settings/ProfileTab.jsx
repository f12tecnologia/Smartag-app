import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ShieldCheck } from 'lucide-react';

const ProfileTab = () => {
  const { user, profile, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date() })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "❌ Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Perfil atualizado com sucesso!",
      });
      await fetchUserProfile(user);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Meu Perfil</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <div className="flex items-center gap-3">
            <p className="text-lg text-gray-200">{user?.email}</p>
            {profile?.role === 'admin' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/50">
                <ShieldCheck className="h-4 w-4" />
                Administrador
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-400 mb-2">
            Nome Completo
          </label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" onClick={() => toast({ title: "🚧 Em breve!", description: "A troca de senha estará disponível em futuras atualizações." })}>
            Alterar Senha
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;