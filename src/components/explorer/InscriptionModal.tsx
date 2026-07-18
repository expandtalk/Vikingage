import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInscriptionExtendedData } from '@/hooks/useInscriptionExtendedData';
import { RunicInscription } from '@/types/inscription';
import { Badge } from '@/components/ui/badge';
import { detectSignumPattern } from '@/utils/coordinateMappingEnhanced';
import { InscriptionEditModal } from '@/components/inscription/InscriptionEditModal';
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit } from "lucide-react";

interface InscriptionModalProps {
  inscription: RunicInscription;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedInscription: RunicInscription) => void;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-white/10">
      <dt className="font-semibold text-slate-300">{label}</dt>
      <dd className="col-span-2 text-white">{value}</dd>
    </div>
  );
};

export const InscriptionModal: React.FC<InscriptionModalProps> = ({ inscription, isOpen, onClose, onUpdate }) => {
  const { data: extendedData, isLoading: isLoadingExtended } = useInscriptionExtendedData(inscription?.id || null);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const L = sv
    ? {
        name: 'Namn', nameEn: 'Engelskt namn', signum: 'Signum', breakdown: 'Signum-uppdelning',
        place: 'Plats', parish: 'Socken', municipality: 'Kommun', county: 'Län', landscape: 'Landskap',
        country: 'Land', coordsCurrent: 'Koordinater (nuvarande)', noCoords: 'Inga koordinater',
        coordsAlt: 'Koordinater', status: 'Status', translit: 'Transliteration',
        translationSv: 'Översättning (SV)', translationEn: 'Översättning (EN)', translationOther: 'Översättning',
        dating: 'Datering', rundataDating: 'Rundata-datering', material: 'Material', objectType: 'Objekttyp',
        currentLocation: 'Nuvarande plats', dimensions: 'Mått', runeType: 'Runtyp', styleGroup: 'Stilgrupp',
        condition: 'Skick', scholarly: 'Forskarnoter', context: 'Historisk kontext', paleo: 'Paleografiska noter',
        sources: 'Källor & externa länkar', unknownTitle: 'Okänd titel', unknownAuthor: 'Okänd författare',
        images: 'Bilder från arkiv', loadingImages: 'Laddar bilder…', noImages: 'Inga bilder i arkiven.',
        edit: 'Redigera', close: 'Stäng',
      }
    : {
        name: 'Name', nameEn: 'English name', signum: 'Signum', breakdown: 'Signum breakdown',
        place: 'Place', parish: 'Parish', municipality: 'Municipality', county: 'County', landscape: 'Province',
        country: 'Country', coordsCurrent: 'Coordinates (current)', noCoords: 'No coordinates',
        coordsAlt: 'Coordinates', status: 'Status', translit: 'Transliteration',
        translationSv: 'Translation (SV)', translationEn: 'Translation (EN)', translationOther: 'Translation',
        dating: 'Dating', rundataDating: 'Rundata dating', material: 'Material', objectType: 'Object type',
        currentLocation: 'Current location', dimensions: 'Dimensions', runeType: 'Rune type', styleGroup: 'Style group',
        condition: 'Condition', scholarly: 'Scholarly notes', context: 'Historical context', paleo: 'Paleographic notes',
        sources: 'Sources & external links', unknownTitle: 'Unknown title', unknownAuthor: 'Unknown author',
        images: 'Images from archives', loadingImages: 'Loading images…', noImages: 'No images found in archives.',
        edit: 'Edit', close: 'Close',
      };
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const {
    signum,
    name,
    name_en,
    coordinates,
    location,
    province,
    country,
    municipality,
    county,
    parish,
    landscape,
    transliteration,
    translation_en,
    translation_sv,
    dating_text,
    material,
    object_type,
    style_group,
    rune_type,
    status,
    scholarly_notes,
    historical_context,
    paleographic_notes,
    condition_notes,
    dimensions,
    current_location,
  } = inscription;

  const signumParts = inscription.signum ? detectSignumPattern(inscription.signum) : null;
  const signumBreakdown = signumParts ? 
    Object.entries(signumParts)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(', ')
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            {name ? `${name} (${signum})` : signum}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {location}, {province}, {country}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <dl className="space-y-1">
            <DetailItem label={L.name} value={name} />
            <DetailItem label={L.nameEn} value={name_en} />
            <DetailItem label={L.signum} value={signum} />
            <DetailItem label={L.breakdown} value={signumBreakdown} />
            <DetailItem label={L.place} value={location} />
            <DetailItem label={L.parish} value={parish} />
            <DetailItem label={L.municipality} value={municipality} />
            <DetailItem label={L.county} value={county} />
            <DetailItem label={L.landscape} value={landscape} />
            <DetailItem label={L.country} value={country} />
            <DetailItem
              label={L.coordsCurrent}
              value={coordinates ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : L.noCoords}
            />
            {extendedData?.additionalCoordinates && extendedData.additionalCoordinates.length > 0 && (
              extendedData.additionalCoordinates.map((coord, index) => (
                <DetailItem 
                  key={index}
                  label={coord.source ? `${L.coordsAlt} (${coord.source})` : `${L.coordsAlt} (alt ${index + 1})`}
                  value={`${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`}
                />
              ))
            )}
            <DetailItem label={L.status} value={status ? <Badge variant="outline">{status}</Badge> : null} />
            <DetailItem label={L.translit} value={transliteration} />
            <DetailItem label={L.translationSv} value={translation_sv} />
            <DetailItem label={L.translationEn} value={translation_en} />
            {extendedData?.translations && extendedData.translations.length > 0 && (
              extendedData.translations.map((trans, index) => (
                <DetailItem
                  key={index}
                  label={`${L.translationOther} (${trans.language.toUpperCase()})`}
                  value={trans.text}
                />
              ))
            )}
            <DetailItem label={L.dating} value={dating_text} />
            {extendedData?.datings && extendedData.datings.length > 0 && (
              <DetailItem label={L.rundataDating} value={extendedData.datings.join(', ')} />
            )}
            <DetailItem label={L.material} value={material} />
            <DetailItem label={L.objectType} value={object_type} />
            <DetailItem label={L.currentLocation} value={current_location} />
            <DetailItem label={L.dimensions} value={dimensions} />
            <DetailItem label={L.runeType} value={rune_type} />
            <DetailItem label={L.styleGroup} value={style_group} />
            <DetailItem label={L.condition} value={condition_notes} />
            <DetailItem label={L.scholarly} value={<p className="whitespace-pre-wrap">{scholarly_notes}</p>} />
            <DetailItem label={L.context} value={<p className="whitespace-pre-wrap">{historical_context}</p>} />
            <DetailItem label={L.paleo} value={<p className="whitespace-pre-wrap">{paleographic_notes}</p>} />

            {extendedData?.sources && extendedData.sources.length > 0 && (
              <div className="pt-4">
                <h4 className="font-semibold text-slate-300 mb-2">{L.sources}</h4>
                <div className="space-y-3">
                  {extendedData.sources.map((source) => (
                    <div key={source.sourceid} className="text-sm p-3 bg-black/20 rounded-md border border-white/10">
                      <p className="font-semibold text-white">
                        {source.title || L.unknownTitle}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {source.author || L.unknownAuthor}
                        {source.publication_year && ` (${source.publication_year})`}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {source.uris.map((uri, index) => (
                          <li key={index}>
                            <a 
                              href={uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline text-xs break-all"
                            >
                              {uri}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <h4 className="font-semibold text-slate-300 mb-2">{L.images}</h4>
              {isLoadingExtended ? (
                <p>{L.loadingImages}</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {extendedData?.images && extendedData.images.length > 0 ? (
                    extendedData.images.map((img, index) => (
                      <a href={img} target="_blank" rel="noopener noreferrer" key={index}>
                        <img src={img} alt={`${signum} image ${index + 1}`} className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity" />
                      </a>
                    ))
                  ) : (
                    <p className="text-slate-400">{L.noImages}</p>
                  )}
                </div>
              )}
            </div>
          </dl>
        </ScrollArea>
        <DialogFooter className="flex gap-2">
          {user && isAdmin && (
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-1" />
              {L.edit}
            </Button>
          )}
          <Button onClick={onClose} variant="outline">{L.close}</Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Edit Modal */}
      {user && isAdmin && (
        <InscriptionEditModal
          inscription={inscription}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedInscription) => {
            // Update the local inscription state immediately
            inscription = updatedInscription;
            if (onUpdate) {
              onUpdate(updatedInscription);
            }
            setIsEditModalOpen(false);
          }}
        />
      )}
    </Dialog>
  );
};
