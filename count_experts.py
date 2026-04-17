import torch
import os
import gzip
import io
from tqdm import tqdm

shard_dir = 'data/shards'
target_indices = {0: 'Cardiotoxicity', 1: 'Reproductive toxicity', 3: 'Liver toxicity'}
counts = {i: 0 for i in target_indices}

shard_files = sorted([f for f in os.listdir(shard_dir) if f.endswith('.pt.gz')])

for f_name in tqdm(shard_files):
    with gzip.open(os.path.join(shard_dir, f_name), 'rb') as f:
        data = torch.load(io.BytesIO(f.read()), weights_only=False)
        for d in data:
            idx = int(d.y_class)
            if idx in counts:
                counts[idx] += 1

print("\n--- POSITIVE SAMPLE COUNTS ---")
for idx, name in target_indices.items():
    print(f"{name} (Index {idx}): {counts[idx]}")
