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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] radial-center-glow pointer-events-auto overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-12 py-20 space-y-32">
        
        {/* Elite Command Header - Balanced & Spaced */}
        <header className="flex items-center justify-between border-b border-white/10 pb-16">
          <div className="flex items-center gap-10">
            <div className="w-20 h-20 bg-[#00f5a0] rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(0,245,160,0.5)]">
              <ShieldAlert className="text-[#0b0e14] w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 text-sm text-[#00f5a0] font-black uppercase tracking-[0.4em] bg-[#00f5a0]/10 px-5 py-2 rounded-full border border-[#00f5a0]/30 shadow-sm">
                    <Radio className="w-4 h-4 animate-pulse" /> Synthesis Engine Online
                 </div>
                 <span className="text-xs text-[#8b949e] font-bold uppercase tracking-widest italic">Node-ID: Alpha-Reactor-08</span>
              </div>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-12">
             <div className="text-right space-y-1">
                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#8b949e]">Neural Throughput</div>
                <div className="text-2xl font-black text-white italic">2.4m Atoms/sec</div>
             </div>
             <div className="w-px h-16 bg-white/10" />
             <div className="flex items-center gap-5 bg-[#161b22] px-10 py-5 rounded-2xl border border-white/10 shadow-lg">
                <Cpu className="text-[#00f5a0] w-8 h-8 animate-pulse" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#8b949e]">System State</span>
                   <span className="text-lg font-bold text-white uppercase tracking-widest">Active</span>
                </div>
             </div>
          </div>
        </header>

        {/* Hero Input Area - Massively Spaced and Fixed Readability */}
        <section className="space-y-16">
          <div className="space-y-8">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial"
            >
              Structural <span className="text-[#00f5a0]">Toxicity</span> <br/> Synthesis
            </motion.h2>
            <p className="text-3xl text-[#8b949e] max-w-4xl leading-relaxed italic font-medium">
               Input a molecular vector or SMILES identifier to initiate <br/>
               high-fidelity GNN structural threat detection.
            </p>
          </div>

          <div className="command-card p-4 flex flex-col xl:flex-row items-center gap-8 group">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Enter Molecule Identifier (SMILES)..."
               className="command-input flex-1 p-10 min-h-[160px] focus:ring-0"
               style={{ color: '#ffffff', fontWeight: '800' }}
             />
             <div className="p-4 w-full xl:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group py-8 px-12"
               >
                 <span>{isAnalyzing ? "Processing..." : "Initiate Connection"}</span>
                 <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-6 px-4">
             <span className="text-xs font-black uppercase tracking-[0.4em] text-[#8b949e] mr-6 self-center">Standard Vectors:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-8 py-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#00f5a0]/50 hover:bg-[#00f5a0]/10 transition-all text-sm font-black uppercase tracking-widest text-white/50 hover:text-white"
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
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-24 pt-16"
            >
              {/* 3D Visualizer Terminal - Full Width Focus */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-12">
                 <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-5 text-[#00f5a0]">
                       <Box className="w-8 h-8 animate-spin-slow" />
                       <h3 className="text-2xl font-black uppercase tracking-[0.3em] italic">GNN Structural Attribution</h3>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-black uppercase text-[#8b949e] tracking-[0.4em] bg-white/5 px-6 py-2 rounded-full border border-white/10">
                       <span>Sentinel Vision Active</span>
                       <div className="w-3 h-3 bg-[#00f5a0] rounded-full animate-ping" />
                    </div>
                 </div>
                 <div className="command-card relative h-[800px] overflow-visible !p-0 border-4 border-[#00f5a0]/10">
                    <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                    <div className="absolute bottom-12 left-12 z-20 bg-[#0d1117]/90 backdrop-blur-2xl px-10 py-6 rounded-2xl border border-[#00f5a0]/30 flex items-center gap-6 shadow-2xl">
                       <Target className="w-8 h-8 text-[#00f5a0]" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8b949e]">Rendering Mode</span>
                          <span className="text-lg font-black uppercase tracking-widest text-white italic">Holographic GNN Heatmap</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Data Acquisition Deck - Synchronized Spacing */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-16">
                 
                 {/* Massive Isolated Gauge - Huge Buffer */}
                 <section className="command-card p-24 flex flex-col items-center justify-center bg-gradient-to-t from-[#00f5a0]/[0.05] to-transparent border-[#00f5a0]/20">
                    <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                    <div className="mt-20 text-center space-y-6 pt-16 border-t border-white/10 w-full">
                       <span className="text-xs font-black uppercase text-[#8b949e] tracking-[0.6em] block">Primary Class Identified</span>
                       <div className="text-6xl font-black text-white italic uppercase tracking-tighter leading-tight">{result.toxicity?.toxicity_class}</div>
                    </div>
                 </section>

                 {/* Property Grid - High Readability & Icon Pairing */}
                 <div className="grid grid-cols-2 gap-10">
                    {[
                      { l: "LogP Value", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0", d: "Hydrophobicity Index" },
                      { l: "TPSA Index", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff", d: "Polar Surface Score" },
                      { l: "Mol Weight", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15", d: "Molecular Density" },
                      { l: "H-Donors", v: result.properties?.h_donors, i: Database, c: "#f472b6", d: "Proton Affiliation" }
                    ].map((p, i) => (
                      <div key={i} className="command-card !p-12 group border-white/5 hover:border-[#00f5a0]/50 transition-all flex flex-col items-center text-center">
                         <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 group-hover:bg-[#161b22] transition-colors shadow-inner">
                            <p.i style={{ color: p.c }} className="w-10 h-10" />
                         </div>
                         <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-[0.3em]">{p.l}</div>
                            <div className="text-4xl font-black text-white italic tracking-tighter">{p.v}</div>
                            <div className="text-[9px] font-bold uppercase text-[#8b949e]/40 tracking-widest">{p.d}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* AI Verdict Summary - High Contrast Breathing Room */}
                 <div className="command-card p-16 bg-white/5 border-[#00f5a0]/20">
                    <div className="flex flex-col gap-8">
                       <div className="flex items-center gap-6">
                          <div className="p-4 bg-[#00f5a0]/15 rounded-2xl border border-[#00f5a0]/40 shadow-[0_0_20px_rgba(0,245,160,0.2)]">
                             <CircleDot className="w-10 h-10 text-[#00f5a0] animate-pulse" />
                          </div>
                          <span className="text-2xl font-black uppercase text-white tracking-[0.2em] italic">AI Neural Analysis</span>
                       </div>
                       <p className="text-2xl text-[#8b949e] leading-[1.8] italic">
                          Structural attribution identified in the <span className="text-white font-black underline decoration-[#00f5a0]/50">{result.toxicity?.toxicity_class}</span> cluster 
                          signifies a critical elevation in biological risk vectors. 
                          Neural synth-confidence is stabilized at <span className="text-[#00f5a0] font-black text-3xl italic">{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</span>.
                       </p>
                    </div>
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-64 opacity-5 border-4 border-dashed border-white/10 rounded-[4rem] group transition-opacity hover:opacity-10 cursor-default">
               <Terminal className="w-56 h-56 mb-16 text-white" />
               <h2 className="text-8xl font-black italic tracking-tighter text-white uppercase text-center leading-none">Awaiting High-Fidelity <br/> Vector Input</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Definitive Footer - Spaced to Perfection */}
        <footer className="pt-32 pb-20 flex flex-col md:flex-row items-center justify-between border-t border-white/10 text-sm font-black text-[#8b949e] uppercase tracking-[0.6em] gap-16 text-center md:text-left">
          <div className="flex items-center gap-10">
             <div className="w-3 h-3 bg-[#00f5a0] rounded-full shadow-[0_0_15px_#00f5a0]" />
             <span>© 2026 BIOAEGIS X-ALPHA | NUCLEAR INDUSTRIAL INTERFACE LAYER</span>
          </div>
          <div className="flex flex-wrap justify-center gap-20">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50">Core Status</span>
                <span className="text-[#00f5a0]">Operational</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50">Network Cluster</span>
                <span>08-Alpha</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50">Security Level</span>
                <span className="text-[#00f5a0]">Maximum</span>
             </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
