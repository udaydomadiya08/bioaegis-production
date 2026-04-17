import torch
import torch.nn.functional as F
from torch_geometric.data import Data, Batch
from api.training.model import BioAegisXAlpha, get_chem_features
from rdkit import Chem
from rdkit.Chem import Descriptors
import pickle
import os
import numpy as np
from huggingface_hub import hf_hub_download

class UltimateEngine:
    """
    Ultimate Inference Engine for BioAegis X-Alpha.
    Handles graph transformation, physicochemical fusion, and dual-mode prediction.
    """
    def __init__(self, models_dir="models"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.repo_id = "UDAYDOMADIYA/bioaegis-weights"
        
        # Cloud-Native Umbilical: Pull weights from Hub if missing
        print(f"🛰️ BioAegis System: Synchronizing weights from {self.repo_id}...")
        try:
            self.model_path = hf_hub_download(repo_id=self.repo_id, filename="ultimate_bioaegis_ensemble.pth")
            self.label_map_path = hf_hub_download(repo_id=self.repo_id, filename="label_map.pkl")
            print("✅ Cloud Weights Synchronized. System Operational.")
        except Exception as e:
            print(f"⚠️ Cloud Sync Failed: {e}. Attempting local fallback...")
            self.model_path = os.path.join(models_dir, "ultimate_bioaegis_ensemble.pth")
            self.label_map_path = os.path.join(models_dir, "label_map.pkl")
        
        self.label_map = None
        if os.path.exists(self.label_map_path):
            with open(self.label_map_path, "rb") as f:
                self.label_map = pickle.load(f)
                self.inv_label_map = {v: k for k, v in self.label_map.items()}

        # 4. Standard 13-Expert Pharmacological Mapping (Indices 0-13)
        self.tox_experts = [
            "Cardiotoxicity",          # 0
            "Reproductive toxicity",   # 1
            None,                      # 2 (Empty Vector)
            "Liver toxicity",          # 3
            "Genotoxicity",            # 4
            "Hepatotoxicity",          # 5
            "Eye corrosion",           # 6
            "Eye irritation",          # 7
            "Zinc toxicity",           # 8
            "Mutagenecity",            # 9
            "Respiratory toxicity",    # 10
            "Skin toxicity",           # 11
            "Carcinogenicity",         # 12
            "Acute Toxicity"           # 13
        ]

        # Robust Loading: Ensemble Specialist Detection (14 Channels Required)
        self.model = BioAegisXAlpha(out_channels=14).to(self.device)
        if os.path.exists(self.model_path):
            state_dict = torch.load(self.model_path, map_location=self.device, weights_only=False)
            try:
                self.model.load_state_dict(state_dict, strict=False)
                print(f"✅ Ensemble Model Synchronized (14-Channel Core).")
            except Exception as e:
                print(f"⚠️ Weight Sync Warning: {e}. Skeleton active.")
        else:
            print("⚠️ Warning: Production weights not found. Ensemble Skeleton active.")
        
        self.model.eval()

    def predict(self, smiles):
        try:
            mol = Chem.MolFromSmiles(smiles)
            if not mol: return None
            
            # 1. High-Fidelity Featurization
            from api.training.model import get_chem_features, get_morgan_fp
            x, edge_index, edge_attr = get_chem_features(mol)
            x = x.to(self.device).requires_grad_(True)
            fingerprints = get_morgan_fp(mol).unsqueeze(0).to(self.device)
            
            from rdkit.Chem import Descriptors as Desc
            desc_values = [
                Desc.MolWt(mol), Desc.MolLogP(mol), Desc.TPSA(mol),
                Desc.NumHDonors(mol), Desc.NumHAcceptors(mol), mol.GetNumHeavyAtoms(),
                Desc.NumRotatableBonds(mol), Desc.NumValenceElectrons(mol),
                Desc.FractionCSP3(mol), Desc.LabuteASA(mol), Desc.MolMR(mol), 0.5
            ]
            descriptors = torch.tensor([desc_values], dtype=torch.float).to(self.device)
            
            # 2. Universal Batch Inference
            data = Data(x=x, edge_index=edge_index.to(self.device), 
                        edge_attr=edge_attr.to(self.device), fingerprints=fingerprints, descriptors=descriptors)
            batch = Batch.from_data_list([data])
            
            # 3. Neural Expert Consensus
            # logits: [1, 13] | regression: [1]
            logits, global_severity = self.model(batch)
            
            # Apply Sigmoid for independent probabilities
            probs = torch.sigmoid(logits)[0] # Shape [13]
            
            # Map probabilities to experts (Skip Index 2)
            expert_results = {}
            for i, name in enumerate(self.tox_experts):
                if name is not None:
                    expert_results[name] = round(probs[i].item() * 100, 2)
            
            # 4. Calculate Industrial Toxicity Index (1.0000 - 10.0000)
            # Uses max expert confidence + weighted global mean
            base_score = probs.max().item() * 9 + 1 # Map 0-1 to 1-10
            overall_index_4dec = round(base_score, 4)
            
            # 5. Scientific Attribution (XAI)
            # Target the most critical expert head
            max_idx = torch.argmax(probs)
            target_expert_logit = logits[0, max_idx]
            target_expert_logit.backward()
            
            atom_scores = torch.norm(x.grad, dim=1)
            atom_scores = (atom_scores - atom_scores.min()) / (atom_scores.max() - atom_scores.min() + 1e-6)
            
            return {
                "overall_toxicity_index": overall_index_4dec,
                "overall_percent": round(probs.max().item() * 100, 2),
                "expert_profiling": expert_results,
                "atom_scores": atom_scores.cpu().detach().tolist(),
                "status": "BioAegis 13-Expert Ensemble Active"
            }
        except Exception as e:
            print(f"Ultimate Inference Error: {e}")
            import traceback
            traceback.print_exc()
            return None
