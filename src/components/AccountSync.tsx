import { useAccountSync } from '@/hooks/useAccountSync';

// Osynlig montering av kontosynken — måste ligga under AuthProvider. Renderar inget.
export const AccountSync = () => {
  useAccountSync();
  return null;
};
