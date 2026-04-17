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
    def __init__(self, models_dir="api"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.repo_id = "UDAYDOMADIYA/bioaegis-weights"
        
        # Cloud-Native Umbilical: Pull weights from Hub if missing
        print(f"🛰️ BioAegis System: Synchronizing weights from {self.repo_id}...")
        try:
            self.model_path = hf_hub_download(repo_id=self.repo_id, filename="ultimate_bioaegis_final.pth")
            self.label_map_path = hf_hub_download(repo_id=self.repo_id, filename="label_map.pkl")
            print("✅ Cloud Weights Synchronized. System Operational.")
        except Exception as e:
            print(f"⚠️ Cloud Sync Failed: {e}. Attempting local fallback...")
            self.model_path = os.path.join(models_dir, "ultimate_bioaegis_final.pth")
            self.label_map_path = os.path.join(models_dir, "label_map.pkl")
        
        self.label_map = None
        if os.path.exists(self.label_map_path):
            with open(self.label_map_path, "rb") as f:
                self.label_map = pickle.load(f)
                self.inv_label_map = {v: k for k, v in self.label_map.items()}
        
        # Determine number of classes
        num_classes = len(self.label_map) if self.label_map else 13
        
        # Robust Loading: Detect out_channels from weights if available
        if os.path.exists(self.model_path):
            state_dict = torch.load(self.model_path, map_location=self.device, weights_only=False)
            num_classes = state_dict['fusion.7.weight'].shape[0] if 'fusion.7.weight' in state_dict else num_classes
            self.model = BioAegisXAlpha(out_channels=num_classes).to(self.device)
            self.model.load_state_dict(state_dict)
            print(f"✅ Triple-Fusion Model Synchronized ({num_classes} classes).")
        else:
            self.model = BioAegisXAlpha(out_channels=num_classes).to(self.device)
            print("⚠️ Warning: Production weights not found. Skeleton active.")
        
        self.model.eval()

    def predict(self, smiles):
        try:
            mol = Chem.MolFromSmiles(smiles)
            if not mol: return None
            
            # 1. High-Fidelity Featurization
            from api.training.model import get_chem_features, get_morgan_fp
            x, edge_index, edge_attr = get_chem_features(mol)
            
            # Enable gradients for Attribution Pass
            x = x.to(self.device).requires_grad_(True)
            
            # 2. Extract Morgan Fingerprint (2048-bit)
            fingerprints = get_morgan_fp(mol).unsqueeze(0).to(self.device)
            
            # 3. Extract Expanded Descriptors
            from rdkit.Chem import Descriptors as Desc
            desc_values = [
                Desc.MolWt(mol), Desc.MolLogP(mol), Desc.TPSA(mol),
                Desc.NumHDonors(mol), Desc.NumHAcceptors(mol), mol.GetNumHeavyAtoms(),
                Desc.NumRotatableBonds(mol), Desc.NumValenceElectrons(mol),
                Desc.FractionCSP3(mol), Desc.LabuteASA(mol), Desc.MolMR(mol), 0.5
            ]
            descriptors = torch.tensor([desc_values], dtype=torch.float).to(self.device)
            
            # 4. Create Batch
            data = Data(x=x, edge_index=edge_index.to(self.device), 
                        edge_attr=edge_attr.to(self.device), fingerprints=fingerprints, descriptors=descriptors)
            batch = Batch.from_data_list([data])
            
            # 5. Neural Inference (Predictive & Attribution Passes)
            # A. Predictive Pass
            logits, percentage = self.model(batch)
            
            probs = torch.softmax(logits, dim=1)[0]
            top_probs, top_indices = torch.topk(probs, k=min(3, probs.size(0)))
            
            top_classes = []
            for i in range(top_probs.size(0)):
                idx = top_indices[i].item()
                prob = top_probs[i].item()
                name = self.inv_label_map.get(idx, f"Class {idx}") if self.label_map else f"Class {idx}"
                top_classes.append({"class": name, "confidence": round(prob, 4)})
            
            # B. Attribution Pass (Gradient Saliency)
            # Targeting the top predicted class for "Scientific Explanation"
            target_logit = logits[0, top_indices[0]]
            target_logit.backward(retain_graph=True)
            
            # Atom scores (Norm of gradients across feature dimensions)
            # x.grad shape: [num_atoms, in_channels]
            atom_scores = torch.norm(x.grad, dim=1)
            atom_scores = (atom_scores - atom_scores.min()) / (atom_scores.max() - atom_scores.min() + 1e-6)
            
            tox_percent = percentage.item() * 100.0 
            
            return {
                "toxicity_percent": round(max(0, min(100, tox_percent)), 2),
                "toxicity_class": top_classes[0]["class"],
                "confidence": top_classes[0]["confidence"],
                "top_classes": top_classes,
                "atom_scores": atom_scores.cpu().detach().tolist(),
                "status": "BioAegis X-Alpha Triple-Fusion + XAI Active"
            }
        except Exception as e:
            print(f"Ultimate Inference Error: {e}")
            import traceback
            traceback.print_exc()
            return None
