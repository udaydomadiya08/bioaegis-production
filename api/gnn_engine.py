import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv, GCNConv, global_mean_pool, global_max_pool
from torch_geometric.data import Data
from rdkit import Chem
import numpy as np
import pickle
import os

class ToxicityRegressor(torch.nn.Module):
    """GNN Model for Toxicity Percentage Prediction (Regression)"""
    def __init__(self):
        super(ToxicityRegressor, self).__init__()
        self.conv1 = GCNConv(4, 64)
        self.conv2 = GCNConv(64, 128)
        self.fc1 = torch.nn.Linear(128, 64)
        self.fc2 = torch.nn.Linear(64, 1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = global_mean_pool(x, data.batch)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

class ToxicityClassifier(torch.nn.Module):
    """GNN model for Toxicity Class Prediction (Classification)"""
    def __init__(self, input_dim=1, num_classes=13):
        super(ToxicityClassifier, self).__init__()
        self.conv1 = GCNConv(input_dim, 64)
        self.conv2 = GCNConv(64, 128)
        self.fc1 = torch.nn.Linear(128, 64)
        self.fc2 = torch.nn.Linear(64, num_classes)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = global_mean_pool(x, data.batch)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def smiles_to_graph_regression(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None: return None
    
    atom_features = []
    for atom in mol.GetAtoms():
        atom_features.append([
            atom.GetAtomicNum(),
            atom.GetDegree(),
            atom.GetImplicitValence(),
            atom.GetFormalCharge()
        ])
    
    edge_index = []
    for bond in mol.GetBonds():
        edge_index.append([bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()])
        edge_index.append([bond.GetEndAtomIdx(), bond.GetBeginAtomIdx()])
    
    return Data(
        x=torch.tensor(atom_features, dtype=torch.float),
        edge_index=torch.tensor(edge_index, dtype=torch.long).t().contiguous()
    )

def smiles_to_graph_classification(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None: return None
    atoms = [atom.GetAtomicNum() for atom in mol.GetAtoms()]
    edges = [(bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()) for bond in mol.GetBonds()]
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous() if edges else torch.empty((2,0), dtype=torch.long)
    x = torch.tensor(atoms, dtype=torch.float32).view(-1, 1)
    return Data(x=x, edge_index=edge_index)

class GNNEngine:
    def __init__(self, models_dir="models"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.regressor = ToxicityRegressor().to(self.device)
        self.classifier = ToxicityClassifier().to(self.device)
        
        # Load weights
        reg_path = os.path.join(models_dir, "gnn_toxicity_model_percent_final.pth")
        clf_path = os.path.join(models_dir, "gnn_model_toxiicty_class2.pth")
        
        if os.path.exists(reg_path):
            self.regressor.load_state_dict(torch.load(reg_path, map_location=self.device))
        self.regressor.eval()
        
        if os.path.exists(clf_path):
            self.classifier.load_state_dict(torch.load(clf_path, map_location=self.device))
        self.classifier.eval()
        
        # Load encoders
        self.label_encoder = None
        le_path = os.path.join(models_dir, "label_encoder_class.pkl")
        if os.path.exists(le_path):
            try:
                with open(le_path, "rb") as f:
                    self.label_encoder = pickle.load(f)
            except:
                print("Failed to load label encoder.")

    def predict(self, smiles):
        try:
            # Regression Prediction
            reg_graph = smiles_to_graph_regression(smiles)
            if reg_graph is None: return None
            reg_graph = reg_graph.to(self.device)
            with torch.no_grad():
                percent = self.regressor(reg_graph).item()
            
            # Classification Prediction
            clf_graph = smiles_to_graph_classification(smiles)
            if clf_graph is None: return None
            clf_graph = clf_graph.to(self.device)
            with torch.no_grad():
                logits = self.classifier(clf_graph)
                class_idx = torch.argmax(logits, dim=1).item()
            
            try:
                class_name = self.label_encoder.inverse_transform([class_idx])[0] if self.label_encoder else str(class_idx)
            except:
                class_name = str(class_idx)
            
            return {
                "toxicity_percent": round(max(0, min(100, percent * 100)), 2),
                "toxicity_class": class_name,
                "confidence": float(torch.softmax(logits, dim=1)[0][class_idx])
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            return None
