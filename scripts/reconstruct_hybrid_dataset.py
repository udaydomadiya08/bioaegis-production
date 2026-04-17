import pandas as pd
import torch
import os
import sys
from tqdm import tqdm
from rdkit import Chem
from api.training.model import get_morgan_fp, get_chem_features
import pickle
import warnings
from rdkit import RDLogger

def extract_hybrid_clusters(target_class_id=None, csv_path="data/merge_file copy.csv"):
    """
    Reads the master merge file and creates a hybrid shard structure.
    If target_class_id is provided, ONLY processes that expert to save space.
    """
    RDLogger.DisableLog('rdApp.*')
    warnings.filterwarnings("ignore")
    
    print(f"🧬 Operation Hybrid Reconstruction: Targeted extraction of Head {target_class_id} from {csv_path}...")
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    
    # 2. Load Master CSV
    df = pd.read_csv(csv_path, low_memory=False)
    counts = df['Toxicity class'].value_counts()
    
    output_dir = "data/class_specific"
    os.makedirs(output_dir, exist_ok=True)
    
    from torch_geometric.data import Data
    
    # Iterate through classes
    for class_name, class_id in tox_classes.items():
        if target_class_id is not None and int(class_id) != int(target_class_id):
            continue
            
        count = counts.get(class_name, 0)
        print(f"\n🔍 Processing Expert: {class_name} ({count} samples) (Head {class_id})...")
        
        class_df = df[df['Toxicity class'] == class_name].copy()
        if len(class_df) == 0: continue

        # Hybrid Logic: Shard if count > 20,000
        is_sharded = count > 20000
        shard_size = 10000
        
        expert_nodes = []
        shard_count = 1
        
        for i, (idx, row) in enumerate(tqdm(class_df.iterrows(), total=len(class_df), desc=f"Featurizing {class_name}")):
            try:
                smiles = str(row['Drug'])
                mol = Chem.MolFromSmiles(smiles)
                if mol is None: continue
                
                # AttentiveFP + Morgan + Descriptors
                node_features, edge_index, edge_attr = get_chem_features(mol)
                fp = get_morgan_fp(mol)
                
                desc_cols = ['MolWt', 'TPSA', 'NumHDonors', 'NumHAcceptors', 'MolLogP', 'Heavy_Atom_Count', 'NumRotatableBonds']
                desc_values = [float(row.get(c, 0)) for c in desc_cols]
                while len(desc_values) < 12: desc_values.append(0.0)
                descriptors = torch.tensor(desc_values, dtype=torch.float).unsqueeze(0)
                
                data = Data(
                    x=node_features, edge_index=edge_index, edge_attr=edge_attr,
                    y=torch.tensor([1.0], dtype=torch.float),
                    y_class=torch.tensor([class_id], dtype=torch.long),
                    fingerprints=fp.unsqueeze(0), descriptors=descriptors
                )
                expert_nodes.append(data)
                
                # Save shard if full
                if is_sharded and len(expert_nodes) >= shard_size:
                    out_path = os.path.join(output_dir, f"expert_{class_id}_shard_{shard_count}.pt")
                    torch.save(expert_nodes, out_path)
                    expert_nodes = []
                    shard_count += 1
                    
            except: continue
            
        # Final Save
        if expert_nodes:
            name_suffix = f"_shard_{shard_count}" if is_sharded else ""
            out_path = os.path.join(output_dir, f"expert_{class_id}{name_suffix}.pt")
            torch.save(expert_nodes, out_path)
            print(f"✅ Expert Shard Secured: {out_path}")

    print(f"\n🏁 Targeted Extraction for Head {target_class_id} Finalized.")

if __name__ == "__main__":
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    extract_hybrid_clusters(target_id)
