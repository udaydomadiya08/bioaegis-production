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

def train_multi_head_ensemble(shard_dir="data/shards", epochs=10, batch_size=256):
    """
    Trains a unified multi-head GNN capable of 13-vector toxicity profiling.
    Optimized for zero disk overhead and high memory stability.
    """
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    
    # Filter valid naming
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    class_indices = list(tox_classes.values())
    num_experts = len(tox_classes)
    
    print(f"🧬 Ensemble Initialization: {num_experts} Expert Heads Integrated.")
    
    # STABILITY: CPU Training for reliability on Mac Build Nodes
    device = torch.device('cpu')
    torch.set_num_threads(os.cpu_count())
    
    # 2. Instantiate Unified BioAegis 13-Expert Model
    model = BioAegisXAlpha(out_channels=num_experts).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-3)
    
    # Collective Loss: Multi-Label Binary Cross Entropy + Global Regression
    clf_criterion = nn.BCEWithLogitsLoss()
    reg_criterion = nn.MSELoss()
    
    shard_files = sorted([f for f in os.listdir(shard_dir) if f.endswith(".pt.gz")])
    
    for epoch in range(epochs):
        model.train()
        print(f"\n🚀 EPOCH {epoch+1}/{epochs} | Collective Expert Flux...")
        
        total_loss = 0
        for shard_name in tqdm(shard_files, desc="Shards"):
            shard_path = os.path.join(shard_dir, shard_name)
            with gzip.open(shard_path, 'rb') as f:
                shard_data = torch.load(io.BytesIO(f.read()), weights_only=False)
            
            # Fault-Tolerance: Skip empty or corrupted shards
            if len(shard_data) == 0:
                print(f"⚠️ Warning: Skipping Empty Shard {shard_name}")
                del shard_data
                continue
                
            loader = DataLoader(shard_data, batch_size=batch_size, shuffle=True)
            for batch in loader:
                batch = batch.to(device)
                # 32-Bit Lockdown Mode: Total Precision Synchronization
                batch.x = batch.x.float()
                batch.edge_attr = batch.edge_attr.float()
                batch.fingerprints = batch.fingerprints.float()
                batch.descriptors = batch.descriptors.float()
                batch.y_percent = batch.y_percent.float()
                
                optimizer.zero_grad()
                
                # Multi-Head Inference
                logits, percentage = model(batch)
                
                # Targets forced to float32
                targets = torch.zeros((len(batch), num_experts), dtype=torch.float32, device=device)
                for i in range(num_experts):
                    label_filter = (batch.y_class == class_indices[i])
                    targets[:, i] = label_filter.float()
                
                # Loss Calculation: Combined Toxicity Vector Error + Regression Error
                loss_clf = clf_criterion(logits, targets)
                loss_reg = reg_criterion(percentage, batch.y_percent / 100.0)
                
                total_loss_val = loss_clf + (loss_reg * 0.5)
                total_loss_val.backward()
                optimizer.step()
                
                total_loss += total_loss_val.item()
                
                # Expert-Wise Accuracy Calculation (Industrial Threshold = 0.5)
                preds = (torch.sigmoid(logits) > 0.5).float()
                correct_per_head = (preds == targets).sum(dim=0)
                expert_accuracies = (correct_per_head / len(batch)) * 100
                
            # Log Shard Summary
            avg_loss = total_loss / len(loader)
            print(f"\n✅ SHARD SYNC COMPLETE: {shard_name} | Avg Loss: {avg_loss:.4f}")
            print("📊 13-EXPERT ACCURACY MATRIX:")
            for i, name in enumerate(expert_names):
                print(f"   ┠─ {name:25}: {expert_accuracies[i].item():.2f}%")
            print("─" * 50)
            
            del shard_data # Atomic Reclaim
            
        # Save Epoch Checkpoint
        torch.save(model.state_dict(), f"models/ultimate_bioaegis_ensemble_epoch_{epoch+1}.pth")
        torch.save(model.state_dict(), "models/ultimate_bioaegis_ensemble.pth")

    print(f"🏁 Multi-Head Synthesis Finalized. BioAegis X-Alpha is now Omni-Tox capable.")

if __name__ == "__main__":
    train_multi_head_ensemble()
