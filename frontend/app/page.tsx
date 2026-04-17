"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Terminal, 
  Zap, 
  Layers, 
  Database,
  Globe,
  Radio,
  Share2,
  ChevronRight,
  Info,
  Cpu,
  Box
} from "lucide-react";
import MoleculeViewer from "@/components/MoleculeViewer";
import Molecule3D from "@/components/Molecule3D";
import ToxicityGauge from "@/components/ToxicityGauge";

interface AnalysisResult {
  smiles: string;
  valid: boolean;
  toxicity?: {
    toxicity_percent: number;
    toxicity_class: string;
    confidence: number;
    top_classes?: Array<{ class: string; confidence: number }>;
    atom_scores?: number[];
  };
  properties?: {
    mol_wt: number;
    logp: number;
    tpsa: number;
    h_donors: number;
    h_acceptors: number;
    heavy_atoms: number;
  };
  svg?: string;
  pdb?: string;
  error?: string;
}

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!smiles) return;
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await fetch("https://udaydomadiya-bioaegis-api.hf.space/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles })
      });
      const data = await response.json();
      if (data.valid) {
        setResult(data);
      } else {
        alert(data.error || "Neural Engine: Invalid Structure.");
      }
    } catch (err) {
      console.error(err);
      alert("Neural Bridge Offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const examples = [
    { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
    { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
    { name: "Sarin", smiles: "CCP(=O)(F)OC(C)C" }
  ];

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col pointer-events-auto radial-center-glow p-8 md:p-12 overflow-x-hidden">
      {/* High-Impact Brand Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#00f5a0] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,245,160,0.5)]">
            <ShieldAlert className="text-[#0b0e14] w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold italic uppercase tracking-tighter text-white">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-black uppercase tracking-[0.4em]">
               <Radio className="w-3 h-3 text-[#00f5a0] animate-pulse" /> Operational Core | Cluster 08
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-[#161b22] px-8 py-4 rounded-2xl border border-white/5">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8b949e]">System Integrity</span>
              <span className="text-sm font-bold text-white">99.8% Operational</span>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <Cpu className="text-[#00f5a0] w-6 h-6 animate-pulse" />
        </div>
      </header>

      {/* Industrial Hero Command Section */}
      <section className="max-w-6xl mx-auto w-full mb-20">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text- औद्योगिक text-industrial text-white mb-6"
        >
          Structural <br/> <span className="text-[#00f5a0]">Toxicity</span> Discovery
        </motion.h2>
        <p className="text-xl text-[#8b949e] max-w-2xl leading-relaxed italic mb-12">
           Orchestrate high-throughput molecular analysis with zero operating latency. <br/>
           Input a SMILES string to initiate global neural synthesis.
        </p>

        {/* The Synthesis Input Engine */}
        <div className="command-card p-1 flex items-center overflow-hidden focus-within:border-[#00f5a0]/40 transition-all">
           <textarea 
             value={smiles}
             onChange={(e) => setSmiles(e.target.value)}
             placeholder="Input Topic, Molecular Vector, or SMILES Identifier..."
             className="flex-1 bg-transparent px-8 py-10 text-2xl text-white outline-none resize-none font-bold placeholder:text-white/10 h-28 scroll-hide"
           />
           <div className="pr-6">
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing}
               className="btn-vantix text-lg"
             >
               {isAnalyzing ? "Processing..." : "Initiate Connection"}
             </button>
           </div>
        </div>

        <div className="flex gap-4 mt-8 px-2 overflow-x-auto scroll-hide">
           {examples.map((ex) => (
             <button 
               key={ex.name}
               onClick={() => setSmiles(ex.smiles)}
               className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00f5a0]/30 hover:bg-[#00f5a0]/5 transition-all text-[11px] font-black uppercase tracking-widest text-[#8b949e] whitespace-nowrap"
             >
               {ex.name}
             </button>
           ))}
        </div>
      </section>

      {/* Main Analysis Architecture */}
      <AnimatePresence>
        {result ? (
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1600px] mx-auto w-full"
          >
            {/* Visualizer Panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
               <div className="flex items-center gap-3 text-[#00f5a0] mb-4">
                  <Globe className="w-5 h-5 animate-spin-slow" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic leading-none">Primary Structural Stream</h3>
               </div>
               <div className="command-card relative h-[650px] overflow-hidden group">
                  <div className="absolute top-8 left-8 z-10 flex items-center gap-4 bg-[#0b0e14]/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
                     <div className="w-2.5 h-2.5 bg-[#00f5a0] rounded-full animate-ping" />
                     <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">Neural Sentinel Online</span>
                  </div>
                  <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
               </div>
            </div>

            {/* Results Deck */}
            <div className="lg:col-span-4 flex flex-col gap-10">
               <section className="command-card p-10 flex flex-col items-center justify-center bg-[#00f5a0]/[0.02]">
                  <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                  <div className="mt-12 text-center space-y-4">
                     <div className="text-[12px] font-black uppercase text-[#8b949e] tracking-[0.4em]">Primary Cluster</div>
                     <div className="text-5xl font-black text-white italic capitalize tracking-tighter">{result.toxicity?.toxicity_class}</div>
                  </div>
               </section>

               <div className="grid grid-cols-2 gap-6">
                  {[
                    { l: "LogP", v: result.properties?.logp.toFixed(2), i: Activity },
                    { l: "TPSA", v: result.properties?.tpsa.toFixed(1), i: Database },
                    { l: "Mol Wt", v: result.properties?.mol_wt.toFixed(1), i: Zap },
                    { l: "Donors", v: result.properties?.h_donors, i: Box }
                  ].map((p, i) => (
                    <div key={i} className="command-card p-6 flex flex-col gap-4">
                       <p.i className="text-[#8b949e] w-4 h-4" />
                       <div>
                          <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest mb-1">{p.l}</div>
                          <div className="text-2xl font-black text-white italic">{p.v}</div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="command-card p-8 bg-white/5 border-emerald-500/10">
                  <div className="flex items-start gap-4 text-xs text-[#8b949e] leading-relaxed italic">
                     <Info className="w-5 h-5 text-[#00f5a0] shrink-0" />
                     <span>
                        Automated neural diagnostic identifies high-attribution structural motifs. 
                        Toxicity probability index calibrated at <b>{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</b> confidence for the {result.toxicity?.toxicity_class} network.
                     </span>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-10 border-4 border-dashed border-white/5 rounded-[4rem] max-w-6xl mx-auto w-full">
             <Radio className="w-32 h-32 mb-8 animate-pulse text-white" />
             <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">System Awaiting Vector</h2>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-24 pb-12 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold text-[#8b949e] uppercase tracking-[0.5em] gap-8">
        <div>© 2026 BIOAEGIS X-ALPHA | INDUSTRIAL DATA CLUSTER</div>
        <div className="flex gap-12">
           <span className="text-[#00f5a0]/40">Status: Operational</span>
           <span>Node: 08-Alpha</span>
        </div>
      </footer>
    </main>
  );
}
