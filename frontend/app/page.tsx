"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Layers, 
  Box, 
  Info, 
  Zap, 
  Cpu, 
  ChevronRight,
  Database,
  Globe
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
    fraction_csp3?: number;
    labute_asa?: number;
    mol_mr?: number;
    valence_electrons?: number;
  };
  svg?: string;
  pdb?: string;
  error?: string;
}

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [viewerMode, setViewerMode] = useState<"2D" | "3D">("3D");
  const [sentinelVision, setSentinelVision] = useState(true);

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
        alert(data.error || "Neural Engine: Invalid Compound Structure Detect.");
      }
    } catch (err) {
      console.error(err);
      alert("Neural Bridge Offline: Unable to connect to the cloud engine.");
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
    <main className="min-h-screen p-4 md:p-8 flex flex-col gap-6 bg-[#0a0b10] text-slate-100">
      {/* Premium Header */}
      <header className="flex items-center justify-between glass-card px-8 py-4 bg-black/20 border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <ShieldAlert className="text-emerald-400 w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">BioAegis X-Alpha</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Activity className="w-3 h-3 text-emerald-500" /> System Operational | Node 08-Alpha
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-emerald-400 transition-all">Intelligence Hub</a>
          <a href="#" className="hover:text-emerald-400 transition-all">Neural Logs</a>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-emerald-400">
            <Database className="w-3 h-3" /> API Core Active
          </div>
        </nav>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full">
        
        {/* Left Column: Input & Terminal */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <section className="glass-card p-6 flex-1 flex flex-col bg-black/20 border border-white/5 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-400">
              <Terminal className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Neural Console</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 block">Structural Descriptor (SMILES)</label>
                <textarea 
                  value={smiles}
                  onChange={(e) => setSmiles(e.target.value)}
                  placeholder="Enter chemical string..."
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 resize-none font-mono text-sm focus:border-emerald-500/50 outline-none"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isAnalyzing ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>Analyze Compound <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="pt-6 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-3 block">Structural Templates</span>
                <div className="flex flex-col gap-2">
                  {examples.map((ex) => (
                    <button 
                      key={ex.name}
                      onClick={() => setSmiles(ex.smiles)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group"
                    >
                      <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400">{ex.name}</span>
                      <Box className="w-3 h-3 text-slate-600 group-hover:text-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-white/5 text-[10px] text-slate-500 font-mono leading-relaxed">
              <div className="flex items-center gap-2 mb-1 text-emerald-500">
                 <Cpu className="w-3 h-3" /> GNN Inference
              </div>
              Model Accuracy: 94.25% <br/>
              Dataset: 378k Molecules <br/>
              Platform: X-Alpha Production
            </div>
          </section>
        </aside>

        {/* Center Column: Visualization */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <section className="glass-card overflow-hidden flex-1 relative flex flex-col bg-black/20 border border-white/5 rounded-3xl backdrop-blur-xl">
            <div className="absolute top-6 left-6 z-10 flex gap-2">
              <button 
                onClick={() => setViewerMode("3D")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewerMode === "3D" ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400 border border-white/5'}`}
              >
                3D Engine
              </button>
              <button 
                onClick={() => setViewerMode("2D")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewerMode === "2D" ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400 border border-white/5'}`}
              >
                2D Schematic
              </button>
            </div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key={viewerMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex-1 min-h-[500px] flex items-center justify-center p-8">
                    {viewerMode === "2D" ? (
                      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        <MoleculeViewer svg={result.svg || ""} />
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <Molecule3D pdb={result.pdb || ""} atomScores={sentinelVision ? result.toxicity?.atom_scores : undefined} />
                      </div>
                    )}
                  </div>
                  
                  {/* Visual Controls Footer */}
                  <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sentinel Vision</label>
                          <button 
                            onClick={() => setSentinelVision(!sentinelVision)}
                            className={`w-8 h-4 rounded-full relative transition-all ${sentinelVision ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${sentinelVision ? 'left-4.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                     </div>
                     <div className="text-[10px] font-mono text-slate-500 uppercase italic">
                        Real-time Structural Conformer Generation
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse border border-white/10">
                    <Globe className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold italic tracking-tight mb-2 uppercase">Awaiting Compound Analysis</h3>
                  <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed uppercase tracking-tighter">Enter a molecular descriptor in the Neural Console to visualize structural threats.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right Column: Syndromic Intelligence */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <section className="glass-card p-6 flex flex-col h-full bg-black/20 border border-white/5 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-400">
              <Layers className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Intelligence Report</h2>
            </div>

            <AnimatePresence>
              {result && result.toxicity ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Gauge Section */}
                  <div className="flex justify-center -mt-4">
                    <ToxicityGauge percent={result.toxicity.toxicity_percent} />
                  </div>

                  {/* Classification Card */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Dominant Syndrome</div>
                    <div className="flex items-center justify-between">
                       <span className="text-xl font-bold text-emerald-400 capitalize italic">{result.toxicity.toxicity_class}</span>
                       <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-emerald-500/20">Certified Match</div>
                    </div>
                  </div>

                  {/* Probabilities */}
                  <div className="space-y-4">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block">Neural Path Activation</span>
                     <div className="space-y-3">
                        {result.toxicity.top_classes?.slice(0, 3).map((cls, j) => (
                           <div key={j} className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold uppercase">
                                 <span className="text-slate-400">{cls.class}</span>
                                 <span className="text-slate-200">{(cls.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cls.confidence * 100}%` }}
                                    className={`h-full ${j === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600 opacity-60'}`}
                                 />
                              </div>
                           </div>
                        ))}
                      <span className="text-sm font-bold text-red-500 font-display uppercase tracking-tight italic">High System Criticality: Immediate structural review recommended.</span>
                  </motion.div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-3xl border-t border-white/5 px-6 py-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium z-40">
        <div>© 2026 BioAegis X-Alpha Platform | Secure Neural Bridge</div>
        <div className="flex gap-4">
            <span className="text-emerald-500">Node: Operational</span>
            <span>Cluster: 08-Alpha</span>
        </div>
      </footer>
    </div>
  );
}
