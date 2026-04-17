"use client";

import { motion } from "framer-motion";

interface MoleculeViewerProps {
  svg: string;
  isAnalyzing?: boolean;
}

export default function MoleculeViewer({ svg, isAnalyzing }: MoleculeViewerProps) {
  return (
    <div className="relative glass-card flex items-center justify-center min-h-[400px] group overflow-hidden bg-black/40">
      {svg ? (
        <>
          <div 
            className={`w-full h-full flex items-center justify-center transition-opacity duration-500 ${isAnalyzing ? 'opacity-40 grayscale' : 'opacity-100'}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {isAnalyzing && (
            <div className="absolute inset-0 scanner-anim pointer-events-none" />
          )}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="text-[10px] uppercase tracking-widest text-primary/60 font-mono">Structure Rendered</span>
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full mx-auto animate-spin-slow flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-foreground/40 font-mono uppercase tracking-tighter">Awaiting Chemical Input</p>
        </div>
      )}
    </div>
  );
}
