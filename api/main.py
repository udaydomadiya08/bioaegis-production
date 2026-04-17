from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.ultimate_engine import UltimateEngine
from api.utils.chem import get_molecule_summary, validate_smiles
from api.utils.chem_3d import get_3d_data
import os

app = FastAPI(title="Vantix BioAegis API", version="3.0.0-ULTIMATE")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Ultimate Engine (Global singleton)
engine = UltimateEngine(models_dir=os.path.join(os.getcwd(), "models"))

class PredictionRequest(BaseModel):
    smiles: str

class PredictionResponse(BaseModel):
    smiles: str
    valid: bool
    toxicity: dict = None
    properties: dict = None
    svg: str = None
    pdb: str = None # New 3D structural data
    error: str = None

@app.get("/")
async def health_check():
    return {"status": "operational", "engine": "Vantix GNN v1.1-3D"}

@app.post("/analyze", response_model=PredictionResponse)
async def analyze_compound(request: PredictionRequest):
    smiles = request.smiles.strip()
    
    # Check chemical validity
    valid, mol = validate_smiles(smiles)
    if not valid:
        return PredictionResponse(smiles=smiles, valid=False, error="Invalid SMILES string")
    
    # Get high-level summary (properties + SVG)
    summary = get_molecule_summary(smiles)
    if not summary:
        return PredictionResponse(smiles=smiles, valid=False, error="Chemistry engine processing failed")
    
    # 1. Run GNN Inference (Predictive + Attribution Pass)
    results = engine.predict(smiles)
    if not results:
        return PredictionResponse(smiles=smiles, valid=False, error="GNN inference engine failed")
    
    # 2. Get high-level summary with Toxicophore Highlighting
    # We pass the atom_scores back to the summary generator for SVG injection
    atom_scores = results.get("atom_scores")
    summary = get_molecule_summary(smiles, atom_scores=atom_scores)
    
    # 3. Generate 3D PDB data with embedded attribution scores
    pdb_data = get_3d_data(smiles, atom_scores=atom_scores)
    
    return PredictionResponse(
        smiles=smiles,
        valid=True,
        toxicity=results,
        properties=summary["properties"],
        svg=summary["svg"],
        pdb=pdb_data
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
