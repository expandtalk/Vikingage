import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, type UserRole } from '@/hooks/useUserRole';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RequireRoleProps {
  /** Roller som får åtkomst. T.ex. ['admin'] eller ['admin','editor']. */
  roles: UserRole[];
  children: React.ReactNode;
}

/**
 * Central route-grind. Skyddet är kosmetiskt (RLS är den riktiga gränsen) men
 * gör att inga admin-/editor-sidor kan glömma sin gate. Ersätter per-sida-kontroller.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !roles.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">Åtkomst nekad</h1>
              <p className="text-slate-300 mb-6">
                Du har inte behörighet att se den här sidan.
              </p>
              <div className="space-y-3">
                <Link to="/">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tillbaka till startsidan
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                      Logga in
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return <>{children}</>;
};
