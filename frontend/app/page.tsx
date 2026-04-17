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
    <div className="min-h-screen bg-[#0d1117] text-white radial-center-glow pointer-events-auto">
      <div className="max-w-[1500px] mx-auto px-12 py-16 space-y-24">
        
        {/* Professional Command Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-[#00f5a0] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.4)]">
              <ShieldAlert className="text-[#0b0e14] w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 text-xs text-[#00f5a0] font-black uppercase tracking-[0.4em] bg-[#00f5a0]/10 px-4 py-2 rounded-full border border-[#00f5a0]/30 shadow-sm">
                    <Radio className="w-4 h-4 animate-pulse" /> Operational
                 </div>
                 <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-widest italic">Node: reactor-08</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
             <div className="text-right space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8b949e]">Throughput</div>
                <div className="text-xl font-bold text-white italic">14.2 GB/s</div>
             </div>
             <div className="w-px h-12 bg-white/10" />
             <div className="flex items-center gap-4 bg-[#161b22] px-8 py-4 rounded-2xl border border-white/5 shadow-inner">
                <Cpu className="text-[#00f5a0] w-7 h-7 animate-pulse" />
                <span className="text-sm font-black uppercase text-white tracking-widest">Active</span>
             </div>
          </div>
        </header>

        {/* Hero Area - Professional Perfect Scale */}
        <section className="space-y-16">
          <div className="space-y-8">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial !text-6xl"
            >
              Structural <span className="text-[#00f5a0]">Toxicity</span> <br/> Synthesis
            </motion.h2>
            <p className="text-2xl text-[#8b949e] max-w-3xl leading-relaxed italic font-bold">
               Orchestrate high-fidelity chemical analysis via GNN structural threat detection.
            </p>
          </div>

          <div className="command-card !p-2 flex flex-col md:flex-row items-center gap-6 group">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input Molecular Identifier (SMILES)..."
               className="command-input flex-1 p-10 min-h-[140px] focus:ring-0"
               style={{ color: '#ffffff', fontWeight: '800' }}
             />
             <div className="p-4 w-full md:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group"
               >
                 <span>Initiate Connection</span>
                 <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-6 px-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b949e] mr-4 self-center font-bold">Try Examples:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-8 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00f5a0]/40 hover:bg-[#00f5a0]/5 transition-all text-xs font-black uppercase tracking-[0.1em] text-white/50 hover:text-white"
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
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-12"
            >
              {/* 3D Visualizer Terminal */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-12">
                 <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4 text-[#00f5a0]">
                       <Box className="w-8 h-8 animate-spin-slow" />
                       <h3 className="text-2xl font-black uppercase tracking-[0.2em] italic">GNN Structural Attribution Heatmap</h3>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-[#8b949e] tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
                       <span>Sentinel Vision Active</span>
                       <div className="w-2.5 h-2.5 bg-[#00f5a0] rounded-full animate-ping" />
                    </div>
                 </div>
                 <div className="command-card relative h-[750px] overflow-visible !p-0 border-2 border-[#00f5a0]/10">
                    <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                    <div className="absolute bottom-10 left-10 z-20 bg-[#0d1117]/90 backdrop-blur-xl px-10 py-6 rounded-2xl border border-[#00f5a0]/20 flex items-center gap-6 shadow-2xl">
                       <Target className="w-8 h-8 text-[#00f5a0]" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8b949e]">Processing Layer</span>
                          <span className="text-xl font-black uppercase tracking-widest text-white italic">Thermal Attribution</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Data Acquisition Deck */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-16">
                 
                 {/* Massive Isolated Gauge */}
                 <section className="command-card p-24 flex flex-col items-center justify-center bg-gradient-to-t from-[#00f5a0]/[0.05] to-transparent border-[#00f5a0]/20">
                    <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                    <div className="mt-16 text-center space-y-6 pt-12 border-t border-white/10 w-full">
                       <span className="text-[11px] font-black uppercase text-[#8b949e] tracking-[0.4em] block font-bold">Primary Threat Class</span>
                       <div className="text-6xl font-black text-white italic uppercase tracking-tighter leading-tight">{result.toxicity?.toxicity_class}</div>
                    </div>
                 </section>

                 {/* Property Grid - Icon Driven Recalibration */}
                 <div className="grid grid-cols-2 gap-8">
                    {[
                      { l: "LogP", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0" },
                      { l: "TPSA", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff" },
                      { l: "Mol Wt", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15" },
                      { l: "H-Donors", v: result.properties?.h_donors, i: Database, c: "#f472b6" }
                    ].map((p, i) => (
                      <div key={i} className="command-card !p-12 group border-white/5 hover:border-[#00f5a0]/50 transition-all flex flex-col items-center text-center shadow-xl">
                         <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 mb-8 group-hover:bg-[#161b22] transition-colors shadow-inner">
                            <p.i style={{ color: p.c }} className="w-12 h-12" />
                         </div>
                         <div className="space-y-3">
                            <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-[0.3em] font-bold">{p.l} VALUE</div>
                            <div className="text-4xl font-black text-white italic tracking-tighter leading-none">{p.v}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* AI Verdict Summary */}
                 <div className="command-card p-16 bg-white/5 border-emerald-500/15">
                    <div className="flex flex-col gap-8">
                       <div className="flex items-center gap-6">
                          <div className="p-4 bg-[#00f5a0]/15 rounded-2xl border border-[#00f5a0]/30 shadow-lg">
                             <CircleDot className="w-8 h-8 text-[#00f5a0]" />
                          </div>
                          <span className="text-2xl font-black uppercase text-white tracking-[0.2em] italic font-bold">Neural Diagnostic</span>
                       </div>
                       <p className="text-2xl text-[#8b949e] leading-relaxed italic font-medium">
                          Structural motifs in the <span className="text-white font-black underline decoration-[#00f5a0]/40 underline-offset-6">{result.toxicity?.toxicity_class}</span> cluster 
                          signify a significant elevation in risk. 
                          Confidence: <span className="text-[#00f5a0] font-black text-3xl italic">{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</span>.
                       </p>
                    </div>
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-56 opacity-5 border-4 border-dashed border-white/10 rounded-[4rem]">
               <Terminal className="w-48 h-48 mb-12 text-white" />
               <h2 className="text-7xl font-black italic tracking-tighter text-white uppercase text-center leading-none">Awaiting Interaction</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Definitive Footer */}
        <footer className="pt-32 pb-16 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[12px] font-black text-[#8b949e] uppercase tracking-[0.5em] gap-12">
          <div className="flex items-center gap-6">
             <div className="w-2.5 h-2.5 bg-[#00f5a0] rounded-full shadow-[0_0_10px_#00f5a0]" />
             <span>© 2026 BIOAEGIS X-ALPHA | INDUSTRIAL DATA CLUSTERS</span>
          </div>
          <div className="flex gap-16">
             <span className="text-[#00f5a0]/40">Operational</span>
             <span>Cluster: 08-Alpha</span>
             <span>US-EAST</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
