import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save } from 'lucide-react';

const EditUserDialog = ({ user, open, onOpenChange, onUserUpdate }) => {
  const [role, setRole] = useState(user?.role || 'user');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.rpc('set_user_role', {
      target_user_id: user.id,
      new_role: role,
    });
    if (error) {
      toast({
        title: "❌ Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Usuário atualizado!",
        description: `A função de ${user.email} foi alterada para ${role}.`,
      });
      onUserUpdate();
      onOpenChange(false);
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-effect border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Alterar a função do usuário {user?.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right text-gray-400">Email</label>
            <p id="email" className="col-span-3 text-gray-200">{user?.email}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right text-gray-400">Função</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="col-span-3 w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-md text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;