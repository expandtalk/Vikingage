import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  MapPin, 
  Calendar,
  Scroll,
  Eye,
  EyeOff,
  FileText,
  Award,
  Clock,
  Image as ImageIcon,
  CalendarDays,
  Edit
} from "lucide-react";
import { useInscriptionExtendedData } from '@/hooks/useInscriptionExtendedData';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { InscriptionName } from "@/components/inscription/InscriptionName";
import { InscriptionEditModal } from "@/components/inscription/InscriptionEditModal";
import { RunicInscription } from "@/types/inscription";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";

interface InscriptionDetailProps {
  inscription: RunicInscription;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate?: (updatedInscription: RunicInscription) => void;
}

export const InscriptionDetail: React.FC<InscriptionDetailProps> = ({ 
  inscription, 
  isExpanded, 
  onToggle,
  onUpdate 
}) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const t = sv
    ? {
        unknownPeriod: 'Okänd period', ad: 'e.Kr.', complex: 'Komplex', medium: 'Medel', simple: 'Enkel',
        edit: 'Redigera', hide: 'Dölj', showMore: 'Visa mer', images: 'Bilder',
        noImages: 'Inga bilder tillgängliga för denna inskrift.',
        contribute: 'Vill du bidra med en bild? Kontakta oss eller använd upload-funktionen.',
        imgFail: 'Bild kunde inte laddas', detailedDating: 'Detaljerad datering (från Rundata)',
        overview: 'Översikt', text: 'Text', analysis: 'Analys', context: 'Kontext',
        basicInfo: 'Grundläggande information', material: 'Material', objectType: 'Objekttyp',
        styleGroup: 'Stilgrupp', uncertaintyLevel: 'Osäkerhetsnivå', unknownN: 'Okänt', unknownG: 'Okänd',
        scholarly: 'Forskningsnoter', translitLines: 'Translitteration (rad för rad)',
        svLines: 'Svensk översättning (rad för rad)', normalizedOwn: 'Normaliserad fornnordiska',
        paleo: 'Paleografiska noter', condition: 'Skick/tillstånd', historical: 'Historisk kontext',
        country: 'Land', uncertainty: 'Osäkerhet', normalization: 'Normalisering',
      }
    : {
        unknownPeriod: 'Unknown period', ad: 'AD', complex: 'Complex', medium: 'Medium', simple: 'Simple',
        edit: 'Edit', hide: 'Hide', showMore: 'Show more', images: 'Images',
        noImages: 'No images available for this inscription.',
        contribute: 'Want to contribute an image? Contact us or use the upload function.',
        imgFail: 'Image could not be loaded', detailedDating: 'Detailed dating (from Rundata)',
        overview: 'Overview', text: 'Text', analysis: 'Analysis', context: 'Context',
        basicInfo: 'Basic information', material: 'Material', objectType: 'Object type',
        styleGroup: 'Style group', uncertaintyLevel: 'Uncertainty level', unknownN: 'Unknown', unknownG: 'Unknown',
        scholarly: 'Scholarly notes', translitLines: 'Transliteration (line by line)',
        svLines: 'Swedish translation (line by line)', normalizedOwn: 'Normalized Old Norse',
        paleo: 'Paleographic notes', condition: 'Condition', historical: 'Historical context',
        country: 'Country', uncertainty: 'Uncertainty', normalization: 'Normalization',
      };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { data: extendedData, isLoading: isLoadingExtendedData } = useInscriptionExtendedData(isExpanded ? inscription.id : null);

  const formatPeriod = () => {
    if (inscription.period_start && inscription.period_end) {
      return `${inscription.period_start}-${inscription.period_end} ${t.ad}`;
    }
    return inscription.dating_text || t.unknownPeriod;
  };

  const getPeriodColor = () => {
    const start = inscription.period_start || 0;
    if (start < 550) return 'bg-purple-500';
    if (start < 800) return 'bg-blue-500';
    if (start < 1100) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const getComplexityColor = () => {
    switch (inscription.complexity_level) {
      case 'complex': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const isComplex = inscription.complexity_level === 'complex' && inscription.text_segments;

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2">
              <InscriptionName 
                inscription={inscription} 
                variant="default"
                showAlternatives={false}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getPeriodColor()} text-white border-0`}>
                {formatPeriod()}
              </Badge>
              {inscription.rune_type && (
                <Badge variant="secondary" className="text-xs">
                  {inscription.rune_type}
                </Badge>
              )}
              {inscription.complexity_level && (
                <Badge className={`${getComplexityColor()} text-white border-0 text-xs`}>
                  {inscription.complexity_level === 'complex' ? t.complex :
                   inscription.complexity_level === 'medium' ? t.medium : t.simple}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {user && isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-white hover:bg-white/20"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t.edit}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/20"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  {t.hide}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  {t.showMore}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic transliteration - always shown */}
        {inscription.transliteration && (
          <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200">
            {inscription.transliteration}
          </div>
        )}

        {/* Basic translation - always shown */}
        {inscription.translation_en && (
          <p className="text-slate-300 text-sm italic">
            "{inscription.translation_en}"
          </p>
        )}

        {/* Location and basic info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {inscription.location && (
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              {inscription.location}, {inscription.province}
            </div>
          )}
          {inscription.object_type && (
            <div className="flex items-center gap-1 text-slate-400">
              <BookOpen className="h-3 w-3" />
              {inscription.object_type}
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-white/20 pt-4 space-y-4">
            {/* Alternative names and signum section */}
            {(inscription.also_known_as?.length || inscription.alternative_signum?.length) && (
              <div>
                <InscriptionName 
                  inscription={inscription} 
                  variant="detailed"
                  showAlternatives={true}
                />
              </div>
            )}
            
            {/* Image Carousel section */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t.images}
              </h4>
              {isLoadingExtendedData ? (
                <div className="flex space-x-4">
                  <Skeleton className="h-32 w-full max-w-[128px] rounded-lg" />
                  <Skeleton className="h-32 w-full max-w-[128px] rounded-lg hidden md:block" />
                </div>
              ) : extendedData?.images && extendedData.images.length > 0 ? (
                <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-sm">
                  <CarouselContent>
                    {extendedData.images.map((img, index) => (
                      <CarouselItem key={index} className="md:basis-1/2">
                        <div className="p-1">
                          <Card className="bg-black/20">
                            <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden rounded-lg">
                              <img 
                                src={img} 
                                alt={`Bild på ${inscription.signum} ${index + 1}`} 
                                className="w-full h-full object-cover transition-transform hover:scale-105" 
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null; 
                                  // Instead of hiding, show a placeholder
                                  target.src = '/placeholder.svg';
                                  target.alt = t.imgFail;
                                }}
                                onClick={() => window.open(img, '_blank')}
                                style={{ cursor: 'pointer' }}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm mb-2">{t.noImages}</p>
                  <p className="text-slate-500 text-xs">
                    {t.contribute}
                  </p>
                </div>
              )}
            </div>

            {/* Dating section */}
            {extendedData?.datings && extendedData.datings.length > 0 && (
               <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {t.detailedDating}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {extendedData.datings.map((datingText, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {datingText}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Existing expanded content based on complexity */}
            <div className="border-t border-white/10 pt-4">
              {isComplex ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                    <TabsTrigger value="text">{t.text}</TabsTrigger>
                    <TabsTrigger value="analysis">{t.analysis}</TabsTrigger>
                    <TabsTrigger value="context">{t.context}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t.basicInfo}
                        </h4>
                        <div className="space-y-1 text-slate-300">
                          <div><strong>{t.material}:</strong> {inscription.material || t.unknownN}</div>
                          <div><strong>{t.objectType}:</strong> {inscription.object_type || t.unknownN}</div>
                          <div><strong>{t.styleGroup}:</strong> {inscription.style_group || t.unknownG}</div>
                          <div><strong>{t.uncertaintyLevel}:</strong> {inscription.uncertainty_level || t.unknownG}</div>
                        </div>
                      </div>
                      
                      {inscription.scholarly_notes && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {t.scholarly}
                          </h4>
                          <p className="text-slate-300 text-sm">
                            {inscription.scholarly_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    {inscription.text_segments?.transliteration_lines && (
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Scroll className="h-4 w-4" />
                          {t.translitLines}
                        </h4>
                        <div className="space-y-1">
                          {inscription.text_segments.transliteration_lines.map((line: string, index: number) => (
                            <div key={index} className="flex gap-3 text-sm">
                              <span className="text-slate-500 w-8 text-right">{index + 1}</span>
                              <span className="font-mono text-slate-200 flex-1">{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {inscription.text_segments?.swedish_lines && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">
                          {t.svLines}
                        </h4>
                        <div className="space-y-1">
                          {inscription.text_segments.swedish_lines.map((line: string, index: number) => (
                            <div key={index} className="flex gap-3 text-sm">
                              <span className="text-slate-500 w-8 text-right">{index + 1}</span>
                              <span className="text-slate-300 flex-1">{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {inscription.text_segments?.normalized && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">
                          {t.normalizedOwn}
                        </h4>
                        <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200">
                          {inscription.text_segments.normalized}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {inscription.paleographic_notes && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">{t.paleo}</h4>
                        <p className="text-slate-300 text-sm">
                          {inscription.paleographic_notes}
                        </p>
                      </div>
                    )}
                    
                    {inscription.condition_notes && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">{t.condition}</h4>
                        <p className="text-slate-300 text-sm">
                          {inscription.condition_notes}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="context" className="space-y-4">
                    {inscription.historical_context && (
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t.historical}
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {inscription.historical_context}
                        </p>
                      </div>
                    )}
                    
                    {inscription.scholarly_notes && (
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          {t.scholarly}
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {inscription.scholarly_notes}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1 text-slate-300">
                      <div><strong>{t.material}:</strong> {inscription.material || t.unknownN}</div>
                      <div><strong>{t.styleGroup}:</strong> {inscription.style_group || t.unknownG}</div>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div><strong>{t.country}:</strong> {inscription.country || t.unknownN}</div>
                      <div><strong>{t.uncertainty}:</strong> {inscription.uncertainty_level || t.unknownG}</div>
                    </div>
                  </div>
                  
                  {inscription.normalization && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">{t.normalization}</h4>
                      <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200">
                        {inscription.normalization}
                      </div>
                    </div>
                  )}
                  
                  {inscription.historical_context && (
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t.historical}
                      </h4>
                      <p className="text-slate-300 text-sm">
                        {inscription.historical_context}
                      </p>
                    </div>
                  )}
                  
                  {inscription.condition_notes && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">{t.condition}</h4>
                      <p className="text-slate-300 text-sm">
                        {inscription.condition_notes}
                      </p>
                    </div>
                  )}
                  
                  {inscription.scholarly_notes && (
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Forskningsnoter
                      </h4>
                      <p className="text-slate-300 text-sm">
                        {inscription.scholarly_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Edit Modal */}
      {user && isAdmin && (
        <InscriptionEditModal
          inscription={inscription}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedInscription) => {
            if (onUpdate) {
              onUpdate(updatedInscription);
            }
            setIsEditModalOpen(false);
          }}
        />
      )}
    </Card>
  );
};
