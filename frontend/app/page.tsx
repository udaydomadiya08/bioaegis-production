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
        alert(data.error || "Inference Failure: Invalid Structure Pattern.");
      }
    } catch (err) {
      console.error(err);
      alert("Neural Bridge: Fatal Disconnect.");
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
    <div className="min-h-screen bg-[#0d1117] text-white radial-center-glow pointer-events-auto selection:bg-[#00f5a0] selection:text-[#0b0e14]">
      <div className="max-w-[1600px] mx-auto px-16 py-24 space-y-32">
        
        {/* Elite Bioinformatics Command Header */}
        <header className="flex items-center justify-between border-b-4 border-white/10 pb-16">
          <div className="flex items-center gap-12">
            <div className="w-24 h-24 bg-[#00f5a0] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,245,160,0.6)]">
              <Dna className="text-[#0b0e14] w-14 h-14" />
            </div>
            <div className="space-y-4">
              <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="flex items-center gap-10">
                 <div className="flex items-center gap-4 text-sm text-[#00f5a0] font-black uppercase tracking-[0.5em] bg-[#00f5a0]/15 px-6 py-3 rounded-full border border-[#00f5a0]/40 shadow-[0_0_20px_rgba(0,245,160,0.1)]">
                    <Radio className="w-5 h-5 animate-pulse" /> Inference Cluster Online
                 </div>
                 <span className="text-xs text-[#8b949e] font-black uppercase tracking-[0.6em] italic">Model: GNN-PRO-NODE-08</span>
              </div>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-16">
             <div className="text-right space-y-2">
                <div className="text-[12px] font-black uppercase tracking-[0.5em] text-[#8b949e]">Inference Latency</div>
                <div className="text-3xl font-black text-white italic">142ms / Prediction</div>
             </div>
             <div className="w-px h-20 bg-white/20" />
             <div className="flex items-center gap-6 bg-[#161b22] px-10 py-6 rounded-3xl border-2 border-white/5 shadow-2xl">
                <Microscope className="text-[#00f5a0] w-10 h-10" />
                <span className="text-lg font-black uppercase text-white tracking-widest leading-none">Diagnostic Deck</span>
             </div>
          </div>
        </header>

        {/* Hero Input Area - Tactically Spaced */}
        <section className="space-y-24">
          <div className="space-y-12 text-center md:text-left">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial !text-7xl leading-tight"
            >
              Molecular <span className="text-[#00f5a0]">Toxicity</span> <br/> Inference Engine
            </motion.h2>
            <p className="text-3xl text-white/50 max-w-4xl leading-relaxed italic font-bold">
               Orchestrate advanced chemical risk modeling via <br/>
               Graph Neural Network structural threat detection.
            </p>
          </div>

          <div className="command-card !p-3 flex flex-col xl:flex-row items-center gap-10 group border-4 border-white/5 bg-[#0b0e14]">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input SMILES Vector Identifier..."
               className="command-input flex-1 p-12 min-h-[180px] focus:ring-0"
               style={{ color: '#ffffff', fontWeight: '900' }}
             />
             <div className="p-6 w-full xl:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group py-10 px-16 rounded-2xl"
               >
                 <span>Run Analysis Engine</span>
                 <ArrowRight className="w-10 h-10 group-hover:translate-x-4 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-10 px-6">
             <span className="text-xs font-black uppercase tracking-[0.5em] text-white/30 mr-8 self-center">Structural Examples:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-12 py-5 rounded-2xl bg-white/5 border-2 border-white/10 hover:border-[#00f5a0]/100 hover:bg-[#00f5a0]/10 transition-all text-sm font-black uppercase tracking-[0.3em] text-white/40 hover:text-white"
               >
                 {ex.name}
               </button>
             ))}
          </div>
        </section>

        {/* Tactical Result Deck - Massive Gaps & Sync */}
        <AnimatePresence>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-20 pt-16"
            >
              {/* 3D Visualizer Terminal - Clean structural sync */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-16">
                 <div className="flex items-center justify-between px-10">
                    <div className="flex items-center gap-10 text-[#00f5a0]">
                       <Atom className="w-14 h-14 animate-spin-slow" />
                       <h3 className="text-4xl font-black uppercase tracking-[0.3em] italic leading-none">GNN Structural Attribution</h3>
                    </div>
                    <div className="flex items-center gap-10 text-xs font-black uppercase text-white/40 tracking-[0.6em] bg-white/10 px-10 py-5 rounded-full border-2 border-white/20">
                       <span>Neural Vision active</span>
                       <div className="w-5 h-5 bg-[#00f5a0] rounded-full animate-ping" />
                    </div>
                 </div>
                 <div className="command-card relative h-[650px] overflow-hidden !p-0 border-4 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                    <div className="absolute bottom-12 left-12 z-20 bg-[#0d1117]/95 backdrop-blur-3xl px-12 py-8 rounded-3xl border-2 border-[#00f5a0]/40 flex items-center gap-10 shadow-2xl">
                       <Target className="w-12 h-12 text-[#00f5a0]" />
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-black uppercase tracking-[0.6em] text-white/40">Diagnostic Layer</span>
                          <span className="text-2xl font-black uppercase tracking-widest text-white italic">Atom-Wise Heatmap sync</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Information Deck - Iconic Dominance */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-20">
                 
                 {/* Massive Isolated Gauge - Huge Spacing */}
                 <section className="command-card p-32 flex flex-col items-center justify-center bg-[#0b0e14] border-4 border-[#00f5a0]/30 shadow-[0_0_80px_rgba(0,245,160,0.1)]">
                    <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                    <div className="mt-24 text-center space-y-10 pt-20 border-t-2 border-white/10 w-full">
                       <span className="text-base font-black uppercase text-white/40 tracking-[0.7em] block">Predicted Toxicity Class</span>
                       <div className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none break-words underline decoration-[#00f5a0]/30 decoration-8 underline-offset-8">{result.toxicity?.toxicity_class}</div>
                    </div>
                 </section>

                 {/* Tactical Property Grid - ICON + LABEL SYNC */}
                 <div className="grid grid-cols-2 gap-12">
                    {[
                      { l: "LogP Value", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0", t: "Hydrophobicity" },
                      { l: "TPSA Index", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff", t: "Polarity" },
                      { l: "Mol Weight", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15", t: "Atomic Mass" },
                      { l: "H-Donors", v: result.properties?.h_donors, i: Database, c: "#f472b6", t: "Binding Potential" }
                    ].map((p, i) => (
                      <div key={i} className="command-card !p-16 group border-4 border-white/5 hover:border-[#00f5a0]/80 transition-all flex flex-col items-center text-center shadow-3xl bg-[#0b0e14]">
                         <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border-2 border-white/10 mb-12 group-hover:bg-[#00f5a0]/10 group-hover:border-[#00f5a0]/40 transition-all shadow-inner">
                            <p.i style={{ color: p.c }} className="w-14 h-14" />
                         </div>
                         <div className="space-y-6">
                            <div className="text-sm font-black uppercase text-white/30 tracking-[0.5em] leading-none">{p.l}</div>
                            <div className="text-6xl font-black text-white italic tracking-tighter leading-none">{p.v}</div>
                            <div className="text-xs font-bold uppercase text-[#00f5a0]/40 tracking-[0.3em] bg-[#00f5a0]/5 px-4 py-2 rounded-lg">{p.t}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Final Predictive Verdict - High Impact */}
                 <div className="command-card p-24 bg-[#0b0e14] border-4 border-emerald-500/20 shadow-2xl overflow-visible">
                    <div className="flex flex-col gap-12">
                       <div className="flex items-center gap-10">
                          <div className="p-6 bg-[#00f5a0]/20 rounded-3xl border-2 border-[#00f5a0]/60 shadow-[0_0_50px_rgba(0,245,160,0.4)]">
                             <CircleDot className="w-14 h-14 text-[#00f5a0] animate-pulse" />
                          </div>
                          <span className="text-4xl font-black uppercase text-white tracking-[0.3em] italic leading-none">Diagnostic Result</span>
                       </div>
                       <p className="text-4xl text-white/50 leading-[1.8] italic font-medium">
                          GNN Attribution in the <span className="text-white font-black underline decoration-[#00f5a0]/60 underline-offset-[12px]">{result.toxicity?.toxicity_class}</span> cluster 
                          signifies a critical toxicological hazard probability. 
                          Confidence: <span className="text-[#00f5a0] font-black text-6xl italic leading-none">{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</span>.
                       </p>
                    </div>
                    {/* Shadow Accent */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#00f5a0]/10 rounded-full blur-[80px] -z-10" />
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-80 opacity-5 border-8 border-dashed border-white/10 rounded-[6rem] group hover:opacity-10 transition-all cursor-default bg-white/[0.02]">
               <Microscope className="w-80 h-80 mb-20 text-white" />
               <h2 className="text-9xl font-black italic tracking-tighter text-white uppercase text-center leading-none">Awaitng Molecular <br/> Vector Signal</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Definitive Footer - Tactical Alignment */}
        <footer className="pt-40 pb-20 flex flex-col xl:flex-row items-center justify-between border-t-8 border-white/10 text-base font-black text-[#8b949e] uppercase tracking-[0.8em] gap-20 text-center xl:text-left">
          <div className="flex items-center gap-12">
             <div className="w-5 h-5 bg-[#00f5a0] rounded-full shadow-[0_0_30px_#00f5a0]" />
             <span>© 2026 BIOAEGIS X-ALPHA | ADVANCED BIOINFORMATICS CLUSTER</span>
          </div>
          <div className="flex flex-wrap justify-center gap-32">
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/30 tracking-widest">Inference Status</span>
                <span className="text-[#00f5a0]">OPERATIONAL</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/30 tracking-widest">Model Cluster</span>
                <span>GNN-PRO-08</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-xs text-white/30 tracking-widest">Security Protocol</span>
                <span className="text-[#00f5a0]">ENCRYPTED</span>
             </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
