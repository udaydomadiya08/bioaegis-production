import torch
import torch.nn.functional as F
from torch_geometric.nn import AttentiveFP, global_add_pool
from torch_geometric.data import Data, Batch
import torch.nn as nn

class BioAegisXAlpha(nn.Module):
    """
    Ultimate Hybrid Triple-Fusion Architecture:
    Combines AttentiveFP (Graph-Level), Morgan Fingerprints (Local Synergies), 
    and Physicochemical Fusion (Global-Level).
    """
    def __init__(self, in_channels=11, edge_dim=5, hidden_channels=128, out_channels=13, edge_layers=3, graph_layers=3):
        super(BioAegisXAlpha, self).__init__()
        
        # 1. Attentive Graph Transformer Core
        self.gnn = AttentiveFP(
            in_channels=in_channels,
            hidden_channels=hidden_channels,
            out_channels=hidden_channels, 
            edge_dim=edge_dim,
            num_layers=graph_layers,
            num_timesteps=edge_layers,
            dropout=0.2
        )
        
        # 2. Morgan Fingerprint MLP (Local Structural Context)
        self.fp_mlp = nn.Sequential(
            nn.Linear(2048, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),
            nn.Linear(512, hidden_channels),
            nn.ReLU()
        )
        
        # 3. Expanded Physicochemical Descriptor MLP (Global Context)
        # Increased from 8 to 12 descriptors
        self.descriptor_mlp = nn.Sequential(
            nn.Linear(12, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Linear(64, hidden_channels),
            nn.ReLU()
        )
        
        # 4. Multi-Expert Fusion Head
        self.fusion = nn.Sequential(
            nn.Linear(hidden_channels * 3, 256),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        
        # 13 Independent Experts (Toxicity Class Probabilities)
        self.tox_heads = nn.Linear(256, out_channels)
        
        # 5. Global Toxicity Regression (Overall Severity 0-1)
        self.regression_head = nn.Linear(256, 1)

    def forward(self, data):
        # A. Graph Embedding Path
        graph_embed = self.gnn(data.x, data.edge_index, data.edge_attr, data.batch)
        
        # B. Fingerprint Path
        fp_embed = self.fp_mlp(data.fingerprints)
        
        # C. Descriptor Path
        desc_embed = self.descriptor_mlp(data.descriptors)
        
        # D. Triple-Fusion
        combined = torch.cat([graph_embed, fp_embed, desc_embed], dim=1)
        
        # E. Logic Processing
        shared = self.fusion(combined) 
        
        # 13 Expert Logits
        logits = self.tox_heads(shared)
        
        # Global Severity Scalar
        percentage = self.regression_head(shared)
        
        return logits, percentage.squeeze()

def get_morgan_fp(mol, radius=2, n_bits=2048):
    """Calculates Morgan Fingerprint as a torch tensor."""
    from rdkit.Chem import AllChem
    import numpy as np
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius, nBits=n_bits)
    arr = np.zeros((0,), dtype=np.int8)
    from rdkit import DataStructs
    DataStructs.ConvertToNumpyArray(fp, arr)
    return torch.tensor(arr, dtype=torch.float)

def get_chem_features(mol):
    """
    Exhaustive Atom Featurization for AttentiveFP.
    Returns: node_features, edge_index, edge_attr
    """
    # Atom features
    atoms = []
    for atom in mol.GetAtoms():
        features = [
            atom.GetAtomicNum(),
            atom.GetDegree(),
            atom.GetFormalCharge(),
            int(atom.GetIsAromatic()),
            atom.GetImplicitValence(),
            atom.GetHybridization().real,
            atom.GetNumRadicalElectrons(),
            int(atom.IsInRing()),
            atom.GetChiralTag().real,
            atom.GetTotalNumHs(),
            atom.GetMass() * 0.01 
        ]
        atoms.append(features)
    
    # Edge features
    edges = []
    edge_attr = []
    for bond in mol.GetBonds():
        indices = [bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()]
        edges.extend([[indices[0], indices[1]], [indices[1], indices[0]]])
        
        b_type = bond.GetBondTypeAsDouble()
        b_is_conj = int(bond.GetIsConjugated())
        b_in_ring = int(bond.IsInRing())
        b_stereo = bond.GetStereo().real
        b_attr = [b_type, b_is_conj, b_in_ring, b_stereo, 1.0] 
        edge_attr.extend([b_attr, b_attr])

    return (
        torch.tensor(atoms, dtype=torch.float),
        torch.tensor(edges, dtype=torch.long).t().contiguous(),
        torch.tensor(edge_attr, dtype=torch.float)
    )
