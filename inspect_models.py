import torch
import os

models = [
    "models/gnn_toxicity_model_percent_final.pth",
    "models/gnn_model_toxiicty_class2.pth"
]

for m in models:
    if os.path.exists(m):
        print(f"--- {m} ---")
        sd = torch.load(m, map_location="cpu")
        for k, v in sd.items():
            print(f"{k}: {v.shape}")
    else:
        print(f"{m} not found")
