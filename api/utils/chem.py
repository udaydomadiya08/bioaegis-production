from rdkit import Chem
from rdkit.Chem import Descriptors, Draw, AllChem, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
import base64
import io

def validate_smiles(smiles: str):
    """Checks if a SMILES string is valid and valid for GNN processing."""
    mol = Chem.MolFromSmiles(smiles)
    if mol:
        # Sanitize to ensure consistent representation
        try:
            Chem.SanitizeMol(mol)
            return True, mol
        except:
            return False, None
    return False, None

def get_molecular_properties(mol):
    """Calculates key ADMET properties for the dashboard."""
    return {
        "mol_wt": round(Descriptors.MolWt(mol), 2),
        "logp": round(Descriptors.MolLogP(mol), 2),
        "tpsa": round(Descriptors.TPSA(mol), 2),
        "h_donors": Descriptors.NumHDonors(mol),
        "h_acceptors": Descriptors.NumHAcceptors(mol),
        "rotatable_bonds": Descriptors.NumRotatableBonds(mol),
        "heavy_atoms": mol.GetNumHeavyAtoms(),
        "fraction_csp3": round(Descriptors.FractionCSP3(mol), 3),
        "labute_asa": round(Descriptors.LabuteASA(mol), 2),
        "mol_mr": round(Descriptors.MolMR(mol), 2),
        "valence_electrons": Descriptors.NumValenceElectrons(mol)
    }

def generate_molecule_svg(mol, highlight_atoms=None, highlight_colors=None):
    """Generates a high-quality SVG string for the frontend, with optional highlights."""
    if mol is None: return ""
    
    AllChem.Compute2DCoords(mol)
    
    # Create drawing object
    drawer = rdMolDraw2D.MolDraw2DSVG(400, 400)
    options = drawer.drawOptions()
    options.useBWAtomPalette() 
    options.padding = 0.1
    options.bondLineWidth = 2
    
    if highlight_atoms is not None:
        drawer.DrawMolecule(mol, highlightAtoms=highlight_atoms, highlightAtomColors=highlight_colors)
    else:
        drawer.DrawMolecule(mol)
        
    drawer.FinishDrawing()
    
    svg = drawer.GetDrawingText()
    return svg.replace('<?xml version=\'1.0\' encoding=\'iso-8859-1\'?>', '')

def get_molecule_summary(smiles: str, atom_scores=None):
    """Combines prediction data with properties and visualization with highlights."""
    valid, mol = validate_smiles(smiles)
    if not valid:
        return None
    
    highlight_atoms = None
    highlight_colors = None
    
    if atom_scores is not None:
        highlight_atoms = []
        highlight_colors = {}
        for i, score in enumerate(atom_scores):
            if score > 0.2: # Threshold for highlighting
                highlight_atoms.append(i)
                # Linear interpolation from White (1,1,1) to Crimson (1,0,0.2)
                r = 1.0
                g = 1.0 - score
                b = 1.0 - score * 0.8
                highlight_colors[i] = (r, g, b)
    
    return {
        "smiles": smiles,
        "properties": get_molecular_properties(mol),
        "svg": generate_molecule_svg(mol, highlight_atoms, highlight_colors)
    }
