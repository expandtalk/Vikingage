import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Save, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// "Mina forskningsområden" — inloggad användare skapar och kurerar sina egna områden. Ägarskap =
// KURATOR (beskrivning + trådmoderering), aldrig kanon: faktapåståenden går via staging → verifierare.
// Använder research_areas (RLS: alla får skapa → blir ägare; ägare/steward redigerar).

interface Area {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
}

const slugify = (s: string): string =>
  s.toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[éè]/g, 'e').replace(/ü/g, 'u')
    .replace(/ø/g, 'o').replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

export const MyResearchAreas: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [saving, setSaving] = useState<string | null>(null); // id som sparas, eller 'new'
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchAreas = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('research_areas')
      .select('id, slug, title, description, status')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Fel', description: 'Kunde inte hämta dina områden.', variant: 'destructive' });
    } else {
      setAreas((data ?? []) as Area[]);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAreas(); /* eslint-disable-next-line */ }, [user]);

  const createArea = async () => {
    if (!user) return;
    const title = newTitle.trim();
    if (!title) { toast({ title: 'Titel krävs', variant: 'destructive' }); return; }
    const slug = slugify(title);
    if (!slug) { toast({ title: 'Titeln ger ingen giltig URL', variant: 'destructive' }); return; }
    setSaving('new');
    const { error } = await (supabase as any).from('research_areas').insert({
      title, slug, description: newDesc.trim() || null,
      owner_id: user.id, created_by: user.id,
    });
    setSaving(null);
    if (error) {
      const dup = error.code === '23505' || /duplicate|unique/i.test(error.message ?? '');
      toast({
        title: dup ? 'Slug upptagen' : 'Kunde inte skapa',
        description: dup ? `"${slug}" finns redan — välj en annan titel.` : error.message,
        variant: 'destructive',
      });
      return;
    }
    setNewTitle(''); setNewDesc('');
    toast({ title: 'Område skapat', description: `Du är nu kurator för "${title}".` });
    fetchAreas();
  };

  const saveArea = async (a: Area) => {
    setSaving(a.id);
    const { error } = await (supabase as any).from('research_areas')
      .update({ title: a.title.trim(), description: a.description?.trim() || null })
      .eq('id', a.id);
    setSaving(null);
    if (error) { toast({ title: 'Kunde inte spara', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Sparat' });
  };

  const patch = (id: string, field: keyof Area, value: string) =>
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderOpen className="h-5 w-5" /> Mina forskningsområden
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Områden du är kurator för. Du styr beskrivning och diskussion — men faktapåståenden prövas
          alltid källkritiskt (staging → verifierare) innan de blir kanon.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-300 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Hämtar…</div>
      ) : (
        <>
          {areas.length === 0 && (
            <p className="text-sm text-slate-400">Du har inga områden än. Skapa ett nedan.</p>
          )}
          {areas.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/15 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-amber-300">/omraden/{a.slug}</code>
                <span className="text-[11px] text-slate-400">{a.status}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Titel</Label>
                <Input value={a.title} onChange={(e) => patch(a.id, 'title', e.target.value)}
                  className="bg-white/10 border-white/20 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Beskrivning</Label>
                <Textarea value={a.description ?? ''} onChange={(e) => patch(a.id, 'description', e.target.value)}
                  className="bg-white/10 border-white/20 text-white" rows={3}
                  placeholder="Vad området handlar om…" />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => saveArea(a)} disabled={saving === a.id}
                  className="bg-purple-600 hover:bg-purple-700">
                  {saving === a.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Spara
                </Button>
              </div>
            </div>
          ))}

          {/* Skapa nytt */}
          <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.03] p-4 space-y-3">
            <Label className="text-white text-sm">Skapa nytt område</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="bg-white/10 border-white/20 text-white" placeholder="Titel (t.ex. Ölands järnålder)" />
            {newTitle.trim() && (
              <p className="text-[11px] text-slate-400">URL: <code className="text-amber-300">/omraden/{slugify(newTitle)}</code></p>
            )}
            <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              className="bg-white/10 border-white/20 text-white" rows={2} placeholder="Kort beskrivning (valfritt)" />
            <div className="flex justify-end">
              <Button size="sm" onClick={createArea} disabled={saving === 'new'}
                className="bg-purple-600 hover:bg-purple-700">
                {saving === 'new' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Skapa
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyResearchAreas;
