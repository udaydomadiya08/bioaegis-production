import torch
import os
import gzip
import io
import pickle
from tqdm import tqdm

shard_dir = 'data/shards'
with open('models/label_map.pkl', 'rb') as f:
    lm = pickle.load(f)

tox_classes = {k: v for k, v in lm.items() if isinstance(k, str) and 'Chiral' not in str(k) and 'nan' not in str(k)}
expert_names = {v: k for k, v in tox_classes.items()}
counts = {v: 0 for v in tox_classes.values()}

shard_files = sorted([f for f in os.listdir(shard_dir) if f.endswith('.pt.gz')])

for f_name in tqdm(shard_files):
    path = os.path.join(shard_dir, f_name)
    try:
        with gzip.open(path, 'rb') as f:
            data = torch.load(io.BytesIO(f.read()), weights_only=False)
            for d in data:
                idx = int(d.y_class)
                if idx in counts:
                    counts[idx] += 1
    except:
        continue

print("\n--- 13-EXPERT DATA LANDSCAPE ---")
for idx, count in sorted(counts.items()):
    print(f"[{idx}] {expert_names[idx]:25}: {count} samples")
