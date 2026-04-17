import pandas as pd
import torch
from torch_geometric.data import DataLoader, Data, Batch
from api.training.model import BioAegisXAlpha, get_morgan_fp, get_chem_features
from rdkit import Chem
import pickle
import os
import json
import numpy as np
from tqdm import tqdm
from rdkit import RDLogger

def calculate_logical_thresholds(shard_dir="data/shards", sample_size=50):
    """
    Mathematically derives toxicity thresholds for all 13 specialists.
    Uses the distribution of probabilities on verified positive samples.
    Formula: Threshold = Mean(probs) - 1.5 * StdDev(probs)
    """
    RDLogger.DisableLog('rdApp.*')
    device = torch.device('cpu')
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    num_experts = 14 # Standardized 14-channel output
    
    # 2. Load Production Model
    model = BioAegisXAlpha(out_channels=num_experts).to(device)
    model_path = "models/ultimate_bioaegis_ensemble.pth"
    if not os.path.exists(model_path):
        print(f"❌ Error: Model weights not found at {model_path}")
        return
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False), strict=False)
    model.eval()

    # 3. Load Master Dataset for Calibration
    df = pd.read_csv("data/merge_file copy.csv", low_memory=False)
    
    threshold_matrix = {}
    
    print("\n🧬 BioAegis X-Alpha: Mathematical Threshold Calibration")
    print("="*85)
    
    for class_name, class_id in sorted(tox_classes.items(), key=lambda x: x[1]):
        # Sample known toxic compounds for this class
        class_samples = df[df['Toxicity class'] == class_name].head(sample_size)
        if len(class_samples) == 0:
            print(f"Expert {class_id:2} | {class_name:25} | ⚠️ NO SAMPLES -> Defaulting to 0.5")
            threshold_matrix[class_name] = 0.5
            continue
            
        probs_collected = []
        
        for _, row in class_samples.iterrows():
            try:
                mol = Chem.MolFromSmiles(str(row['Drug']))
                if mol is None: continue
                
                node_features, edge_index, edge_attr = get_chem_features(mol)
                if node_features is None: continue
                fp = get_morgan_fp(mol)
                
                # Basic property alignment
                desc_values = [0.0] * 12
                descriptors = torch.tensor(desc_values, dtype=torch.float).unsqueeze(0)
                
                data = Data(x=node_features, edge_index=edge_index, edge_attr=edge_attr,
                           fingerprints=fp.unsqueeze(0), descriptors=descriptors)
                batch_data = Batch.from_data_list([data])
                
                with torch.no_grad():
                    logits, _ = model(batch_data)
                    prob = torch.sigmoid(logits[0, class_id]).item()
                    probs_collected.append(prob)
            except: continue
            
        if len(probs_collected) > 2:
            mu = np.mean(probs_collected)
            sigma = np.std(probs_collected)
            # Logical Threshold: Lower bound of the high-confidence toxic distribution
            # Ensuring we catch hazards even at moderate probabilities
            threshold = max(0.1, min(0.9, mu - 1.5 * sigma))
            threshold_matrix[class_name] = round(threshold, 4)
            print(f"Expert {class_id:2} | {class_name:25} | μ: {mu:.4f} | σ: {sigma:.4f} | Threshold: {threshold:.4f}")
        else:
            threshold_matrix[class_name] = 0.5
            print(f"Expert {class_id:2} | {class_name:25} | ⚠️ INSUFFICIENT DATA -> Defaulting to 0.5")

    # 4. Finalize Matrix
    with open("models/threshold_matrix.json", "w") as f:
        json.dump(threshold_matrix, f, indent=4)
        
    print("="*85)
    print("🏁 Calibration Finalized: models/threshold_matrix.json generated.")

if __name__ == "__main__":
    calculate_logical_thresholds()
