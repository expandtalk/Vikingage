import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'editor' | 'user';

/**
 * Enda sanningskällan för användarens roll i frontend (RLS är den riktiga gränsen).
 * En användare kan ha flera roll-rader; vi väljer den högsta (admin > editor > user).
 * useAuth.useIsAdmin delegerar hit — ändra rollogik på ETT ställe.
 */
export const useUserRole = () => {
  const { user } = useAuth();

  const { data: role = 'user', isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UserRole> => {
      if (!user) return 'user';
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      const roles = (data ?? []).map((r) => r.role as UserRole);
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('editor')) return 'editor';
      return 'user';
    },
  });

  const effectiveRole: UserRole = user ? (role as UserRole) : 'user';
  const loading = !!user && isLoading;

  return {
    role: effectiveRole,
    isAdmin: effectiveRole === 'admin',
    isEditor: effectiveRole === 'editor',
    canEdit: effectiveRole === 'admin' || effectiveRole === 'editor',
    loading,
  };
};
