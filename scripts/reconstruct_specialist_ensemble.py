import torch
import torch.nn as nn
import torch.optim as optim
import os
import glob
import pandas as pd
from torch_geometric.data import DataLoader
from api.training.model import BioAegisXAlpha
import pickle
import subprocess

def reconstruct_specialist_ensemble(shard_dir="data/class_specific", model_path="models/ultimate_bioaegis_ensemble.pth"):
    """
    Orchestrates the Atomic 13-Expert Reconstruction:
    - For each expert: Extract -> Train -> Delete.
    - Maintains a near-zero disk footprint.
    """
    device = torch.device('cpu')
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    num_experts = max(tox_classes.values()) + 1

    # 2. Load Master CSV for Triage Sorting
    df = pd.read_csv("data/merge_file copy.csv", low_memory=False)
    counts = df['Toxicity class'].value_counts()
    sorted_classes = sorted(tox_classes.items(), key=lambda x: counts.get(x[0], 0))

    # 3. Iterate through experts in Triage Order (Rare first)
    for class_name, class_id in sorted_classes:
        name = class_name
        
        print(f"\n🚀 ATOMIC MASTERY: {name} (Head {class_id})...")
        
        # A. Targeted Extraction
        print(f"  🧬 Extracting Shards...")
        subprocess.run(["python3", "scripts/reconstruct_hybrid_dataset.py", str(class_id)], check=True)
        
        # B. Load Model (Reload every time to keep it fresh and secured)
        model = BioAegisXAlpha(out_channels=num_experts).to(device)
        if os.path.exists(model_path):
            try:
                # Use strict=False to allow for tox_heads shape mismatch during architecture expansion
                model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False), strict=False)
            except Exception as e:
                print(f"⚠️ Warning: Flexible load active: {e}")
        else:
            # First time initialization: Clean Slate
            nn.init.xavier_uniform_(model.tox_heads.weight)
            nn.init.constant_(model.tox_heads.bias, 0.0)
            
        # C. Neural Lockdown: Freeze Backbone, UNLOCK HEADS
        for param in model.parameters():
            param.requires_grad = False
        for param in model.tox_heads.parameters():
            param.requires_grad = True
        
        # NEURAL RESET for THIS SPECIFIC HEAD: ensure we start fresh for this class
        with torch.no_grad():
            nn.init.xavier_uniform_(model.tox_heads.weight[class_id:class_id+1])
            nn.init.constant_(model.tox_heads.bias[class_id], 0.0)
        
        criterion = nn.BCEWithLogitsLoss()
        optimizer = optim.AdamW(model.tox_heads.parameters(), lr=0.01)
        
        # D. Training Pass
        shards = glob.glob(os.path.join(shard_dir, f"expert_{class_id}*.pt"))
        if not shards:
            print(f"⚠️ Error: No shards generated for {name}.")
            continue
            
        model.train()
        for shard_path in sorted(shards):
            try:
                data_list = torch.load(shard_path, weights_only=False)
                loader = DataLoader(data_list, batch_size=512, shuffle=True)
                
                total_loss = 0
                for batch in loader:
                    batch = batch.to(device)
                    optimizer.zero_grad()
                    logits, _ = model(batch)
                    loss = criterion(logits[:, class_id], batch.y.squeeze())
                    loss.backward()
                    
                    # Grad Masking
                    with torch.no_grad():
                        mask = torch.zeros_like(model.tox_heads.weight.grad)
                        mask[class_id, :] = 1.0
                        model.tox_heads.weight.grad *= mask
                        if model.tox_heads.bias is not None:
                            bias_mask = torch.zeros_like(model.tox_heads.bias.grad)
                            bias_mask[class_id] = 1.0
                            model.tox_heads.bias.grad *= bias_mask
                    
                    optimizer.step()
                    total_loss += loss.item()
                
                print(f"  📦 Shard {os.path.basename(shard_path)} training: Loss {total_loss/len(loader) if len(loader) > 0 else 0:.6f}")
                
            except Exception as e:
                print(f"⚠️ Warning: Failed to process shard {shard_path}: {e}")
                
        # E. Atomic Save & Sync
        temp_path = model_path + ".tmp"
        torch.save(model.state_dict(), temp_path)
        os.rename(temp_path, model_path)
        print(f"✅ {name} Mastery Finalized & Synced.")
        
        # F. Workspace Recapture: DELETE SHARDS IMMEDIATELY
        for s in shards:
            try: os.remove(s)
            except: pass
        print(f"  🧹 Workspace Recaptured: Shards for {name} purged.")

    print("\n🏁 Operation Hybrid Reconstruction: All 13 Expert Heads are secured.")

if __name__ == "__main__":
    reconstruct_specialist_ensemble()
