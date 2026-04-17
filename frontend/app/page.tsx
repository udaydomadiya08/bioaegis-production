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
  Box,
  Activity,
  ArrowRight,
  Target,
  CircleDot,
  Dna,
  Binary,
  Microscope,
  Atom
} from "lucide-react";
import MoleculeViewer from "@/components/MoleculeViewer";
import Molecule3D from "@/components/Molecule3D";
import ToxicityGauge from "@/components/ToxicityGauge";

interface AnalysisResult {
  smiles: string;
  valid: boolean;
  overall_toxicity_index: number;
  overall_percent: number;
  expert_profiling: Record<string, number>;
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
  atom_scores?: number[];
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
        alert(data.error || "Inference Failure.");
      }
    } catch (err) {
      console.error(err);
      alert("System Offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const examples = [
    { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
    { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
    { name: "Benzo[a]pyrene", smiles: "c1ccc2c(c1)cc3ccc4cccc5ccc2c3c45" }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white radial-center-glow pointer-events-auto">
      <div className="max-w-[1600px] mx-auto px-16 py-24 space-y-40">
        
        {/* Elite Command Header - FIX: Badge-to-Text Gap */}
        <header className="flex items-center justify-between border-b-4 border-white/10 pb-20">
          <div className="flex items-center gap-16">
            <div className="w-28 h-28 bg-[#00f5a0] rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(0,245,160,0.5)]">
              <Dna className="text-[#0b0e14] w-16 h-16" />
            </div>
            <div className="space-y-6">
              <h1 className="text-8xl font-black italic text-white uppercase leading-none tracking-normal">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="flex items-center gap-20"> {/* INCREASED GAP TO 80px */}
                 <div className="flex items-center gap-6 text-base text-[#00f5a0] font-black uppercase bg-[#00f5a0]/15 px-8 py-4 rounded-full border-2 border-[#00f5a0]/40">
                    <Radio className="w-6 h-6 animate-pulse" /> Inference Online
                 </div>
                 <span className="text-xl text-[#8b949e] font-black uppercase italic">Model Cluster: GNN-PRO-08</span>
              </div>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-24">
             <div className="text-right space-y-3">
                <div className="text-sm font-black uppercase text-[#8b949e]">Prediction Meta</div>
                <div className="text-4xl font-black text-white italic tracking-normal">142ms</div>
             </div>
             <div className="w-px h-24 bg-white/20" />
             <div className="flex items-center gap-8 bg-[#161b22] px-12 py-8 rounded-[2rem] border-2 border-white/5 shadow-2xl">
                <Microscope className="text-[#00f5a0] w-12 h-12" />
                <span className="text-2xl font-black uppercase text-white leading-none">Diagnostic Deck</span>
             </div>
          </div>
        </header>

        {/* Hero Area */}
        <section className="space-y-32">
          <div className="space-y-12">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial !text-8xl tracking-normal"
            >
              Molecular <span className="text-[#00f5a0]">Toxicity</span> <br/> Inference Engine
            </motion.h2>
            <p className="text-4xl text-white/50 max-w-5xl leading-tight italic font-black tracking-normal">
               High-precision risk modeling via Graph Neural Network structural attribution.
            </p>
          </div>

          <div className="command-card !p-4 flex flex-col xl:flex-row items-center gap-12 group border-4 border-white/10 bg-[#0b0e14]">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input Molecular String (SMILES)..."
               className="command-input flex-1 p-16 min-h-[220px] focus:ring-0 text-white font-black"
               style={{ fontSize: '3rem', lineHeight: '1', letterSpacing: 'normal' }}
             />
             <div className="p-8 w-full xl:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group py-12 px-24 rounded-3xl"
               >
                 <span className="text-4xl">Run Analysis Engine</span>
                 <ArrowRight className="w-14 h-14 group-hover:translate-x-6 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-12 px-10">
             <span className="text-base font-black uppercase text-white/30 mr-12 self-center">Structural Examples:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-16 py-6 rounded-3xl bg-white/5 border-2 border-white/10 hover:border-[#00f5a0] hover:bg-[#00f5a0]/10 transition-all text-lg font-black uppercase text-white/40 hover:text-white"
               >
                 {ex.name}
               </button>
             ))}
          </div>
        </section>

        {/* Analysis Results - FIX: Horizontal Sync & Dead Space */}
        <AnimatePresence>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-24 pt-20"
            >
              <div className="lg:col-span-12 xl:col-span-8 space-y-24">
                 
                 {/* MASSIVE HERO: OVERALL TOXICITY INDEX */}
                 <div className="command-card flex flex-col items-center justify-center py-32 bg-[#0b0e14] border-4 border-[#00f5a0]/40 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#00f5a0]/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00f5a0]/5 to-transparent pointer-events-none" />
                    
                    <span className="text-3xl font-black uppercase text-white/40 mb-8 tracking-[0.5em] italic">Overall Toxicity Index</span>
                    
                    <div className="relative">
                       <div className="text-[18rem] font-black italic text-white leading-none tracking-tighter drop-shadow-[0_0_120px_rgba(0,245,160,0.3)]">
                          {result.overall_toxicity_index.toFixed(4)}
                       </div>
                       <div className="absolute -right-24 bottom-12 text-6xl font-black text-[#00f5a0] italic">/ 10.0</div>
                    </div>

                    <div className="flex items-center gap-16 mt-12">
                       <div className="h-4 w-96 bg-white/10 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.overall_percent}%` }}
                            className="h-full bg-gradient-to-r from-[#00f5a0] to-[#00d2ff]"
                          />
                       </div>
                       <span className="text-5xl font-black italic text-white">{result.overall_percent.toFixed(2)}%</span>
                    </div>

                    <div className="mt-20 flex items-center gap-12 text-[#00f5a0] bg-[#00f5a0]/10 px-12 py-4 rounded-3xl border-2 border-[#00f5a0]/30 shadow-2xl">
                       <ShieldAlert className="w-10 h-10" />
                       <span className="text-3xl font-black uppercase italic tracking-normal">Status: {result.overall_toxicity_index > 5 ? 'High Risk' : 'Standard'}</span>
                    </div>
                 </div>

                 {/* 13-EXPERT MATRIX GRID */}
                 <div className="space-y-12">
                    <div className="flex items-center gap-12 text-white/40 px-8">
                       <Binary className="w-10 h-10" />
                       <h4 className="text-3xl font-black uppercase italic tracking-widest">Ensemble Expert Profiling (13 Vectors)</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                       {Object.entries(result.expert_profiling).map(([name, value], idx) => (
                          <div key={idx} className="command-card !p-12 border-2 border-white/5 bg-[#0b0e14]/50 group hover:border-[#00f5a0]/60 transition-all">
                             <div className="flex items-center justify-between mb-8">
                                <span className="text-sm font-black uppercase text-white/40 tracking-wider truncate mr-4">{name}</span>
                                <span className={`text-xl font-black italic ${value > 50 ? 'text-[#ff4b4b]' : 'text-[#00f5a0]'}`}>{value.toFixed(1)}%</span>
                             </div>
                             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${value}%` }}
                                   className={`h-full ${value > 50 ? 'bg-[#ff4b4b]' : 'bg-[#00f5a0]'}`}
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Structural Viewer Section */}
                 <div className="space-y-12">
                   <div className="flex items-center gap-12 text-[#00f5a0] px-8">
                      <Atom className="w-12 h-12 animate-spin-slow" />
                      <h3 className="text-4xl font-black uppercase italic leading-none tracking-normal">GNN Structural Attribution</h3>
                   </div>
                   <div className="command-card relative h-[600px] overflow-hidden !p-0 border-4 border-white/20">
                      <Molecule3D pdb={result.pdb || ""} atomScores={result.atom_scores} />
                      <div className="absolute bottom-10 left-10 z-20 bg-[#0d1117]/95 px-10 py-6 rounded-3xl border-2 border-[#00f5a0]/60 flex items-center gap-8 shadow-2xl">
                         <Target className="w-10 h-10 text-[#00f5a0]" />
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-black uppercase text-white/40">Diagnostic Sync</span>
                            <span className="text-xl font-black uppercase text-white italic">Atom Heatmap</span>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Information Deck (Right Column) */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-24">
                 
                 {/* Property Grid */}
                 <div className="grid grid-cols-1 gap-12">
                    {[
                      { l: "LogP Value", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0", t: "Hydrophobicity" },
                      { l: "TPSA Index", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff", t: "Polarity" },
                      { l: "Atomic Weight", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15", t: "Mass Calculation" },
                      { l: "Heavy Atoms", v: result.properties?.heavy_atoms, i: Box, c: "#a855f7", t: "Structural Index" }
                    ].map((p, i) => (
                      <div key={i} className="command-card !p-12 group border-4 border-white/5 hover:border-[#00f5a0] transition-all flex flex-row items-center gap-12 bg-[#0b0e14] shadow-4xl">
                         <div className="w-28 h-28 rounded-3xl bg-white/5 flex items-center justify-center border-2 border-white/10 group-hover:bg-[#00f5a0]/15 transition-all shrink-0">
                            <p.i style={{ color: p.c }} className="w-14 h-14" />
                         </div>
                         <div className="flex flex-col gap-2 text-left"> 
                            <div className="text-xl font-black uppercase text-white/40 leading-none italic">{p.l}</div>
                            <div className="text-6xl font-black text-white italic leading-none">{p.v}</div>
                            <div className="text-sm font-black uppercase text-[#00f5a0] bg-[#00f5a0]/10 px-6 py-2 rounded-lg inline-block mt-2 self-start tracking-widest">
                               {p.t}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* AI Verdict Summary */}
                 <div className="command-card p-24 bg-[#0b0e14] border-4 border-white/10">
                    <div className="flex flex-col gap-16">
                       <div className="flex items-center gap-10">
                          <Binary className="w-12 h-12 text-[#00f5a0]" />
                          <span className="text-3xl font-black uppercase text-white italic leading-none tracking-normal">Ensemble Consensus</span>
                       </div>
                       <p className="text-3xl text-white/50 leading-relaxed italic font-black tracking-normal">
                          BioAegis 13-Expert analysis of the provided SMILES string indicates an overall toxicity index of 
                          <span className="text-white mx-4 underline decoration-[#00f5a0]/80 underline-offset-8">{result.overall_toxicity_index.toFixed(4)}</span>.
                          Structural risk clusters identified in the the {Object.entries(result.expert_profiling).sort((a,b) => b[1]-a[1])[0][0]} sector.
                       </p>
                    </div>
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-96 opacity-5 border-8 border-dashed border-white/10 rounded-[6rem] bg-white/[0.01]">
               <Microscope className="w-96 h-96 mb-20 text-white" />
               <h2 className="text-[10rem] font-black italic text-white uppercase text-center leading-none tracking-normal">Awaitng Input</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Tactical Footer */}
        <footer className="pt-40 pb-20 flex flex-col xl:flex-row items-center justify-between border-t-8 border-white/10 text-2xl font-black text-[#8b949e] uppercase gap-24 tracking-normal">
          <div className="flex items-center gap-12">
             <div className="w-10 h-10 bg-[#00f5a0] rounded-full shadow-[0_0_50px_#00f5a0]" />
             <span>© 2026 BIOAEGIS DISCOVERY HUB</span>
          </div>
          <div className="flex flex-wrap justify-center gap-40">
             <div className="flex flex-col gap-4">
                <span className="text-sm text-white/40">Network Status</span>
                <span className="text-[#00f5a0]">OPERATIONAL-CLUSTER-08</span>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-sm text-white/40">Security Protocols</span>
                <span className="text-[#00f5a0]">ENCRYPTED-NODE</span>
             </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
