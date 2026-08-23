import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

// "Följ"-knapp → user_interests. Låter en person markera intresse för ett begrepp/tema/plats så att
// liksinnade kan hittas (Fas 3-matchning). Default visibility 'aggregate'. Visas bara för inloggade.
const sb = supabase as unknown as { from: (t: string) => any };

export const InterestButton: React.FC<{ entityType: string; entityId: string; label?: string }> = ({ entityType, entityId, label }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState<string | false>(false); // interest-id om följd, annars false

  useEffect(() => {
    if (!user) { setFollowing(false); return; }
    let alive = true;
    (async () => {
      const { data } = await sb.from('user_interests').select('id')
        .eq('user_id', user.id).eq('entity_type', entityType).eq('entity_id', entityId).maybeSingle();
      if (alive) setFollowing(data?.id ?? false);
    })();
    return () => { alive = false; };
  }, [user, entityType, entityId]);

  if (!user) return null;

  const toggle = async () => {
    if (following) {
      await sb.from('user_interests').delete().eq('id', following);
      setFollowing(false);
    } else {
      const { data, error } = await sb.from('user_interests')
        .insert({ user_id: user.id, entity_type: entityType, entity_id: entityId, visibility: 'aggregate' })
        .select('id').single();
      if (error) { toast({ title: 'Kunde inte följa', description: error.message, variant: 'destructive' }); return; }
      setFollowing(data.id);
      toast({ title: 'Följer', description: 'Du kan hitta liksinnade via dina intressen.' });
    }
  };

  return (
    <button onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${following ? 'border-gold bg-gold/15 text-amber-100' : 'border-border text-foreground hover:border-gold/50'}`}>
      <Star className={`h-4 w-4 ${following ? 'fill-amber-300 text-amber-300' : ''}`} />
      {following ? (label ? `Följer ${label}` : 'Följer') : (label ? `Följ ${label}` : 'Följ')}
    </button>
  );
};

export default InterestButton;
