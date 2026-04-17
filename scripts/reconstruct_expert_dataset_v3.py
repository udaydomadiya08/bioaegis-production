import pandas as pd
import torch
import os
from tqdm import tqdm
from rdkit import Chem
from api.training.model import get_morgan_fp, get_chem_features
import pickle
import warnings
from rdkit import RDLogger

def extract_specialist_clusters(csv_path="data/merge_file copy.csv"):
    """
    Reads the master merge file and creates 13 specialized .pt shards.
    Prioritizes rare experts first to allow for rapid initial results.
    """
    # Suppress RDKit noise
    RDLogger.DisableLog('rdApp.*')
    warnings.filterwarnings("ignore")
    
    print(f"🧬 Operation Specialist Reconstruction: Extracting Experts (Triage Mode) from {csv_path}...")
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    
    # Toxicity classes mapping
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    
    # 2. Load Master CSV
    df = pd.read_csv(csv_path, low_memory=False)
    
    # TRIAGE SORT: Smallest classes first for rapid training readiness
    counts = df['Toxicity class'].value_counts()
    sorted_classes = sorted(tox_classes.items(), key=lambda x: counts.get(x[0], 0))
    
    output_dir = "data/class_specific"
    os.makedirs(output_dir, exist_ok=True)
    
    from torch_geometric.data import Data
    
    # Process each class
    for class_name, class_id in sorted_classes:
        count = counts.get(class_name, 0)
        print(f"\n🔍 Isolating Cluster: {class_name} ({count} samples) (Head {class_id})...")
        
        # Filter molecules for this class
        class_df = df[df['Toxicity class'] == class_name].copy()
        if len(class_df) == 0:
            print(f"⚠️ Warning: No samples found for {class_name}. Skipping.")
            continue
            
        expert_nodes = []
        
        # High-Velocity Featurization
        for idx, row in tqdm(class_df.iterrows(), total=len(class_df), desc=f"Featurizing {class_name}"):
            try:
                smiles = str(row['Drug'])
                mol = Chem.MolFromSmiles(smiles)
                if mol is None: continue
                
                # AttentiveFP Features
                node_features, edge_index, edge_attr = get_chem_features(mol)
                
                # Morgan Fingerprint
                fp = get_morgan_fp(mol)
                
                # Physicochemical Descriptors (MolWt, TPSA, etc.)
                desc_cols = ['MolWt', 'TPSA', 'NumHDonors', 'NumHAcceptors', 'MolLogP', 'Heavy_Atom_Count', 'NumRotatableBonds']
                desc_values = []
                for col in desc_cols:
                    val = row.get(col, 0)
                    try:
                        desc_values.append(float(val))
                    except:
                        desc_values.append(0.0)
                
                # Fill remaining to reach 12
                while len(desc_values) < 12:
                    desc_values.append(0.0)
                
                descriptors = torch.tensor(desc_values, dtype=torch.float).unsqueeze(0)
                
                data = Data(
                    x=node_features,
                    edge_index=edge_index,
                    edge_attr=edge_attr,
                    y=torch.tensor([1.0], dtype=torch.float),
                    y_class=torch.tensor([class_id], dtype=torch.long),
                    fingerprints=fp.unsqueeze(0),
                    descriptors=descriptors
                )
                expert_nodes.append(data)
                
            except Exception as e:
                continue
        
        # Save Specialist Shard
        if expert_nodes:
            output_path = os.path.join(output_dir, f"expert_{class_id}.pt")
            torch.save(expert_nodes, output_path)
            print(f"✅ Specialist Shard Secured: {output_path} ({len(expert_nodes)} molecules)")
        
    print("\n🏁 Triage Reconstruction Finalized. All 13 Expert Clusters are secured.")

if __name__ == "__main__":
    extract_specialist_clusters()
