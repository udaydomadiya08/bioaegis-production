import torch
import torch.nn as nn
import torch.optim as optim
import os
import gzip
import io
import pickle
from tqdm import tqdm
from torch_geometric.data import DataLoader
from api.training.model import BioAegisXAlpha

def train_targeted_experts(shard_dir="data/shards", epochs=5, batch_size=512):
    """
    Optimizes only 3 specific expert heads (Liver, Cardio, Reproductive)
    while keeping the rest of the ensemble locked.
    """
    device = torch.device('cpu')
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    num_experts = len(tox_classes)
    
    # Target Indices: Cardio=0, Reproductive=1, Liver=3
    target_indices = [0, 1, 3] 
    expert_names = list(tox_classes.keys())
    
    print(f"🧬 Targeted Optimization: Tuning Experts {[expert_names[i] for i in target_indices]}...")

    # 2. Load Existing Model
    model = BioAegisXAlpha(out_channels=num_experts).to(device)
    model_path = "models/ultimate_bioaegis_ensemble.pth"
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False))
        print("✅ Ensemble Weights Loaded for Precision Synthesis.")

    # 3. Neural Lockdown: Freeze Backbone and other heads
    for param in model.parameters():
        param.requires_grad = False
    
    # Unlock only the target expert heads
    # Each head is in model.expert_heads[i]
    active_params = []
    for idx in target_indices:
        for param in model.expert_heads[idx].parameters():
            param.requires_grad = True
            active_params.append(param)
            
    optimizer = optim.AdamW(active_params, lr=0.01) # High learning rate for fast tuning
    criterion = nn.BCEWithLogitsLoss()
    
    shard_files = sorted([f for f in os.listdir(shard_dir) if f.endswith(".pt.gz")])
    
    for epoch in range(epochs):
        model.train()
        print(f"\n🚀 TARGETED EPOCH {epoch+1}/{epochs} | Precision Tuning...")
        
        total_loss = 0
        samples_processed = 0
        
        for shard_name in tqdm(shard_files, desc="Shards"):
            shard_path = os.path.join(shard_dir, shard_name)
            with gzip.open(shard_path, 'rb') as f:
                shard_data = torch.load(io.BytesIO(f.read()), weights_only=False)
            
            # FAST FILTER: Only molecules belonging to target classes
            expert_data = [d for d in shard_data if int(d.y_class) in target_indices]
            if not expert_data:
                del shard_data
                continue
                
            loader = DataLoader(expert_data, batch_size=batch_size, shuffle=True)
            for batch in loader:
                batch = batch.to(device)
                batch.x = batch.x.float()
                batch.edge_attr = batch.edge_attr.float()
                batch.fingerprints = batch.fingerprints.float()
                batch.descriptors = batch.descriptors.float()
                
                optimizer.zero_grad()
                logits, _ = model(batch)
                
                # Targeted Loss Mapping: Only calculate loss for the active heads
                batch_targets = torch.zeros((len(batch), num_experts), dtype=torch.float32)
                loss = 0
                for i in target_indices:
                    # In this targeted mode, batch.y_class matches exactly the head index we want to train
                    label_filter = (batch.y_class == i).float()
                    batch_targets[:, i] = label_filter
                    loss += criterion(logits[:, i], label_filter)
                
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
                samples_processed += len(batch)
            
            del shard_data
            
        print(f"✅ Pass Complete. Samples Processed: {samples_processed} | Loss: {total_loss/max(1, samples_processed):.6f}")
        
    # Save Final Refined Weights
    torch.save(model.state_dict(), "models/ultimate_bioaegis_ensemble.pth")
    print("\n🏁 Precision Synthesis Finalized. Targeted Specialists are optimized.")

if __name__ == "__main__":
    train_targeted_experts()
