import { useUserRole } from '@/hooks/useUserRole';

/**
 * Bakåtkompatibel wrapper. Rollogiken bor i useUserRole (enda källan).
 * Behåll signaturen { isAdmin, isLoading } för befintliga anropsställen.
 */
export const useIsAdmin = () => {
  const { isAdmin, loading } = useUserRole();
  return { isAdmin, isLoading: loading };
};
