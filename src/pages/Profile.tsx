
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MyResearchAreas } from '@/components/profile/MyResearchAreas';
import { MapPreferences } from '@/components/profile/MapPreferences';
import { MyPlaceTies } from '@/components/profile/MyPlaceTies';
import { MyConnections } from '@/components/social/MyConnections';

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

// Klientkomprimering av avatar (Canvas — ingen extern lib, CSP-säker). Kvadratisk crop, max 400px, JPEG.
async function compressAvatar(file: File, size = 400, quality = 0.85): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob null'))), 'image/jpeg', quality));
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface ResearcherProfile {
  handle: string;
  avatar_url: string;
  display_name: string;
  institution: string;
  field_of_expertise: string;
  credentials: string;
  bio: string;
  website_url: string;
  orcid_id: string;
  linkedin: string;
  x: string;
  academia: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [researcherProfile, setResearcherProfile] = useState<ResearcherProfile>({
    handle: '',
    avatar_url: '',
    display_name: '',
    institution: '',
    field_of_expertise: '',
    credentials: '',
    bio: '',
    website_url: '',
    orcid_id: '',
    linkedin: '',
    x: '',
    academia: ''
  });
  // Adress lagras separat i researcher_private (owner-only RLS) — aldrig i publikt läsbara profiles.
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch researcher profile
      const { data: researcherData, error: researcherError } = await supabase
        .from('researcher_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (researcherError && researcherError.code !== 'PGRST116') {
        throw researcherError;
      }

      if (researcherData) {
        const social = ((researcherData as any).social_links ?? {}) as Record<string, string>;
        setResearcherProfile({
          handle: (researcherData as any).handle || '',
          avatar_url: (researcherData as any).avatar_url || '',
          display_name: researcherData.display_name || '',
          institution: researcherData.institution || '',
          field_of_expertise: researcherData.field_of_expertise || '',
          credentials: researcherData.credentials || '',
          bio: researcherData.bio || '',
          website_url: researcherData.website_url || '',
          orcid_id: researcherData.orcid_id || '',
          linkedin: social.linkedin || '',
          x: social.x || '',
          academia: social.academia || ''
        });
      }

      // Privat adress (egen tabell, owner-only)
      const { data: privateData } = await (supabase as any)
        .from('researcher_private')
        .select('address')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (privateData?.address) setAddress(privateData.address);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta profildata",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || ''
        });

      if (profileError) throw profileError;

      // Normalisera handle till URL-säker slug (a–z, 0–9, bindestreck)
      const handle = researcherProfile.handle
        .trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Update researcher profile (publika fält + social_links). Adress lagras EJ här.
      const { handle: _h, linkedin, x, academia, ...rp } = researcherProfile;
      const { error: researcherError } = await (supabase as any)
        .from('researcher_profiles')
        .upsert({
          user_id: user.id,
          ...rp,
          handle: handle || null,
          social_links: { linkedin: linkedin.trim(), x: x.trim(), academia: academia.trim() },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (researcherError) throw researcherError;

      // Privat adress → egen tabell (owner-only RLS)
      const { error: privateError } = await (supabase as any)
        .from('researcher_private')
        .upsert({ user_id: user.id, address: address.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (privateError) throw privateError;

      if (handle && handle !== researcherProfile.handle) {
        setResearcherProfile(prev => ({ ...prev, handle }));
      }

      toast({
        title: "Profil sparad",
        description: "Din profil har uppdaterats"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara profilen",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // tillåt re-val av samma fil
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Fel filtyp', description: 'Välj en bildfil.', variant: 'destructive' });
      return;
    }
    setUploadingAvatar(true);
    try {
      const blob = await compressAvatar(file);
      // Publik bucket (avatar är inte PII). Egen mapp per användare; upsert skriver över.
      const path = `avatars/${user.id}.jpg`;
      const { error: upErr } = await supabase.storage.from('media-images')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('media-images').getPublicUrl(path);
      const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust så nya bilden syns direkt
      setResearcherProfile((prev) => ({ ...prev, avatar_url: url }));
      // Persistera direkt så avataren finns kvar även utan "Spara profil".
      await (supabase as any).from('researcher_profiles')
        .upsert({ user_id: user.id, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      toast({ title: 'Bild uppladdad', description: 'Din profilbild har uppdaterats.' });
    } catch (err: any) {
      toast({ title: 'Uppladdning misslyckades', description: err?.message ?? 'Försök igen.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Åtkomst nekad</h1>
              <p className="text-slate-300 mb-6">Du måste vara inloggad för att se din profil.</p>
              <Link to="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Logga in
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till startsidan
            </Button>
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-6 w-6" />
              Min Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Grunduppgifter</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">Fullständigt namn</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={profile?.full_name || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Researcher Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Forskarprofil</h3>

                {/* Profilbild — komprimeras i webbläsaren, laddas upp till publik bild-bucket */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/5">
                    {researcherProfile.avatar_url ? (
                      <img src={researcherProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center"><User className="h-8 w-8 text-white/40" /></div>
                    )}
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
                      {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {researcherProfile.avatar_url ? 'Byt bild' : 'Ladda upp bild'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                    <p className="mt-1 text-xs text-slate-400">Beskärs kvadratiskt, max 400 px. Bilden blir publik på din profil.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle" className="text-white">Profil-URL (handle)</Label>
                  <Input
                    id="handle"
                    type="text"
                    value={researcherProfile.handle}
                    onChange={(e) => setResearcherProfile(prev => ({ ...prev, handle: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="anna-svensson"
                  />
                  <p className="text-xs text-slate-400">
                    Din publika profil: <code className="text-amber-300">/forskare/{researcherProfile.handle || '…'}</code>
                    {researcherProfile.handle && (
                      <> · <Link to={`/forskare/${researcherProfile.handle}`} className="text-amber-300 hover:underline">visa publik profil</Link></>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-white">Visningsnamn</Label>
                    <Input
                      id="display_name"
                      type="text"
                      value={researcherProfile.display_name}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ditt offentliga namn"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institution" className="text-white">Institution</Label>
                    <Input
                      id="institution"
                      type="text"
                      value={researcherProfile.institution}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, institution: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Universitet, museum, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field_of_expertise" className="text-white">Specialområde</Label>
                    <Input
                      id="field_of_expertise"
                      type="text"
                      value={researcherProfile.field_of_expertise}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, field_of_expertise: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Runologi, arkeologi, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="credentials" className="text-white">Kvalifikationer</Label>
                    <Input
                      id="credentials"
                      type="text"
                      value={researcherProfile.credentials}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, credentials: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="PhD, Professor, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Biografi</Label>
                  <Textarea
                    id="bio"
                    value={researcherProfile.bio}
                    onChange={(e) => setResearcherProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Berätta om din forskning och bakgrund..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-white">Webbsida</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={researcherProfile.website_url}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, website_url: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orcid_id" className="text-white">ORCID ID</Label>
                    <Input
                      id="orcid_id"
                      type="text"
                      value={researcherProfile.orcid_id}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, orcid_id: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                    <Input id="linkedin" type="url" value={researcherProfile.linkedin}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white" placeholder="https://linkedin.com/in/…" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="x" className="text-white">X / Mastodon</Label>
                    <Input id="x" type="url" value={researcherProfile.x}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, x: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white" placeholder="https://…" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academia" className="text-white">Academia.edu</Label>
                    <Input id="academia" type="url" value={researcherProfile.academia}
                      onChange={(e) => setResearcherProfile(prev => ({ ...prev, academia: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white" placeholder="https://…" />
                  </div>
                </div>
              </div>

              {/* Privat — visas aldrig publikt */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Privat
                  <span className="text-xs font-normal text-amber-300/80">🔒 visas aldrig publikt</span>
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Adress (valfri, privat)</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Gata, postnummer, ort"
                    rows={2}
                  />
                  <p className="text-xs text-slate-400">
                    Lagras i en separat, privat tabell (endast du och administratörer kommer åt den). Se{' '}
                    <Link to="/privacy" className="text-amber-300 hover:underline">integritetspolicyn</Link>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sparar...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Spara profil
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mina sidor — områden användaren kurerar (UGC steg: research_areas). */}
        <Card className="max-w-4xl mx-auto mt-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <MyResearchAreas />
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto mt-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <MyPlaceTies />
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto mt-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <MyConnections />
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto mt-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <MapPreferences />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
