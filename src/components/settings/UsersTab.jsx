import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Mail, Edit, Trash2, PlusCircle } from 'lucide-react';
import EditUserDialog from './EditUserDialog';
import CreateUserDialog from './CreateUserDialog';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const { toast } = useToast();
  const { profile, user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_users');
    if (error) {
      toast({
        title: "❌ Erro ao buscar usuários",
        description: "Você não tem permissão para ver os usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
    }
  }, [fetchUsers, profile]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: JSON.stringify({
          action: 'inviteUser',
          payload: { inviteEmail },
        }),
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      toast({ title: "✅ Convite enviado!", description: `Um convite foi enviado para ${inviteEmail}.` });
      setInviteEmail('');
      fetchUsers();
    } catch (err) {
      toast({ title: "❌ Erro ao convidar usuário", description: err.message, variant: "destructive" });
    }
    setIsInviting(false);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (currentUser.id === userId) {
      toast({ title: "Ação não permitida", description: "Você não pode remover a si mesmo.", variant: "destructive" });
      return;
    }
    if (window.confirm(`Tem certeza que deseja remover o usuário ${userEmail}? Esta ação não pode ser desfeita.`)) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-users', {
          body: JSON.stringify({
            action: 'deleteUser',
            payload: { userId },
          }),
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        toast({ title: "🗑️ Usuário removido com sucesso", description: `${userEmail} foi removido do sistema.` });
        fetchUsers();
      } catch (err) {
        toast({ title: "❌ Erro ao remover usuário", description: err.message, variant: "destructive" });
      }
    }
  };

  const openEditDialog = (user) => {
    if (currentUser.id === user.id) {
      toast({ title: "Ação não permitida", description: "Você não pode editar sua própria função aqui. Peça a outro administrador." });
      return;
    }
    setEditingUser(user);
  };

  if (profile?.role !== 'admin') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Gerenciamento de Usuários</h2>
        <p className="text-gray-400">Você não tem permissão para gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Gerenciamento de Usuários</h2>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleInvite} className="flex-grow flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-400 mb-2">Convidar novo usuário por email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input id="invite-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full pl-10 pr-4 py-2 bg-black/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" required />
            </div>
          </div>
          <Button type="submit" disabled={isInviting} className="bg-gradient-to-r from-blue-500 to-purple-600 w-full sm:w-auto">
            {isInviting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
            <span className="ml-2 hidden sm:inline">Convidar</span>
          </Button>
        </form>
        <div className="flex flex-col justify-end">
           <Button onClick={() => setIsCreateUserOpen(true)} variant="outline" className="w-full sm:w-auto">
            <PlusCircle className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Criar Usuário</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 text-purple-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors gap-2">
              <div>
                <p className="font-medium text-gray-200">{u.full_name || u.email}</p>
                 <p className="text-sm text-gray-400">{u.full_name ? u.email : ''}</p>
                <p className="text-xs text-gray-400 mt-1">Função: <span className={`font-semibold ${u.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>{u.role || 'user'}</span></p>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(u)}><Edit className="h-4 w-4" /><span className="ml-2 hidden sm:inline">Editar</span></Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id, u.email)}><Trash2 className="h-4 w-4" /><span className="ml-2 hidden sm:inline">Remover</span></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingUser && <EditUserDialog user={editingUser} open={!!editingUser} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)} onUserUpdate={() => { setEditingUser(null); fetchUsers(); }} />}
      <CreateUserDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen} onUserCreated={fetchUsers} />
    </div>
  );
};

export default UsersTab;