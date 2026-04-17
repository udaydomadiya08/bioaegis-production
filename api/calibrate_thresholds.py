import os
import json
import pandas as pd
import numpy as np
from sklearn.metrics import roc_curve

def calibrate():
    print("🛰️ BioAegis X-Alpha: Initiating High-Velocity Vectorized Calibration...")
    
    # 1. Load Pre-Calculated Ground Truth Data
    data_path = "data/merge_file copy.csv"
    if not os.path.exists(data_path):
        print(f"❌ Error: {data_path} not found.")
        return
        
    print(f"📁 Loading Master Dataset (100% Coverage Pass)...")
    # Use low_memory=False to handle mixed types safely during full-pass
    df = pd.read_csv(data_path, low_memory=False)
    
    # Sanitize Data: Eject NaN values that cause integrity faults
    df = df.dropna(subset=['Classified', 'Predicted_Toxicity_Percentage', 'Toxicity class'])
    print(f"✅ Data Sanitized: {len(df)} validated vectors identified for 13-pass pass.")

    # 2. Define the 13 Toxicity Experts
    expert_names = [
        "Cardiotoxicity", "Reproductive toxicity", "Liver toxicity", 
        "Genotoxicity", "Hepatotoxicity", "Eye corrosion", "Eye irritation", 
        "Zinc toxicity", "Mutagenecity", "Respiratory toxicity", 
        "Skin toxicity", "Carcinogenicity", "Acute Toxicity"
    ]
    
    new_thresholds = {}
    print("\n🧮 Executing 13-Pass Vectorized ROC-J Calibration...")
    
    for name in expert_names:
        # Filter for the specific class
        class_df = df[df['Toxicity class'] == name]
        
        if len(class_df) == 0:
            print(f"   ⚠️ {name}: No matching data in master set. Using default 0.5.")
            new_thresholds[name] = 0.5
            continue
            
        # Extract Scores and Labels
        # Predicted_Toxicity_Percentage is 0-100, we need 0-1 for ROC
        probs = class_df['Predicted_Toxicity_Percentage'].astype(float) / 100.0
        # Multi-stage cast to handle strings like '0.0' or '1.0' safely
        labels = class_df['Classified'].astype(float).astype(int)
        
        if len(np.unique(labels)) < 2:
            print(f"   ⚠️ {name}: Insufficient label variance ({len(class_df)} samples). Using default 0.5.")
            new_thresholds[name] = 0.5
            continue
            
        # Calculate ROC Curve
        fpr, tpr, thresholds = roc_curve(labels, probs)
        
        # Youden's J = TPR - FPR
        j_scores = tpr - fpr
        best_idx = np.argmax(j_scores)
        best_threshold = round(float(thresholds[best_idx]), 4)
        
        # Guard against 0 or >1 (roc_curve thresholds can sometimes exceed range)
        best_threshold = max(0.01, min(0.99, best_threshold))
        
        print(f"   ✅ {name}: J-Optimized Threshold = {best_threshold} (Data Points: {len(class_df)})")
        new_thresholds[name] = best_threshold

    # 3. Harden the Matrix
    matrix_path = "models/threshold_matrix.json"
    with open(matrix_path, "w") as f:
        json.dump(new_thresholds, f, indent=4)
        
    print(f"\n🛰️ Statistical Hardening Complete (Vectorized). Matrix written to {matrix_path}")

if __name__ == "__main__":
    calibrate()
