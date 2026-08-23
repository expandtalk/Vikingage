import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Flag, CornerDownRight, Send, ShieldAlert, Sparkles } from 'lucide-react';

// Öppet samtalslager — entitetsförankrade, PLATTA trådar (ett svarssteg). Renderas MEDVETET som
// "diskussion", visuellt skilt från belagda fakta: gissning/åsikt/sägen är tillåtet här, men får
// aldrig läsas som plattformsfakta. Konto krävs för att posta; läsning är öppen. Bryggan "föreslå
// till grafen" skickar innehåll till staging (place_suggestions), aldrig direkt till kanon.

interface Post {
  id: string;
  parent_id: string | null;
  display_name: string | null;
  body: string;
  status: string;
  created_at: string;
}

const CONSENT_KEY = 'ugc_consent_v1';

const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ''; }
};

export const DiscussionThread: React.FC<{ entityType: string; entityKey: string; heading?: string }> = ({
  entityType, entityKey, heading,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');
  const [newThread, setNewThread] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [consented, setConsented] = useState<boolean>(() => {
    try { return localStorage.getItem(CONSENT_KEY) === '1'; } catch { return false; }
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('discussion_posts')
      .select('id, parent_id, display_name, body, status, created_at')
      .eq('entity_type', entityType).eq('entity_key', entityKey)
      .order('created_at', { ascending: true });
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  }, [entityType, entityKey]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Visningsnamn för nya poster (forskarprofil → e-post-prefix).
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).from('researcher_profiles')
        .select('display_name').eq('user_id', user.id).maybeSingle();
      setDisplayName(data?.display_name || (user.email?.split('@')[0] ?? 'Användare'));
    })();
  }, [user]);

  const giveConsent = () => { try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* private mode */ } setConsented(true); };

  const post = async (body: string, parentId: string | null) => {
    if (!user) return;
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    const { error } = await (supabase as any).from('discussion_posts').insert({
      entity_type: entityType, entity_key: entityKey, user_id: user.id,
      parent_id: parentId, display_name: displayName, body: text, status: 'published',
    });
    setBusy(false);
    if (error) { toast({ title: 'Kunde inte posta', description: error.message, variant: 'destructive' }); return; }
    if (parentId) { setReplyBody(''); setReplyTo(null); } else setNewThread('');
    fetchPosts();
  };

  const flag = async (postId: string) => {
    if (!user) return;
    const { error } = await (supabase as any).from('discussion_post_flags')
      .insert({ post_id: postId, user_id: user.id });
    if (error && !/duplicate|unique/i.test(error.message)) {
      toast({ title: 'Kunde inte flagga', description: error.message, variant: 'destructive' }); return;
    }
    toast({ title: 'Rapporterad', description: 'Tack — en moderator tittar på inlägget.' });
  };

  // Bryggan: föreslå trådens innehåll till grafen → staging (place_suggestions, status 'pending').
  // Aldrig direkt kanon; en verifierare/människa prövar. Källkritik sker där, inte här.
  const proposeToGraph = async (p: Post) => {
    if (!user) return;
    setBusy(true);
    const { error } = await (supabase as any).from('place_suggestions').insert({
      name: (p.body.slice(0, 80) || 'Förslag ur diskussion'),
      note: p.body,
      // documentation är NOT NULL — bär proveniens (vem/varifrån) så förslaget är spårbart i kön.
      documentation: `Föreslaget ur diskussion (${entityType}:${entityKey}) av ${p.display_name || 'användare'}.`,
      query_context: `discussion:${entityType}:${entityKey}`,
    });
    setBusy(false);
    if (error) { toast({ title: 'Kunde inte föreslå', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Föreslaget till grafen', description: 'Landar som förslag — prövas källkritiskt innan det blir fakta.' });
  };

  const threads = posts.filter((p) => !p.parent_id);
  const repliesOf = (id: string) => posts.filter((p) => p.parent_id === id);

  const PostBody: React.FC<{ p: Post; isReply?: boolean }> = ({ p, isReply }) => (
    <div className={isReply ? 'pl-5 border-l border-white/10' : ''}>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-medium text-slate-200">{p.display_name || 'Anonym'}</span>
        <span>· {fmtDate(p.created_at)}</span>
        {p.status === 'flagged' && <span className="text-amber-400">· granskas</span>}
      </div>
      <p className="text-sm text-slate-200 whitespace-pre-wrap mt-0.5">{p.body}</p>
      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
        {user && !isReply && (
          <button onClick={() => setReplyTo(replyTo === p.id ? null : p.id)} className="inline-flex items-center gap-1 hover:text-slate-200">
            <CornerDownRight className="h-3 w-3" /> Svara
          </button>
        )}
        {user && (
          <button onClick={() => flag(p.id)} className="inline-flex items-center gap-1 hover:text-amber-300">
            <Flag className="h-3 w-3" /> Rapportera
          </button>
        )}
        {user && !isReply && (
          <button onClick={() => proposeToGraph(p)} disabled={busy} className="inline-flex items-center gap-1 hover:text-emerald-300">
            <Sparkles className="h-3 w-3" /> Föreslå till grafen
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="viking-card rounded-lg border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gold" /> {heading ?? 'Diskussion'}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Öppet samtal — frågor, tolkningar och lokal kännedom välkomna. Det här är <strong>inte</strong> verifierade
        fakta; belagda uppgifter finns i sidans faktadelar. Var vänlig och saklig.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Hämtar…</div>
      ) : (
        <div className="space-y-5">
          {threads.length === 0 && <p className="text-sm text-muted-foreground">Ingen diskussion än. Var först att skriva!</p>}
          {threads.map((t) => (
            <div key={t.id} className="space-y-2">
              <PostBody p={t} />
              {repliesOf(t.id).map((r) => <PostBody key={r.id} p={r} isReply />)}
              {user && replyTo === t.id && (
                <div className="pl-5 space-y-2">
                  <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={2}
                    className="bg-white/10 border-white/20 text-white" placeholder="Ditt svar…" />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={busy} onClick={() => post(replyBody, t.id)} className="bg-gold/90 text-black hover:bg-gold">
                      <Send className="h-3.5 w-3.5 mr-1" /> Svara
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ny tråd */}
          <div className="pt-3 border-t border-border/50">
            {!user ? (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-gold hover:underline">Logga in</Link> för att delta i diskussionen.
              </p>
            ) : !consented ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-slate-200">
                <p className="flex items-center gap-2 font-medium"><ShieldAlert className="h-4 w-4 text-amber-400" /> Innan du deltar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ditt visningsnamn och inlägg blir offentliga. Skriv inte känsliga personuppgifter om nu levande
                  personer. Se <Link to="/privacy" className="text-gold hover:underline">integritetspolicyn</Link>.
                </p>
                <Button size="sm" className="mt-2 bg-gold/90 text-black hover:bg-gold" onClick={giveConsent}>Jag förstår — fortsätt</Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea value={newThread} onChange={(e) => setNewThread(e.target.value)} rows={3}
                  className="bg-white/10 border-white/20 text-white" placeholder="Starta en ny tråd…" />
                <div className="flex justify-end">
                  <Button size="sm" disabled={busy} onClick={() => post(newThread, null)} className="bg-gold/90 text-black hover:bg-gold">
                    {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />} Posta
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DiscussionThread;
