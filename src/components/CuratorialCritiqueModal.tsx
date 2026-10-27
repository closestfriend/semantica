import React, { useState } from 'react';
import { CuratorialCritique, ImageSpecimen } from '../types/taxonomy';
import { X, Sparkles, Copy, Check, BookOpen } from 'lucide-react';
import { generateCuratorialSynthesis } from '../services/api';

interface CuratorialCritiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  specimens: ImageSpecimen[];
}

export const CuratorialCritiqueModal: React.FC<CuratorialCritiqueModalProps> = ({
  isOpen,
  onClose,
  category,
  specimens,
}) => {
  const [critique, setCritique] = useState<CuratorialCritique | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateCuratorialSynthesis(
        category || 'Complete Archive Collective',
        specimens
      );
      setCritique(result);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize curatorial critique.');
    } finally {
      setLoading(false);
    }
  };

  const copyEssay = () => {
    if (!critique) return;
    const text = `${critique.essayTitle}\n\n${critique.thematicDiscourse}\n\nChromatic Discourse:\n${critique.chromaticObservations}\n\nStructural Axiom:\n"${critique.structuralAxiom}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl bg-[#0f1013] border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#14151a]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-white" />
            <span className="text-xs font-mono text-zinc-400">
              CURATORIAL SYNTHESIS DISCOURSE // {category || 'WHOLE ARCHIVE'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {critique && (
              <button
                onClick={copyEssay}
                className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10"
                title="Copy essay"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded text-xs text-rose-300">
              {error}
            </div>
          )}

          {!critique && !loading && (
            <div className="py-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold font-display text-white">
                  Generate Curatorial Discourse
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Execute deep critical synthesis across all categorized specimens in {category ? `the "${category}" taxonomy` : 'the collection'}.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Begin Curatorial Analysis</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="h-10 w-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">
                Synthesizing semiotics, tonal distributions, and aesthetic tensions...
              </p>
            </div>
          )}

          {critique && !loading && (
            <div className="space-y-6">
              {/* Essay Title */}
              <div className="space-y-2 border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  EDITORIAL ESSAY // CRITICAL INQUIRY
                </span>
                <h3 className="text-2xl font-bold font-display text-white tracking-tight">
                  {critique.essayTitle}
                </h3>
              </div>

              {/* Body Discourse */}
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed space-y-4 font-sans text-sm whitespace-pre-line">
                {critique.thematicDiscourse}
              </div>

              {/* Chromatic Observations */}
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/10 space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">
                  Chromatic Discourse & Frequency Analysis
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {critique.chromaticObservations}
                </p>
              </div>

              {/* Structural Axiom */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/15 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  STRUCTURAL AXIOM
                </span>
                <p className="text-sm font-semibold text-white italic font-serif">
                  "{critique.structuralAxiom}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {critique && (
          <div className="px-6 py-3 border-t border-white/10 bg-[#121316] flex justify-between items-center text-xs">
            <span className="font-mono text-zinc-500">
              Evaluated across {specimens.length} specimens
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Re-generate Perspective →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
