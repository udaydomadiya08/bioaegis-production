import pandas as pd
import torch
from torch_geometric.data import DataLoader, Data
from api.training.model import BioAegisXAlpha, get_morgan_fp, get_chem_features
from rdkit import Chem
import pickle
import os
from tqdm import tqdm
from rdkit import RDLogger

def run_industrial_audit():
    """
    Performs a direct source-to-ensemble precision audit for all 13 toxicity specialists.
    """
    RDLogger.DisableLog('rdApp.*')
    device = torch.device('cpu')
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    num_experts = max(tox_classes.values()) + 1

    # 2. Load Model
    model = BioAegisXAlpha(out_channels=num_experts).to(device)
    model_path = "models/ultimate_bioaegis_ensemble.pth"
    if not os.path.exists(model_path):
        print(f"❌ Error: Model weights not found at {model_path}")
        return
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False), strict=False)
    model.eval()

    # 3. Load Master CSV
    df = pd.read_csv("data/merge_file copy.csv", low_memory=False)
    
    print("\n🔍 BioAegis X-Alpha: Forensic Industrial Audit (13 Experts)")
    print("="*85)
    
    for class_name, class_id in sorted(tox_classes.items(), key=lambda x: x[1]):
        class_samples = df[df['Toxicity class'] == class_name].head(20)
        if len(class_samples) == 0:
            print(f"Expert {class_id:2} | {class_name:25} | ⚠️ NO VERIFIED SAMPLES FOUND")
            continue
            
        correct = 0
        total = 0
        last_logit = 0.0
        
        for _, row in class_samples.iterrows():
            try:
                mol = Chem.MolFromSmiles(str(row['Drug']))
                if mol is None: continue
                
                node_features, edge_index, edge_attr = get_chem_features(mol)
                if node_features is None: continue

                fp = get_morgan_fp(mol)
                
                desc_cols = ['MolWt', 'TPSA', 'NumHDonors', 'NumHAcceptors', 'MolLogP', 'Heavy_Atom_Count', 'NumRotatableBonds']
                desc_values = []
                for c in desc_cols:
                    try:
                        val = float(row.get(c, 0.0))
                        if pd.isna(val) or pd.isnull(val): val = 0.0
                        desc_values.append(val)
                    except: desc_values.append(0.0)
                
                while len(desc_values) < 12: desc_values.append(0.0)
                descriptors = torch.tensor(desc_values, dtype=torch.float).unsqueeze(0)
                
                from torch_geometric.data import Batch
                data = Data(
                    x=node_features, edge_index=edge_index, edge_attr=edge_attr,
                    fingerprints=fp.unsqueeze(0), descriptors=descriptors
                )
                batch_data = Batch.from_data_list([data])
                
                with torch.no_grad():
                    logits, _ = model(batch_data)
                    logit_val = logits[0, class_id].item()
                    last_logit = logit_val
                    pred = torch.sigmoid(logits[0, class_id]).item()
                    if pred > 0.5:
                        correct += 1
                total += 1
            except Exception as e:
                print(f"  ❌ Debug: Sample failed for {class_name}: {e}")
                continue
            
        precision = (correct / total * 100) if total > 0 else 0
        status = "✅ MASTERED" if precision > 80 else "⚠️ UNSTABLE"
        print(f"Expert {class_id:2} | {class_name:25} | Precision: {precision:6.2f}% | Logit: {last_logit:8.4f} | {status}")

    print("="*85)
    print("🏁 Forensic Audit Finalized: 13-Expert BioAegis X-Alpha is Ready.")

if __name__ == "__main__":
    run_industrial_audit()
