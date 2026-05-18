"use client";

import { useState } from 'react';

export default function ROICalculator() {
  const [claimVolume, setClaimVolume] = useState<number>(1000);
  const [avgClaimValue, setAvgClaimValue] = useState<number>(250);
  const [denialRate, setDenialRate] = useState<number>(12);
  const [recoveryRate, setRecoveryRate] = useState<number>(45);

  const calculateROI = () => {
    const totalBilled = claimVolume * avgClaimValue;
    const initialDenials = totalBilled * (denialRate / 100);
    const recoveredRevenue = initialDenials * (recoveryRate / 100);
    
    // ClaimLift assumes it can boost recovery rate by a factor or just use the current rate to show the value at stake
    const claimLiftBoost = 0.20; // 20% improvement
    const addedValue = initialDenials * claimLiftBoost;
    
    return {
      totalAtRisk: initialDenials,
      potentialAddedValue: addedValue,
      annualizedValue: addedValue * 12
    };
  };

  const results = calculateROI();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card text-card-foreground rounded-lg border shadow-sm my-10">
      <h2 className="text-2xl font-bold mb-4">Revenue Leakage & ROI Calculator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Monthly Claim Volume</label>
          <input 
            type="number" 
            value={claimVolume}
            onChange={(e) => setClaimVolume(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Avg. Claim Value ($)</label>
          <input 
            type="number" 
            value={avgClaimValue}
            onChange={(e) => setAvgClaimValue(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Denial Rate (%)</label>
          <input 
            type="number" 
            value={denialRate}
            onChange={(e) => setDenialRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Current Recovery Rate (%)</label>
          <input 
            type="number" 
            value={recoveryRate}
            onChange={(e) => setRecoveryRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      <div className="bg-primary/5 p-6 rounded-md border border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-primary">Your Monthly Impact</h3>
        <div className="flex justify-between items-center mb-2">
          <span>Monthly Revenue at Risk:</span>
          <span className="font-mono">${results.totalAtRisk.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
        <div className="flex justify-between items-center text-xl font-bold text-primary mt-4">
          <span>ClaimLift Added Recovery (Est.):</span>
          <span className="font-mono">+${results.potentialAddedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
          <span>Annualized Upside:</span>
          <span className="font-mono">${results.annualizedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
      </div>
      
      <button className="w-full mt-6 bg-primary text-primary-foreground font-semibold py-3 rounded-md hover:bg-primary/90 transition-colors">
        Book Your Free Leakage Audit
      </button>
    </div>
  );
}
