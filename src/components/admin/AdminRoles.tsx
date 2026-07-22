import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCog } from 'lucide-react';
import type { UserRole } from '@/hooks/useUserRole';

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administratör',
  editor: 'Redaktör',
  user: 'Användare',
};

const roleRank = (r: UserRole) => (r === 'admin' ? 3 : r === 'editor' ? 2 : 1);

export const AdminRoles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async (): Promise<UserRow[]> => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name'),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const roleByUser = new Map<string, UserRole>();
      for (const r of rolesRes.data ?? []) {
        const next = r.role as UserRole;
        const cur = roleByUser.get(r.user_id);
        if (!cur || roleRank(next) > roleRank(cur)) roleByUser.set(r.user_id, next);
      }

      return (profilesRes.data ?? [])
        .map((p) => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: roleByUser.get(p.id) ?? 'user',
        }))
        .sort((a, b) => (a.email ?? '').localeCompare(b.email ?? '', 'sv'));
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error: rpcError } = await supabase.rpc('set_user_role', {
        target_user: userId,
        new_role: role,
      });
      if (rpcError) throw rpcError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-user-roles'] });
      qc.invalidateQueries({ queryKey: ['user-role'] });
      toast({ title: 'Roll uppdaterad' });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Kunde inte ändra roll',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    },
  });

  const filtered = users.filter(
    (u) =>
      (u.email ?? '').toLowerCase().includes(filter.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(filter.toLowerCase()),
  );

  const badgeClass = (r: UserRole) =>
    r === 'admin'
      ? 'bg-purple-500/20 text-purple-200 border-purple-400/30'
      : r === 'editor'
      ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
      : 'bg-slate-500/20 text-slate-200 border-slate-400/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white">
        <UserCog className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Rollhantering</h2>
      </div>
      <p className="text-sm text-slate-300">
        Sätt roll per användare. <strong>Administratör</strong> har full åtkomst,{' '}
        <strong>Redaktör</strong> kan kurera innehåll (Fas B), <strong>Användare</strong> har
        endast läsning. Din egen roll kan inte ändras här.
      </p>

      <Input
        placeholder="Filtrera på e-post eller namn…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm bg-white/5 border-white/20 text-white placeholder:text-slate-400"
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Laddar användare…
        </div>
      ) : error ? (
        <div className="text-red-300">Kunde inte ladda användare: {(error as Error).message}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-2">E-post</th>
                <th className="px-4 py-2">Namn</th>
                <th className="px-4 py-2">Nuvarande roll</th>
                <th className="px-4 py-2">Ändra roll</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === user?.id;
                return (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="px-4 py-2">{u.email ?? '—'}</td>
                    <td className="px-4 py-2">{u.full_name ?? '—'}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={badgeClass(u.role)}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {isSelf ? (
                        <span className="text-xs text-slate-400">Din egen roll (låst)</span>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(role) =>
                            mutation.mutate({ userId: u.id, role: role as UserRole })
                          }
                          disabled={mutation.isPending}
                        >
                          <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
                            <SelectItem value="editor">{ROLE_LABELS.editor}</SelectItem>
                            <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Inga användare matchar filtret.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
