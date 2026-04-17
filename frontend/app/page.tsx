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
  CircleDot
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
    { name: "Benzo[a]pyrene", smiles: "c1ccc2c(c1)cc3ccc4cccc5ccc2c3c45" }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white radial-center-glow pointer-events-auto overflow-x-hidden">
      <div className="max-w-[1700px] mx-auto px-16 py-24 space-y-40">
        
        {/* Elite Command Header - Balanced & Spaced */}
        <header className="flex items-center justify-between border-b border-white/20 pb-20">
          <div className="flex items-center gap-12">
            <div className="w-24 h-24 bg-[#00f5a0] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,245,160,0.6)]">
              <ShieldAlert className="text-[#0b0e14] w-14 h-14" />
            </div>
            <div className="space-y-4">
              <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-none">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-4 text-xl text-[#00f5a0] font-black uppercase tracking-[0.4em] bg-[#00f5a0]/15 px-8 py-3 rounded-full border border-[#00f5a0]/40 shadow-lg">
                    <Radio className="w-6 h-6 animate-pulse" /> Operational Core
                 </div>
                 <span className="text-sm text-[#8b949e] font-black uppercase tracking-widest italic">Reactor-Sync: Active [Cluster-08]</span>
              </div>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-16">
             <div className="text-right space-y-2">
                <div className="text-xs font-black uppercase tracking-[0.5em] text-[#8b949e]">System Throughput</div>
                <div className="text-4xl font-black text-white italic">14.8 GB/s Scan</div>
             </div>
             <div className="w-px h-24 bg-white/20" />
             <div className="flex items-center gap-8 bg-[#161b22] px-12 py-6 resize-none rounded-3xl border border-white/10 shadow-2xl">
                <Cpu className="text-[#00f5a0] w-10 h-10 animate-pulse" />
                <div className="flex flex-col">
                   <span className="text-xs font-black uppercase tracking-widest text-[#8b949e]">Status</span>
                   <span className="text-2xl font-black text-white uppercase tracking-widest">Active</span>
                </div>
             </div>
          </div>
        </header>

        {/* Hero Input Area - Massively Spaced and Fixed Readability */}
        <section className="space-y-24">
          <div className="space-y-12">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial"
            >
              Structural <span className="text-[#00f5a0]">Toxicity</span> <br/> Synthesis
            </motion.h2>
            <p className="text-4xl text-[#8b949e] max-w-5xl leading-relaxed italic font-bold">
               Orchestrate high-fidelity GNN structural analysis on any chemical identifier. <br/>
               Input a SMILES vector to initiate biological threat detection.
            </p>
          </div>

          <div className="command-card p-6 flex flex-col xl:flex-row items-center gap-12 group">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input Molecular Identifier (SMILES)..."
               className="command-input flex-1 p-12 min-h-[220px] focus:ring-0"
               style={{ color: '#ffffff', fontWeight: '900' }}
             />
             <div className="p-4 w-full xl:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group py-12 px-16"
               >
                 <span>{isAnalyzing ? "Processing..." : "Initiate Connection"}</span>
                 <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-10 px-6">
             <span className="text-sm font-black uppercase tracking-[0.5em] text-[#8b949e] mr-8 self-center">Standard Vectors:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00f5a0]/60 hover:bg-[#00f5a0]/15 transition-all text-sm font-black uppercase tracking-[0.2em] text-white/50 hover:text-white"
               >
                 {ex.name}
               </button>
             ))}
          </div>
        </section>

        {/* Main Analysis Architecture - High Volume Gaps */}
        <AnimatePresence>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-32 pt-20"
            >
              {/* 3D Visualizer Terminal - Full Width Focus */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-16">
                 <div className="flex items-center justify-between px-10">
                    <div className="flex items-center gap-8 text-[#00f5a0]">
                       <Box className="w-12 h-12 animate-spin-slow" />
                       <h3 className="text-3xl font-black uppercase tracking-[0.3em] italic">GNN Structural Attribution Heatmap</h3>
                    </div>
                    <div className="flex items-center gap-8 text-sm font-black uppercase text-[#8b949e] tracking-[0.5em] bg-white/10 px-8 py-4 rounded-full border border-white/20 shadow-md">
                       <span>Sentinel Vision Active</span>
                       <div className="w-4 h-4 bg-[#00f5a0] rounded-full animate-ping" />
                    </div>
                 </div>
                 <div className="command-card relative h-[900px] overflow-visible !p-0 border-4 border-[#00f5a0]/20 shadow-[0_0_100px_rgba(0,245,160,0.15)]">
                    <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                    <div className="absolute bottom-16 left-16 z-20 bg-[#0d1117]/95 backdrop-blur-3xl px-14 py-8 rounded-3xl border border-[#00f5a0]/40 flex items-center gap-8 shadow-2xl">
                       <Target className="w-12 h-12 text-[#00f5a0]" />
                       <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-[0.5em] text-[#8b949e]">Processing Mode</span>
                          <span className="text-2xl font-black uppercase tracking-widest text-white italic">Holographic Heatmap Sync</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Data Acquisition Deck - Synchronized Spacing */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-24">
                 
                 {/* Massive Isolated Gauge - Huge Buffer */}
                 <section className="command-card p-32 flex flex-col items-center justify-center bg-gradient-to-t from-[#00f5a0]/[0.08] to-transparent border-[#00f5a0]/30">
                    <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                    <div className="mt-24 text-center space-y-8 pt-20 border-t border-white/20 w-full">
                       <span className="text-base font-black uppercase text-[#8b949e] tracking-[0.6em] block">Threat Classification</span>
                       <div className="text-7xl font-black text-white italic uppercase tracking-tighter leading-tight break-words">{result.toxicity?.toxicity_class}</div>
                    </div>
                 </section>

                 {/* Property Grid - High Readability & Icon Pairing */}
                 <div className="grid grid-cols-2 gap-12">
                    {[
                      { l: "LogP Value", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0", d: "Hydrophobicity" },
                      { l: "TPSA Index", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff", d: "Polar Surface" },
                      { l: "Mol Weight", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15", d: "Molecular Density" },
                      { l: "H-Donors", v: result.properties?.h_donors, i: Database, c: "#f472b6", d: "Proton Affiliation" }
                    ].map((p, i) => (
                      <div key={i} className="command-card !p-16 group border-white/10 hover:border-[#00f5a0]/60 transition-all flex flex-col items-center text-center shadow-2xl">
                         <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10 mb-10 group-hover:bg-[#161b22] transition-colors shadow-inner">
                            <p.i style={{ color: p.c }} className="w-12 h-12" />
                         </div>
                         <div className="space-y-4">
                            <div className="text-sm font-black uppercase text-[#8b949e] tracking-[0.4em]">{p.l}</div>
                            <div className="text-5xl font-black text-white italic tracking-tighter">{p.v}</div>
                            <div className="text-xs font-bold uppercase text-[#8b949e]/50 tracking-widest">{p.d}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* AI Verdict Summary - High Contrast Breathing Room */}
                 <div className="command-card p-20 bg-white/10 border-[#00f5a0]/30 shadow-2xl">
                    <div className="flex flex-col gap-10">
                       <div className="flex items-center gap-8">
                          <div className="p-5 bg-[#00f5a0]/20 rounded-2xl border border-[#00f5a0]/50 shadow-[0_0_40px_rgba(0,245,160,0.3)]">
                             <CircleDot className="w-12 h-12 text-[#00f5a0] animate-pulse" />
                          </div>
                          <span className="text-3xl font-black uppercase text-white tracking-[0.3em] italic">Neural Diagnostic</span>
                       </div>
                       <p className="text-3xl text-[#8b949e] leading-[1.8] italic font-medium">
                          Attribution motifs in the <span className="text-white font-black underline decoration-[#00f5a0]/60 underline-offset-8">{result.toxicity?.toxicity_class}</span> cluster 
                          signify an extreme structural risk profile. 
                          Synth-Confidence: <span className="text-[#00f5a0] font-black text-5xl italic">{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</span>.
                       </p>
                    </div>
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-80 opacity-5 border-4 border-dashed border-white/20 rounded-[5rem] group transition-all hover:opacity-10 cursor-default">
               <Terminal className="w-72 h-72 mb-20 text-white" />
               <h2 className="text-9xl font-black italic tracking-tighter text-white uppercase text-center leading-none">Awaiting High-Fidelity <br/> Interaction Input</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Definitive Footer - Spaced to Perfection */}
        <footer className="pt-40 pb-24 flex flex-col xl:flex-row items-center justify-between border-t border-white/20 text-base font-black text-[#8b949e] uppercase tracking-[0.7em] gap-20 text-center xl:text-left">
          <div className="flex items-center gap-12">
             <div className="w-4 h-4 bg-[#00f5a0] rounded-full shadow-[0_0_25px_#00f5a0]" />
             <span>© 2026 BIOAEGIS X-ALPHA | NUCLEAR INDUSTRIAL INTERFACE LAYER [VERSION 2.0]</span>
          </div>
          <div className="flex flex-wrap justify-center gap-24">
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/50 tracking-widest">Core Status</span>
                <span className="text-[#00f5a0]">OPERATIONAL</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/50 tracking-widest">Neural Cluster</span>
                <span>08-ALPHA-SYNTH</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/50 tracking-widest">Access Layer</span>
                <span className="text-[#00f5a0]">ENCRYPTED</span>
             </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
