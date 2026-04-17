"use client";

import { motion } from "framer-motion";

interface MoleculeViewerProps {
  svg: string;
  isAnalyzing?: boolean;
}

export default function MoleculeViewer({ svg, isAnalyzing }: MoleculeViewerProps) {
  return (
    <div className="relative group overflow-hidden flex items-center justify-center min-h-[300px]">
      {svg ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full h-full flex items-center justify-center transition-all duration-700 ${isAnalyzing ? 'opacity-40 grayscale' : 'opacity-100 invert brightness-[2] contrast-[1.5] saturate-0'}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="text-center opacity-20">
          <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full mx-auto animate-spin-slow" />
          <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Awaiting Signal</p>
        </div>
      )}
    </div>
  );
}
