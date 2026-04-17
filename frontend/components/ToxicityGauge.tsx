"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ToxicityGaugeProps {
  percent: number;
}

const ToxicityGauge: React.FC<ToxicityGaugeProps> = ({ percent }) => {
  const radius = 100; // Scaled up
  const stroke = 16;  // Scaled up
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const getColor = (val: number) => {
    if (val > 80) return '#ef4444'; // Red
    if (val > 40) return '#f59e0b'; // Amber
    return '#22d3ee'; // Electric Cyan
  };

  const color = getColor(percent);

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Hyper-Vibrant Glow Foundation */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-[60px]"
        style={{ backgroundColor: color }}
      />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
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
          transition={{ duration: 2, ease: "circOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>

      {/* Massive Neural Core Readout */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.div
           animate={{ 
             scale: [1, 1.05, 1],
             textShadow: [`0 0 20px ${color}44`, `0 0 40px ${color}aa`, `0 0 20px ${color}44`]
           }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="flex flex-col items-center"
        >
          <span className="text-7xl font-black tracking-tighter font-display" style={{ color }}>
            {percent.toFixed(1)}%
          </span>
          <div className="h-1 w-12 rounded-full mt-2" style={{ backgroundColor: color }} />
        </motion.div>
        <span className="text-[12px] uppercase tracking-[0.4em] font-black text-white/40 mt-6 font-display">
          Neural Prob. Index
        </span>
      </div>
    </div>
  );
};

export default ToxicityGauge;
