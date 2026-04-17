"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ToxicityGaugeProps {
  percent: number;
}

const ToxicityGauge: React.FC<ToxicityGaugeProps> = ({ percent }) => {
  const radius = 100;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const color = "#00f5a0"; // High-vibrancy Emerald

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Industrial Emerald Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.25, 0.1],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute inset-0 rounded-full blur-[40px] bg-[#00f5a0]"
      />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,245,160,0.4)]"
      >
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>

      {/* Industrial Readout */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-6xl font-black italic tracking-tighter text-white font-bold">
          {percent.toFixed(1)}%
        </span>
        <div className="text-[11px] uppercase tracking-[0.4em] font-extrabold text-[#00f5a0] mt-2 italic">
          Structural Threat
        </div>
      </div>
    </div>
  );
};

export default ToxicityGauge;
