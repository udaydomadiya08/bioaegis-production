from rdkit import Chem
from rdkit.Chem import AllChem
import io

def generate_3d_pdb(smiles: str, atom_scores=None) -> str:
    """
    Generates a 3D conformation with injected B-factor importance scores.
    """
    mol = Chem.MolFromSmiles(smiles)
    if not mol: return ""
    
    # 1. Add Hydrogens and Embed
    mol = Chem.AddHs(mol)
    params = AllChem.ETKDGv3()
    params.randomSeed = 42
    if AllChem.EmbedMolecule(mol, params) == -1:
        if AllChem.EmbedMolecule(mol, randomSeed=42) == -1:
            return ""
            
    # 2. Optimize
    try: AllChem.MMFFOptimizeMolecule(mol, maxIters=500)
    except: pass
    
    # 3. Inject Attribution Scores (if provided)
    if atom_scores is not None:
        # Note: mol now has Hs, so we only map scores to heavy atoms first
        # We find heavy atom indices and map scores
        heavy_atom_count = 0
        for atom in mol.GetAtoms():
            if atom.GetAtomicNum() > 1: # Not Hydrogen
                if heavy_atom_count < len(atom_scores):
                    score = atom_scores[heavy_atom_count]
                    atom.SetDoubleProp("_PDB_TEMPFAC", score)
                    heavy_atom_count += 1
                else:
                    atom.SetDoubleProp("_PDB_TEMPFAC", 0.0)
            else:
                atom.SetDoubleProp("_PDB_TEMPFAC", 0.0) # Hs get zero significance
                
    # 4. Export to PDB format
    pdb_block = Chem.MolToPDBBlock(mol)
    return pdb_block

def get_3d_data(smiles: str, atom_scores=None):
    """Returns the PDB data for the molecule with optional attribution marking."""
    try:
        pdb = generate_3d_pdb(smiles, atom_scores=atom_scores)
        return pdb
    except Exception as e:
        print(f"3D Generation Error: {e}")
        return ""
