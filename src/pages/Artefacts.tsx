
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { PageMeta } from '@/components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Search, Filter, Info, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sortArraySwedish } from '@/utils/swedishSorting';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArtefactWithCategory {
  id: string;
  artefact_name: string;
  language: string;
  category_mapping: string | null;
  artefactid: string;
  created_at: string;
}

const ArtefactsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtefact, setSelectedArtefact] = useState<ArtefactWithCategory | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: artefacts, isLoading, error } = useQuery({
    queryKey: ['artefacts-with-categories'],
    queryFn: async () => {
      console.log('Loading artefacts with categories from database...');
      const { data, error } = await supabase
        .from('rundata_artefacts')
        .select('*')
        .order('artefact_name');
      
      if (error) {
        console.error('Error loading artefacts:', error);
        throw error;
      }
      
      console.log('Loaded artefacts:', data?.length || 0, 'items');
      return data as ArtefactWithCategory[];
    },
  });

  const getCategoryDisplayName = (category: string | null) => {
    if (!category) return 'Okategoriserad';
    
    const categoryMap: Record<string, string> = {
      'memorial-stones': 'Minnestenar',
      'household': 'Hushåll',
      'structural': 'Strukturell',
      'religious-ritual': 'Religiös-rituell',
      'jewelry-personal': 'Smycken-personligt',
      'weapons-tools': 'Vapen-verktyg',
      'currency-trade': 'Valuta-handel',
      'other': 'Övrigt'
    };
    
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colorMap: Record<string, string> = {
      'memorial-stones': 'bg-stone-100 text-stone-800',
      'household': 'bg-amber-100 text-amber-800',
      'structural': 'bg-cyan-100 text-cyan-800',
      'religious-ritual': 'bg-purple-100 text-purple-800',
      'jewelry-personal': 'bg-pink-100 text-pink-800',
      'weapons-tools': 'bg-red-100 text-red-800',
      'currency-trade': 'bg-green-100 text-green-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredArtefacts = artefacts?.filter(artefact => {
    const matchesSearch = artefact.artefact_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || artefact.category_mapping === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = sortArraySwedish(Array.from(new Set(artefacts?.map(a => a.category_mapping).filter(Boolean) || [])));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: t('copied'),
        description: `${label} ${t('copiedToClipboard')}`,
        duration: 2000,
      });
    });
  };

  const handleArtefactClick = (artefact: ArtefactWithCategory) => {
    setSelectedArtefact(artefact);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="ml-2 text-white">{t('loadingArtefacts')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-400">{t('errorLoadingArtefacts')}: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Artefakter"
        titleEn="Artefacts"
        description="Utforska arkeologiska artefakter kopplade till runinskrifter. Sök och filtrera efter olika kategorier av fornnordiska föremål."
        descriptionEn="Explore archaeological artefacts linked to runic inscriptions. Search and filter by different categories of Old Norse objects."
        keywords="artefakter, arkeologi, vikingatid, fornnordiska föremål, runologi"
      />
      <Header />
      <Breadcrumbs />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Package className="h-8 w-8" />
            {t('artefactsTitle')}
          </h1>
          <p className="text-slate-300 text-lg">
            {t('artefactsDescription')}
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filteredArtefacts.length} {t('artefactsOf')} {artefacts?.length || 0} {t('artefactsCount')}
            </Badge>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder={t('searchArtefacts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50 pl-10"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
              >
                <option value="all">{t('allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="text-black">
                    {getCategoryDisplayName(cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Category Statistics */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const count = artefacts?.filter(a => a.category_mapping === category).length || 0;
              return (
                <Badge 
                  key={category}
                  variant="outline" 
                  className={`${getCategoryColor(category)} cursor-pointer hover:opacity-80`}
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                >
                  {getCategoryDisplayName(category)} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        {filteredArtefacts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || selectedCategory !== 'all' ? t('noMatchingArtefacts') : t('noArtefactsFound')}
            </h3>
            <p className="text-slate-400">
              {searchTerm || selectedCategory !== 'all' 
                ? t('tryChangingCriteria')
                : t('noArtefactsLoaded')
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortArraySwedish(filteredArtefacts, (artefact) => artefact.artefact_name).map((artefact) => (
              <Card 
                key={artefact.id} 
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                onClick={() => handleArtefactClick(artefact)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">
                      {artefact.artefact_name}
                    </CardTitle>
                    <Badge className={getCategoryColor(artefact.category_mapping)}>
                      {getCategoryDisplayName(artefact.category_mapping)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-slate-300 border-slate-400">
                        {artefact.language}
                      </Badge>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Info className="h-3 w-3" />
                        <span className="text-xs">Klicka för detaljer</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('created')}: {new Date(artefact.created_at).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Artefact Detail Modal */}
        <Dialog open={!!selectedArtefact} onOpenChange={() => setSelectedArtefact(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="h-6 w-6" />
                {selectedArtefact?.artefact_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedArtefact && (
              <div className="space-y-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(selectedArtefact.category_mapping)} variant="default">
                    {getCategoryDisplayName(selectedArtefact.category_mapping)}
                  </Badge>
                  <Badge variant="outline" className="text-slate-300 border-slate-400">
                    {selectedArtefact.language}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {t('artefactId')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="text-green-400 text-sm bg-slate-700 px-2 py-1 rounded">
                          {selectedArtefact.artefactid}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedArtefact.artefactid, t('artefactId'))}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t('systemId')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="text-blue-400 text-sm bg-slate-700 px-2 py-1 rounded">
                          {selectedArtefact.id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedArtefact.id, t('systemId'))}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Metadata */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">{t('metadata')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{t('language')}:</span>
                      <span className="text-white">{selectedArtefact.language}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{t('category')}:</span>
                      <span className="text-white">{getCategoryDisplayName(selectedArtefact.category_mapping)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{t('created')}:</span>
                      <span className="text-white">
                        {new Date(selectedArtefact.created_at).toLocaleString('sv-SE')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(selectedArtefact.artefact_name, 'Artefaktnamn')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t('copyName')}
                  </Button>
                  <Button
                    onClick={() => setSelectedArtefact(null)}
                    variant="default"
                    className="flex-1"
                  >
                    {t('close')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
};

export default ArtefactsPage;
