
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeRunicInscription } from '../services/aiService';
import { DatingResult } from './DatingResult';
import { ImageUpload } from './ImageUpload';
import { RunicAnalysis } from '../types/runic';
import { useLanguage } from "@/contexts/LanguageContext";

const COPY = {
  sv: {
    title: 'AI-baserad datering av runinskriptioner',
    description: 'Analysera runinskriptioner med AI för att uppskatta tidsperiod och språkstadium. Baserat på Samnordisk runtextdatabas och modern runologisk forskning.',
    translitLabel: 'Translitteration (obligatorisk)',
    translitPlaceholder: "t.ex. 'sirkir × resþi × stin × þana × eftR × karna' eller 'harija'",
    translitHelp: 'Ange runinskriptionen translittererad till latinska bokstäver',
    locationLabel: 'Plats (valfritt)',
    locationPlaceholder: "t.ex. 'Uppland, Orkesta'",
    objectTypeLabel: 'Objekttyp (valfritt)',
    objectTypePlaceholder: "t.ex. 'runsten', 'brakteat', 'kam'",
    analyzing: 'Analyserar med AI...',
    analyze: 'Analysera datering',
    clear: 'Rensa',
    examplesTitle: 'Exempel att testa:',
    errorTitle: 'Fel',
    errorEmpty: 'Vänligen ange en runinskription att analysera',
    doneTitle: 'Analys klar!',
    donePeriod: (p: string) => `Föreslagen period: ${p}`,
    failTitle: 'Fel vid analys',
    failBody: 'Kunde inte analysera inskriptionen. Försök igen.',
  },
  en: {
    title: 'AI-based dating of runic inscriptions',
    description: 'Analyze runic inscriptions with AI to estimate time period and language stage. Based on the Scandinavian Runic-text Database and modern runological research.',
    translitLabel: 'Transliteration (required)',
    translitPlaceholder: "e.g. 'sirkir × resþi × stin × þana × eftR × karna' or 'harija'",
    translitHelp: 'Enter the runic inscription transliterated into Latin letters',
    locationLabel: 'Location (optional)',
    locationPlaceholder: "e.g. 'Uppland, Orkesta'",
    objectTypeLabel: 'Object type (optional)',
    objectTypePlaceholder: "e.g. 'runestone', 'bracteate', 'comb'",
    analyzing: 'Analyzing with AI...',
    analyze: 'Analyze dating',
    clear: 'Clear',
    examplesTitle: 'Examples to try:',
    errorTitle: 'Error',
    errorEmpty: 'Please enter a runic inscription to analyze',
    doneTitle: 'Analysis complete!',
    donePeriod: (p: string) => `Suggested period: ${p}`,
    failTitle: 'Analysis error',
    failBody: 'Could not analyze the inscription. Please try again.',
  },
};

export const RunicDatingAssistant: React.FC = () => {
  const [transliteration, setTransliteration] = useState('');
  const [location, setLocation] = useState('');
  const [objectType, setObjectType] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RunicAnalysis | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const c = COPY[language === 'sv' ? 'sv' : 'en'];

  const handleAnalysis = async () => {
    if (!transliteration.trim()) {
      toast({
        title: c.errorTitle,
        description: c.errorEmpty,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeRunicInscription({
        transliteration: transliteration.trim(),
        location: location.trim(),
        objectType: objectType.trim(),
        imageFile
      });
      
      setAnalysis(result);
      toast({
        title: c.doneTitle,
        description: c.donePeriod(result.period),
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: c.failTitle,
        description: c.failBody,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setTransliteration('');
    setLocation('');
    setObjectType('');
    setImageFile(null);
    setAnalysis(null);
  };

  const exampleInscriptions = [
    { text: 'harija', period: 'Proto-nordiska', description: 'Klassisk tidig inskription' },
    { text: 'sirkir × resþi × stin × þana × eftR × karna', period: 'Vikingatid', description: 'Typisk runstensformel' },
    { text: 'rauk × þur × uk × þin × faþur', period: 'Vikingatid', description: 'Minnesformel' },
    { text: 'auja', period: 'Proto-nordiska', description: 'Magisk formel' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {c.title}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {c.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Transliteration Input */}
          <div className="space-y-2">
            <Label htmlFor="transliteration" className="text-white">
              {c.translitLabel}
            </Label>
            <Textarea
              id="transliteration"
              placeholder={c.translitPlaceholder}
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              rows={3}
            />
            <p className="text-xs text-slate-400">
              {c.translitHelp}
            </p>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                {c.locationLabel}
              </Label>
              <Input
                id="location"
                placeholder={c.locationPlaceholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="objectType" className="text-white">
                {c.objectTypeLabel}
              </Label>
              <Input
                id="objectType"
                placeholder={c.objectTypePlaceholder}
                value={objectType}
                onChange={(e) => setObjectType(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload 
            imageFile={imageFile}
            onImageChange={setImageFile}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleAnalysis}
              disabled={isAnalyzing || !transliteration.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {c.analyzing}
                </>
              ) : (
                <>
                  <Info className="mr-2 h-4 w-4" />
                  {c.analyze}
                </>
              )}
            </Button>

            <Button
              onClick={clearForm}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {c.clear}
            </Button>
          </div>

          {/* Example Inscriptions */}
          <div className="mt-6 p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">{c.examplesTitle}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleInscriptions.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTransliteration(example.text)}
                  className="text-left text-slate-300 hover:text-white hover:bg-white/10 justify-start p-3"
                >
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {example.period}
                      </Badge>
                      <span className="font-mono text-sm">{example.text}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {example.description}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysis && (
        <DatingResult analysis={analysis} />
      )}
    </div>
  );
};
