import torch
import os
import gzip
import io
import pickle
from torch_geometric.data import DataLoader
from api.training.model import BioAegisXAlpha

def run_diagnostic_probe(model_path="models/ultimate_bioaegis_ensemble.pth"):
    """
    Performs an industrial accuracy audit on the 13-expert ensemble.
    """
    device = torch.device('cpu')
    
    # 1. Load Alignment Data
    with open("models/label_map.pkl", "rb") as f:
        label_map = pickle.load(f)
    
    tox_classes = {k: v for k, v in label_map.items() if isinstance(k, str) and "Chiral" not in str(k) and "nan" not in str(k)}
    expert_names = list(tox_classes.keys())
    class_indices = list(tox_classes.values())
    num_experts = len(tox_classes)
    
    print(f"🔍 Diagnostic Probe: Initializing Audit for {num_experts} Experts...")
    
    if not os.path.exists(model_path):
        print(f"⚠️ Probe Standby: Waiting for {model_path}...")
        return

    # 2. Load Model
    model = BioAegisXAlpha(out_channels=num_experts).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False))
    model.eval()
    
    # 3. Perform Audit on Shard 0 (Independent Validation)
    shard_path = "data/shards/shard_0.pt.gz"
    with gzip.open(shard_path, 'rb') as f:
        shard_data = torch.load(io.BytesIO(f.read()), weights_only=False)
    
    loader = DataLoader(shard_data, batch_size=256, shuffle=False)
    
    total_samples = 0
    total_correct = torch.zeros(num_experts)
    
    with torch.no_grad():
        for batch in loader:
            batch = batch.to(device)
            # 32-Bit Synchronization
            batch.x = batch.x.float()
            batch.edge_attr = batch.edge_attr.float()
            batch.fingerprints = batch.fingerprints.float()
            batch.descriptors = batch.descriptors.float()
            
            logits, _ = model(batch)
            preds = (torch.sigmoid(logits) > 0.5).float()
            
            # targets creation
            targets = torch.zeros((len(batch), num_experts))
            for i in range(num_experts):
                targets[:, i] = (batch.y_class == class_indices[i]).float()
            
            total_correct += (preds == targets).sum(dim=0)
            total_samples += len(batch)
            
    print("\n" + "═"*60)
    print("📈 INDUSTRIAL ENSEMBLE DIAGNOSTIC REPORT")
    print("═"*60)
    accuracies = (total_correct / total_samples) * 100
    for i, name in enumerate(expert_names):
        print(f"   ┠─ {name:25}: {accuracies[i].item():.2f}%")
    print("═"*60)
    print(f"🏁 Diagnostic Complete. Tested on {total_samples} molecular samples.")

if __name__ == "__main__":
    run_diagnostic_probe()
