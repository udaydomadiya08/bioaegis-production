"use client";

import { motion } from "framer-motion";

interface ToxicityGaugeProps {
  percent: number;
  label?: string;
}

export default function ToxicityGauge({ percent, label }: ToxicityGaugeProps) {
  const value = percent; // Maintain internal logic
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val < 30) return "#00ffcc"; // Safe
    if (val < 70) return "#ffcc00"; // Warning
    return "#ff3366"; // Danger
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-48 h-48">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Bar */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        
        {/* Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-mono tracking-tighter"
            style={{ color }}
          >
            {value.toFixed(1)}%
          </motion.span>
          <span className="text-[10px] uppercase text-white/40 tracking-[0.2em] font-medium">Toxicity</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-bold tracking-wide uppercase text-white/90">{label}</p>
        <div className="flex justify-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1 w-4 rounded-full transition-colors duration-500 ${i < (value/20) ? 'bg-primary' : 'bg-white/10'}`} 
                />
            ))}
        </div>
      </div>
    </div>
  );
}
