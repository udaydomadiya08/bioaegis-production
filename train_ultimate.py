import torch
import pandas as pd
import numpy as np
from rdkit import Chem
from torch_geometric.data import Data, DataLoader
from api.training.model import BioAegisXAlpha, get_chem_features, get_morgan_fp
import torch.optim as optim
from sklearn.model_selection import train_test_split
from tqdm import tqdm
import os
import pickle
import gzip
import io
import torch.nn as nn
from concurrent.futures import ProcessPoolExecutor, as_completed

# FORCED ACCELERATION: Explicitly lock to float32 for MPS stability
torch.set_default_dtype(torch.float32)

def process_molecule(row_data, labels_map):
    """Worker function for parallel featurization (Compact)."""
    from rdkit import Chem
    from rdkit.Chem import Descriptors as Desc
    from api.training.model import get_chem_features, get_morgan_fp
    import torch
    from torch_geometric.data import Data
    
    smiles = row_data['Drug']
    mol = Chem.MolFromSmiles(smiles)
    if not mol: return None
    
    try:
        x, edge_index, edge_attr = get_chem_features(mol)
        fingerprints = get_morgan_fp(mol).unsqueeze(0)
        
        # Space-Saving: Use float32 for descriptors (No float16 allowed on MPS)
        desc_values = [
            Desc.MolWt(mol), Desc.MolLogP(mol), Desc.TPSA(mol),
            Desc.NumHDonors(mol), Desc.NumHAcceptors(mol), mol.GetNumHeavyAtoms(),
            Desc.NumRotatableBonds(mol), Desc.NumValenceElectrons(mol),
            Desc.FractionCSP3(mol), Desc.LabuteASA(mol), Desc.MolMR(mol),
            row_data['Predicted_Toxicity_Percentage'] / 100.0
        ]
        descriptors = torch.tensor(desc_values, dtype=torch.float32).unsqueeze(0)
        
        y_class = torch.tensor([labels_map[row_data['Toxicity class']]], dtype=torch.long)
        y_percent = torch.tensor([row_data['Predicted_Toxicity_Percentage']], dtype=torch.float32)
        
        return Data(x=x.float(), edge_index=edge_index, edge_attr=edge_attr.float(), 
                    y_class=y_class, y_percent=y_percent, 
                    fingerprints=fingerprints.float(), descriptors=descriptors.float())
    except:
        return None

def build_compact_shards(data_path, label_map, shard_size=10000, shard_dir="data/shards"):
    """Featurizes into Gzipped compressed on-disk shards."""
    if not os.path.exists(shard_dir): os.makedirs(shard_dir)
    
    existing_shards = [f for f in os.listdir(shard_dir) if f.endswith('.pt.gz')]
    if len(existing_shards) > 0:
        print(f"📦 Found {len(existing_shards)} COMPRESSED shards. Bypassing Engine.")
        return len(existing_shards)

    print("💎 Initializing COMPACT-SYNC Parallel Engine...")
    df_iter = pd.read_csv(data_path, chunksize=shard_size)
    
    shard_count = 0
    total_processed = 0
    for chunk in df_iter:
        chunk = chunk[chunk['Drug'].notna() & chunk['Drug'].apply(lambda x: isinstance(x, str))].copy()
        rows = chunk.to_dict('records')
        
        data_list = []
        with ProcessPoolExecutor(max_workers=min(4, os.cpu_count())) as executor:
            futures = [executor.submit(process_molecule, row, label_map) for row in rows]
            # Silent tqdm to prevent 400MB log growth
            for future in tqdm(as_completed(futures), total=len(rows), desc=f"Shard {shard_count}", mininterval=10):
                res = future.result()
                if res: data_list.append(res)
        
        # High-Compression Save
        shard_path = os.path.join(shard_dir, f"shard_{shard_count}.pt.gz")
        buffer = io.BytesIO()
        torch.save(data_list, buffer)
        with gzip.open(shard_path, 'wb') as f:
            f.write(buffer.getvalue())
            
        print(f"💾 Shard {shard_count} SECURED (Gzipped).")
        total_processed += len(data_list)
        shard_count += 1
        del data_list
    
    # Emergency Disposal of Source CSV to reclaim ~40MB
    if total_processed > 300000:
        if os.path.exists(data_path):
            os.remove(data_path)
            print("🗑️ Source CSV recycled to maximize production headspace.")
        
    return shard_count

def train_compact_sync(data_path="data/merge file.csv", epochs=10, shard_size=10000):
    print(f"🚀 HYPER-FAST CPU PRODUCTION COMMENCING", flush=True)
    
    
    if os.path.exists(data_path):
        df_labels = pd.read_csv(data_path, usecols=['Toxicity class'])
        labels = df_labels['Toxicity class'].unique()
        label_map = {label: i for i, label in enumerate(labels)}
        if not os.path.exists("models"): os.makedirs("models")
        with open("models/label_map.pkl", "wb") as f:
            pickle.dump(label_map, f)
    else:
        print("💡 Source CSV recycled. Loading labels from persistent cache.")
        with open("models/label_map.pkl", "rb") as f:
            label_map = pickle.load(f)
            labels = list(label_map.keys())
    
    shard_count = build_compact_shards(data_path, label_map, shard_size=shard_size)
    
    # STABILITY: Force CPU for multi-threaded bandwidth (Bypasses Metal Driver Bugs)
    device = torch.device('cpu')
    torch.set_num_threads(os.cpu_count()) 
    
    print(f"⚡ CPU Performance Mode Active | Clusters: {os.cpu_count()}", flush=True)
    
    model = BioAegisXAlpha(out_channels=len(labels)).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-3)
    
    class_criterion = nn.CrossEntropyLoss()
    reg_criterion = nn.MSELoss()
    
    for epoch in range(epochs):
        model.train()
        total_loss, total_correct, total_samples = 0, 0, 0
        
        for s_idx in range(shard_count):
            shard_path = os.path.join("data/shards", f"shard_{s_idx}.pt.gz")
            with gzip.open(shard_path, 'rb') as f:
                shard_data = torch.load(io.BytesIO(f.read()), weights_only=False)
            if len(shard_data) == 0:
                print(f"⚠️ Shard {s_idx+1} is EMPTY or invalid. Skipping cluster.")
                del shard_data
                continue
                
            # HYPER-FAST: Large batches + Multi-threading
            loader = DataLoader(shard_data, batch_size=256, shuffle=True)
            for batch in loader:
                batch = batch.to(device)
                
                # FORCE ALIGNMENT: Bridge the gap between float16 storage and float32 model
                batch.x = batch.x.float()
                batch.edge_attr = batch.edge_attr.float()
                batch.fingerprints = batch.fingerprints.float()
                batch.descriptors = batch.descriptors.float()
                batch.y_percent = batch.y_percent.float()
                
                optimizer.zero_grad()
                logits, percentage = model(batch)
                loss = class_criterion(logits, batch.y_class) + reg_criterion(percentage, batch.y_percent / 100.0)
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                total_correct += (logits.argmax(1) == batch.y_class).sum().item()
                total_samples += len(batch)
            
            del shard_data
            print(f"📦 Shard {s_idx+1}/{shard_count} Processed | Current Acc Target: {total_correct/max(1, total_samples):.2%}", flush=True)
            
        acc = total_correct / total_samples
        print(f"Epoch {epoch+1}/{epochs} | Loss: {total_loss/(shard_count*40):.4f} | Acc: {acc:.2%}")
        torch.save(model.state_dict(), "models/ultimate_bioaegis_final.pth")
        
    print(f"🏁 Compact-Sync Synthesis Finalized.", flush=True)

if __name__ == "__main__":
    train_compact_sync()
