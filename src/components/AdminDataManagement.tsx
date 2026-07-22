import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminInscriptions } from './admin/AdminInscriptions';
import { AdminLocations } from './admin/AdminLocations';
import { AdminLanguages } from './admin/AdminLanguages';
import { AdminCarvers } from './admin/AdminCarvers';
import { AdminCarverInscriptions } from './admin/AdminCarverInscriptions';
import { AdminArtefactMappings } from './admin/AdminArtefactMappings';
import { AdminVikingLocations } from './admin/AdminVikingLocations';
import { AdminRiverSystems } from './admin/AdminRiverSystems';
import { AdminMapConfiguration } from './admin/AdminMapConfiguration';
import { AdminFolkGroups } from './admin/AdminFolkGroups';
import { AdminEyeColors } from './admin/AdminEyeColors';
import { AdminAudioFiles } from './admin/AdminAudioFiles';
import { DataImporter } from './DataImporter';
import { PlaceParishLinksImportSection } from './import/PlaceParishLinksImportSection';
import { FragmentsImportSection } from './import/FragmentsImportSection';
import { DanishParishesImportSection } from './import/DanishParishesImportSection';
import { ReferenceUriImportSection } from './import/reference-uri/ReferenceUriImportSection';
import { UrisImportSection } from './import/uris/UrisImportSection';
import { TranslationsImportSection } from './import/translations/TranslationsImportSection';
import { Database, MapPin, Languages, Users, Hammer, Package, Castle, Waves, Settings, Users2, Eye, Upload, Link, Link2, Puzzle, Globe2, Globe, Music } from 'lucide-react';
import { CoordinateImport } from './admin/CoordinateImport';
import { SRDIntegration } from './admin/SRDIntegration';
import { GeocodingManager } from './admin/GeocodingManager';

export const AdminDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inscriptions');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <Card className="max-w-7xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-6 w-6" />
            Administratörspanel - Datahantering
          </CardTitle>
          <CardDescription className="text-slate-300">
            Hantera runstenar, platser, språk, ristare och historiska data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="space-y-4">
              {/* Runstenar Layer */}
              <div className="bg-slate-800/30 rounded-lg p-2">
                <TabsList className="grid w-full grid-cols-1 bg-slate-800/50">
                  <TabsTrigger value="inscriptions" className="text-white data-[state=active]:bg-blue-600">
                    <Database className="h-4 w-4 mr-2" />
                    Runstenar
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Main Admin Layers */}
              <div className="bg-slate-800/30 rounded-lg p-2">
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-slate-800/50 gap-1">
                  <TabsTrigger value="locations" className="text-white data-[state=active]:bg-green-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Platser</span>
                  </TabsTrigger>
                  <TabsTrigger value="languages" className="text-white data-[state=active]:bg-purple-600">
                    <Languages className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Språk</span>
                  </TabsTrigger>
                  <TabsTrigger value="carvers" className="text-white data-[state=active]:bg-orange-600">
                    <Hammer className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ristare</span>
                  </TabsTrigger>
                  <TabsTrigger value="carver-inscriptions" className="text-white data-[state=active]:bg-red-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ristningar</span>
                  </TabsTrigger>
                  <TabsTrigger value="artefacts" className="text-white data-[state=active]:bg-yellow-600">
                    <Package className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Artefakter</span>
                  </TabsTrigger>
                  <TabsTrigger value="viking-locations" className="text-white data-[state=active]:bg-indigo-600">
                    <Castle className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Vikingastäder</span>
                  </TabsTrigger>
                  <TabsTrigger value="river-systems" className="text-white data-[state=active]:bg-cyan-600">
                    <Waves className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Flodsystem</span>
                  </TabsTrigger>
                  <TabsTrigger value="map-config" className="text-white data-[state=active]:bg-emerald-600">
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Kartkonfig</span>
                  </TabsTrigger>
                  <TabsTrigger value="folk-groups" className="text-white data-[state=active]:bg-teal-600">
                    <Users2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Folkgrupper</span>
                  </TabsTrigger>
                  <TabsTrigger value="eye-colors" className="text-white data-[state=active]:bg-violet-600">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ögonfärger</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Audio Files Layer */}
              <div className="bg-slate-800/30 rounded-lg p-2">
                <TabsList className="grid w-full grid-cols-1 bg-slate-800/50">
                  <TabsTrigger value="audio-files" className="text-white data-[state=active]:bg-red-600">
                    <Music className="h-4 w-4 mr-2" />
                    Ljudfilshantering
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Import Layer */}
              <div className="bg-slate-800/30 rounded-lg p-2">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-slate-800/50">
                  <TabsTrigger value="import" className="text-white data-[state=active]:bg-amber-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import (Inskrifter)
                  </TabsTrigger>
                  <TabsTrigger value="place-parish-import" className="text-white data-[state=active]:bg-purple-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Import (Plats-Socken)
                  </TabsTrigger>
                  <TabsTrigger value="fragments-import" className="text-white data-[state=active]:bg-indigo-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Puzzle className="h-4 w-4 mr-2" />
                    Import (Fragment)
                  </TabsTrigger>
                   <TabsTrigger value="danish-parishes-import" className="text-white data-[state=active]:bg-teal-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Globe2 className="h-4 w-4 mr-2" />
                    Import (DK Socken)
                  </TabsTrigger>
                  <TabsTrigger value="uris-import" className="text-white data-[state=active]:bg-green-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Import (URIs)
                  </TabsTrigger>
                  <TabsTrigger value="reference-uri-import" className="text-white data-[state=active]:bg-sky-600 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Link className="h-4 w-4 mr-2" />
                    Import (Ref-URI Länkar)
                  </TabsTrigger>
                  <TabsTrigger value="translations-import" className="text-white data-[state=active]:bg-yellow-500 relative z-50" style={{ pointerEvents: 'auto' }}>
                    <Languages className="h-4 w-4 mr-2" />
                    Import (Översättningar)
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SRD Integration & Geocoding Layer */}
              <div className="bg-slate-800/30 rounded-lg p-2">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                  <TabsTrigger value="srd-integration" className="text-white data-[state=active]:bg-emerald-600">
                    <Globe className="h-4 w-4 mr-2" />
                    SRD Integration (Uppsala Universitet)
                  </TabsTrigger>
                  <TabsTrigger value="geocoding" className="text-white data-[state=active]:bg-blue-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Geografisk Kodning
                  </TabsTrigger>
                  <TabsTrigger value="coordinate-import" className="text-white data-[state=active]:bg-green-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Koordinatimport
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="mt-6">
              <TabsContent value="inscriptions" className="mt-6">
                <AdminInscriptions />
              </TabsContent>
              
              <TabsContent value="locations" className="mt-6">
                <AdminLocations />
              </TabsContent>
              
              <TabsContent value="languages" className="mt-6">
                <AdminLanguages />
              </TabsContent>
              
              <TabsContent value="carvers" className="mt-6">
                <AdminCarvers />
              </TabsContent>
              
              <TabsContent value="carver-inscriptions" className="mt-6">
                <AdminCarverInscriptions />
              </TabsContent>
              
              <TabsContent value="artefacts" className="mt-6">
                <AdminArtefactMappings />
              </TabsContent>
              
              <TabsContent value="viking-locations" className="mt-6">
                <AdminVikingLocations />
              </TabsContent>
              
              <TabsContent value="river-systems" className="mt-6">
                <AdminRiverSystems />
              </TabsContent>
              
              <TabsContent value="map-config" className="mt-6">
                <AdminMapConfiguration />
              </TabsContent>
              
              <TabsContent value="folk-groups" className="mt-6">
                <AdminFolkGroups />
              </TabsContent>

              <TabsContent value="eye-colors" className="mt-6">
                <AdminEyeColors />
              </TabsContent>

              <TabsContent value="audio-files" className="mt-6">
                <AdminAudioFiles />
              </TabsContent>

              <TabsContent value="import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <DataImporter />
              </TabsContent>

              <TabsContent value="place-parish-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <PlaceParishLinksImportSection />
              </TabsContent>

              <TabsContent value="fragments-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <FragmentsImportSection />
              </TabsContent>
              
              <TabsContent value="danish-parishes-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <DanishParishesImportSection />
              </TabsContent>

              <TabsContent value="reference-uri-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <ReferenceUriImportSection />
              </TabsContent>

              <TabsContent value="uris-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <UrisImportSection />
              </TabsContent>

              <TabsContent value="translations-import" className="mt-6 relative z-40" style={{ pointerEvents: 'auto' }}>
                <TranslationsImportSection />
              </TabsContent>

              <TabsContent value="srd-integration" className="mt-6">
                <SRDIntegration />
              </TabsContent>

              <TabsContent value="geocoding" className="mt-6">
                <GeocodingManager />
              </TabsContent>

              <TabsContent value="coordinate-import" className="mt-6">
                <CoordinateImport />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
