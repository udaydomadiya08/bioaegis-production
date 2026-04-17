"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, FlaskConical, History, ShieldAlert, Zap, Search, Beaker, Database, Eye, Box, Share2, Info, ChevronRight, AlertTriangle } from "lucide-react";
import MoleculeViewer from "@/components/MoleculeViewer";
import Molecule3D from "@/components/Molecule3D";
import ToxicityGauge from "@/components/ToxicityGauge";

interface AnalysisResult {
  smiles: string;
  valid: boolean;
  toxicity_percent: number;
  toxicity_class: string;
  confidence: number;
  top_classes?: Array<{ class: string; confidence: number }>;
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
  atom_scores?: number[];
  error?: string;
}

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
  const [sentinelVision, setSentinelVision] = useState(true);

  const handleAnalyze = async () => {
    if (!smiles.trim()) return;
    setIsAnalyzing(true);
    
    try {
      const response = await fetch("https://udaydomadiya-bioaegis-api.hf.space/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles }),
      });
      
      const data = await response.json();
      if (data.valid) {
        setResult(data);
        setHistory(prev => [data, ...prev].slice(0, 10));
      } else {
        alert("Invalid Compound Structure Detect.");
      }
    } catch (err) {
      console.error(err);
      alert("Cloud Engine Offline. Ensure Hugging Face Space is Running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-emerald-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[#0a0b10]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,#1a2d2a_0%,transparent_50%)]" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <ShieldAlert className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white leading-none">BIOAEGIS <span className="text-emerald-500 text-sm font-medium tracking-widest ml-1 uppercase">X-Alpha</span></h1>
              <p className="text-[10px] text-emerald-500/60 font-medium tracking-[0.2em] uppercase mt-1">Industrial Toxicity Synthesis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400"><Activity className="w-4 h-4" /> Cloud Engine Active</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <button className="hover:text-white transition-colors">Documentation</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-24">
        {/* Search Hero */}
        <section className="max-w-3xl mx-auto mb-16 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold font-display mb-6 tracking-tight"
            >
              Analyze Structural <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Toxicity Risk</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg mb-10"
            >
              Input a SMILES string to perform high-fidelity GNN structural analysis with 3D Sentinel Vision.
            </motion.p>

            <div className="relative group p-1 rounded-2xl bg-white/5 border border-white/10 focus-within:border-emerald-500/50 transition-all duration-500">
                <div className="flex items-center gap-3 px-4">
                    <Search className="text-slate-500 w-5 h-5" />
                    <input 
                        type="text" 
                        value={smiles}
                        onChange={(e) => setSmiles(e.target.value)}
                        placeholder="Enter SMILES (e.g. C(C1C(C(C(C(O1)O)O)O)O)O)"
                        className="flex-1 bg-transparent py-4 text-lg outline-none text-white placeholder:text-slate-600 font-mono"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-95"
                    >
                        {isAnalyzing ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>Analyze <Zap className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Try Examples:</span>
                {["Aspirin", "Caffeine", "Benzo[a]pyrene"].map((name) => (
                    <button 
                      key={name}
                      onClick={() => setSmiles(name === "Aspirin" ? "CC(=O)Oc1ccccc1C(=O)O" : name === "Caffeine" ? "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" : "c1ccc2c(c1)cc3ccc4cccc5c4c3c2cc5")}
                      className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all text-slate-400 hover:text-emerald-400"
                    >
                      {name}
                    </button>
                ))}
            </div>
        </section>

        <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Visualization & XAI */}
            <div className="lg:col-span-7 space-y-8">
              <div className="glass-panel rounded-3xl overflow-hidden p-6 min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        {viewMode === "2D" ? <Eye className="text-emerald-400 w-4 h-4" /> : <Box className="text-emerald-400 w-4 h-4" />}
                    </div>
                    <h3 className="font-bold text-lg">Structural Visualization</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setViewMode("2D")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "2D" ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        2D View
                    </button>
                    <button 
                         onClick={() => setViewMode("3D")}
                         className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === "3D" ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        3D View
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative bg-black/20 rounded-2xl border border-white/5 group overflow-hidden">
                    {viewMode === "2D" ? (
                        <div className="w-full h-full flex items-center justify-center p-8 bg-white/95 rounded-2xl contrast-[1.1] saturate-[1.2]">
                             <MoleculeViewer svg={result.svg || ""} />
                        </div>
                    ) : (
                        <div className="w-full h-full min-h-[450px]">
                            <Molecule3D pdb={result.pdb || ""} atomScores={sentinelVision ? result.atom_scores : undefined} />
                        </div>
                    )}
                    
                    {/* Sentinel Vision Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button 
                            onClick={() => setSentinelVision(!sentinelVision)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sentinelVision ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/60 text-slate-500 border-white/10'}`}
                        >
                            <Zap className={`w-3 h-3 ${sentinelVision ? 'animate-pulse' : ''}`} />
                            SENTINEL VISION {sentinelVision ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-400 font-mono">
                        {result.smiles}
                    </div>
                </div>
              </div>

              {/* Physicochemical Radar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Mol Wt", value: result.properties?.mol_wt.toFixed(2), icon: Beaker },
                    { label: "LogP", value: result.properties?.logp.toFixed(2), icon: Activity },
                    { label: "TPSA", value: result.properties?.tpsa.toFixed(1), icon: FlaskConical },
                    { label: "H-Donors", value: result.properties?.h_donors, icon: Database }
                ].map((prop, i) => (
                    <div key={i} className="glass-panel p-4 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all">
                        <prop.icon className="w-4 h-4 text-emerald-500/60 mb-2" />
                        <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{prop.label}</div>
                        <div className="text-white text-xl font-bold font-display">{prop.value}</div>
                    </div>
                ))}
              </div>
            </div>

            {/* Right: Toxicity Intelligence */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border-emerald-500/20 bg-emerald-500/[0.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                    <ShieldAlert className="text-emerald-500 w-5 h-5" />
                    Toxicity Assessment
                </h3>

                <div className="flex justify-center mb-10">
                    <ToxicityGauge percent={result.toxicity_percent} />
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Primary Classification</div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-lg font-bold text-emerald-400 capitalize">{result.toxicity_class}</span>
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">TOP MATCH</span>
                        </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3 italic flex items-center gap-2">
                        <Share2 className="w-3 h-3" /> Latent Space Probabilities
                      </div>
                      <div className="space-y-3">
                        {result.top_classes?.slice(0, 3).map((cls, j) => (
                            <div key={j} className="relative">
                                <div className="flex justify-between text-xs mb-1 font-medium">
                                    <span className="text-slate-400">{cls.class}</span>
                                    <span className="text-slate-300">{(cls.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${cls.confidence * 100}%` }}
                                      className={`h-full ${j === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}
                                    />
                                </div>
                            </div>
                        ))}
                      </div>
                    </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                        <Info className="text-cyan-400 w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">AI Verdict</div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            Structural motifs identified in the {result.toxicity_class.toLowerCase()} cluster signify a {result.toxicity_percent > 70 ? 'CRITICAL' : result.toxicity_percent > 40 ? 'MODERATE' : 'LOW'} elevation in risk. Sentinel Vision heatmap reflects GNN attribution scores.
                        </p>
                    </div>
                </div>
              </div>

              {/* Warnings/Advisory */}
              {result.toxicity_percent > 80 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3 items-center"
                  >
                      <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0" />
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
