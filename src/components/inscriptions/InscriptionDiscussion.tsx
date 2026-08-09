import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessagesSquare, Send, ShieldCheck, LogIn } from 'lucide-react';

// Modererad diskussion/bidrag per inskrift. Källkritik: bidrag publiceras ALDRIG ogranskat — anon
// postar via post_discussion-RPC (tvingar status='pending'); bara 'approved' hämtas hit (RLS).
interface Post { display_name: string | null; body: string; created_at: string; }

export const InscriptionDiscussion: React.FC<{ signum: string }> = ({ signum }) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ['discussion', signum],
    queryFn: async () => {
      const { data } = await (supabase as any).from('discussion_posts')
        .select('display_name, body, created_at')
        .eq('entity_type', 'inscription').eq('entity_key', signum).eq('status', 'approved')
        .order('created_at', { ascending: true });
      return (data ?? []) as Post[];
    },
  });

  const submit = async () => {
    if (body.trim().length < 3 || busy) return;
    setBusy(true);
    await (supabase as any).rpc('post_discussion', {
      p_entity_type: 'inscription', p_entity_key: signum, p_body: body, p_display_name: name || null,
    });
    setBody(''); setName(''); setSent(true); setBusy(false);
  };

  return (
    <section className="viking-card rounded-lg border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <MessagesSquare className="h-5 w-5 text-gold" />{en ? 'Discussion' : 'Diskutera'}
      </h2>
      <p className="mb-4 flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" />
        {en
          ? 'Questions, observations and sources about this stone. Contributions are reviewed before publishing — nothing appears as fact unchecked.'
          : 'Frågor, observationer och källor om den här stenen. Bidrag granskas innan publicering — inget visas som fakta ogranskat.'}
      </p>

      {(posts?.length ?? 0) > 0 && (
        <ul className="mb-5 space-y-3">
          {posts!.map((p, i) => (
            <li key={i} className="rounded-md border border-border/70 bg-card/50 p-3">
              <div className="mb-1 text-[11px] text-muted-foreground/80">
                {p.display_name || (en ? 'Anonymous' : 'Anonym')} · <span className="tabular-nums">{(p.created_at || '').slice(0, 10)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
      )}

      {!user ? (
        <div className="rounded-md border border-border bg-card/50 px-4 py-3">
          <p className="mb-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
            {en ? 'Log in to contribute a question, observation or source.' : 'Logga in för att bidra med en fråga, observation eller källa.'}
          </p>
          <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gold/20">
            <LogIn className="h-3.5 w-3.5" />{en ? 'Log in / sign up' : 'Logga in / skapa konto'}
          </Link>
        </div>
      ) : sent ? (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-foreground">
          {en ? 'Thank you — your contribution has been sent for review.' : 'Tack — ditt bidrag har skickats för granskning.'}
        </p>
      ) : (
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
            placeholder={en ? 'Name (optional)' : 'Namn (frivilligt)'}
            className="w-full rounded-md border border-border bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-gold" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={4000}
            placeholder={en ? 'Your question, observation or source…' : 'Din fråga, observation eller källa…'}
            className="w-full rounded-md border border-border bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-gold" />
          <button type="button" onClick={submit} disabled={busy || body.trim().length < 3}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gold/20 disabled:opacity-40">
            <Send className="h-3.5 w-3.5" />{en ? 'Submit for review' : 'Skicka för granskning'}
          </button>
        </div>
      )}
    </section>
  );
};
