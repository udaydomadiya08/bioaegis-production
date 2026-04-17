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
  ArrowRight
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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] radial-center-glow pointer-events-auto">
      <div className="max-w-[1400px] mx-auto px-10 py-16 space-y-24">
        
        {/* Elite Command Header */}
        <header className="flex items-center justify-between border-b border-white/5 pb-12">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-[#00f5a0] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.4)]">
              <ShieldAlert className="text-[#0b0e14] w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">BioAegis <span className="text-[#00f5a0]">X-Alpha</span></h1>
              <div className="mt-3 flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[12px] text-[#00f5a0] font-black uppercase tracking-[0.3em] bg-[#00f5a0]/10 px-3 py-1 rounded-full border border-[#00f5a0]/20">
                    <Radio className="w-3 h-3 animate-pulse" /> Live Node
                 </div>
                 <span className="text-[12px] text-[#8b949e] font-bold uppercase tracking-widest italic">Operational Cluster: 08-Alpha</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#8b949e] mb-1">Neural Bandwidth</div>
                <div className="text-xl font-bold text-white italic">14.2 GB/s Scan Rate</div>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex items-center gap-4 bg-[#161b22] px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                <Cpu className="text-[#00f5a0] w-6 h-6 animate-pulse" />
                <span className="text-sm font-black uppercase text-white tracking-widest">Active</span>
             </div>
          </div>
        </header>

        {/* Hero Input Area */}
        <section className="space-y-12">
          <div className="space-y-6">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-industrial"
            >
              Structural <span className="text-[#00f5a0]">Toxicity</span> <br/> Synthesis
            </motion.h2>
            <p className="text-2xl text-[#8b949e] max-w-3xl leading-relaxed italic font-medium">
               Orchestrate high-fidelity GNN analysis on any chemical identifier. <br/>
               Input a SMILES vector to initiate structural threat detection.
            </p>
          </div>

          <div className="command-card p-2 flex flex-col md:flex-row items-center gap-4 group">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input Molecular Vector or SMILES string..."
               className="command-input flex-1 p-8 min-h-[140px] focus:ring-0"
               style={{ color: 'white', fontWeight: '800' }}
             />
             <div className="p-4 w-full md:w-auto">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix w-full group"
               >
                 <span>{isAnalyzing ? "Processing Synthesis..." : "Initiate Connection"}</span>
                 <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
               </button>
             </div>
          </div>

          <div className="flex flex-wrap gap-4 px-2">
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8b949e] mr-4 flex items-center">Try Examples:</span>
             {examples.map((ex) => (
               <button 
                 key={ex.name}
                 onClick={() => setSmiles(ex.smiles)}
                 className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00f5a0]/40 hover:bg-[#00f5a0]/5 transition-all text-xs font-black uppercase tracking-[0.1em] text-white/40 hover:text-[#00f5a0]"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* 3D Visualizer Terminal */}
              <div className="lg:col-span-8 space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3 text-[#00f5a0]">
                       <Box className="w-6 h-6 animate-spin-slow" />
                       <h3 className="text-xl font-black uppercase tracking-[0.2em] italic">Structural Stream</h3>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-[#8b949e] tracking-widest">
                       <span>Sentinel Vision: Active</span>
                       <div className="w-2 h-2 bg-[#00f5a0] rounded-full animate-ping" />
                    </div>
                 </div>
                 <div className="command-card relative h-[700px] overflow-hidden">
                    <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                    <div className="absolute bottom-8 right-8 z-10 bg-[#0d1117]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
                       <Database className="w-4 h-4 text-[#00f5a0]" />
                       <span className="text-xs font-black uppercase tracking-widest text-[#8b949e]">Internal Latent Space: Visualized</span>
                    </div>
                 </div>
              </div>

              {/* Data Acquisition Deck */}
              <div className="lg:col-span-4 space-y-12">
                 
                 {/* Massive Isolated Gauge */}
                 <section className="command-card p-12 flex flex-col items-center justify-center bg-gradient-to-br from-[#00f5a0]/[0.03] to-transparent">
                    <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                    <div className="mt-12 text-center space-y-4 pt-12 border-t border-white/5 w-full">
                       <span className="text-[12px] font-black uppercase text-[#8b949e] tracking-[0.4em]">Primary Threat Class</span>
                       <div className="text-5xl font-black text-white italic uppercase tracking-tighter">{result.toxicity?.toxicity_class}</div>
                    </div>
                 </section>

                 {/* Property Grid */}
                 <div className="grid grid-cols-2 gap-6">
                    {[
                      { l: "LogP Value", v: result.properties?.logp.toFixed(2), i: Activity, c: "#00f5a0" },
                      { l: "TPSA Index", v: result.properties?.tpsa.toFixed(1), i: Layers, c: "#00d2ff" },
                      { l: "Mol Weight", v: result.properties?.mol_wt.toFixed(1), i: Zap, c: "#facc15" },
                      { l: "H-Donors", v: result.properties?.h_donors, i: Database, c: "#f472b6" }
                    ].map((p, i) => (
                      <div key={i} className="command-card p-8 group hover:border-[#00f5a0]/40 transition-all">
                         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 mb-6 group-hover:bg-[#161b22] transition-colors">
                            <p.i style={{ color: p.c }} className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest mb-1">{p.l}</div>
                            <div className="text-3xl font-black text-white italic tracking-tighter">{p.v}</div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* AI Verdict Summary */}
                 <div className="command-card p-10 bg-white/5 border-emerald-500/10">
                    <div className="flex items-start gap-6">
                       <div className="p-3 bg-[#00f5a0]/10 rounded-xl border border-[#00f5a0]/20 shrink-0">
                          <Info className="w-8 h-8 text-[#00f5a0]" />
                       </div>
                       <div className="space-y-4">
                          <span className="text-[12px] font-black uppercase text-white tracking-[0.2em] italic">Neural Verdict</span>
                          <p className="text-base text-[#8b949e] leading-relaxed italic">
                             Structural motifs identified in the <span className="text-white font-bold">{result.toxicity?.toxicity_class}</span> cluster signify a significant elevation in risk. 
                             Neural confidence is currently holding at <span className="text-[#00f5a0] font-black">{(result.toxicity?.confidence || 0 * 100).toFixed(1)}%</span>.
                          </p>
                       </div>
                    </div>
                 </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-48 opacity-10 border-4 border-dashed border-white/5 rounded-[4rem]">
               <Terminal className="w-40 h-40 mb-10 text-white" />
               <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent">Awaiting Vector</h2>
            </div>
          )}
        </AnimatePresence>

        {/* Definitive Footer */}
        <footer className="pt-24 pb-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[12px] font-black text-[#8b949e] uppercase tracking-[0.5em] gap-12">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-[#00f5a0] rounded-full" />
             <span>© 2026 BIOAEGIS X-ALPHA | NUCLEAR INDUSTRIAL LAYER</span>
          </div>
          <div className="flex gap-16">
             <span className="text-[#00f5a0]/40">Status: Operational</span>
             <span>Cluster: 08-Alpha</span>
             <span>Region: US-EAST-BRIDGE</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
