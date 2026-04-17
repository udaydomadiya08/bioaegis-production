from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.ultimate_engine import UltimateEngine
from api.utils.chem import get_molecule_summary, validate_smiles
from api.utils.chem_3d import get_3d_data
import os

from contextlib import asynccontextmanager

# Initialize Global engine reference
engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Reconstitute Neural Core and Lock In Thresholds
    global engine
    print("🛰️ BioAegis X-Alpha: Initializing Command Startup Protocol...")
    try:
        engine = UltimateEngine()
        print("✅ BioAegis X-Alpha: Operational Sync Complete.")
    except Exception as e:
        print(f"❌ BioAegis X-Alpha: Critical Startup Failure: {e}")
    yield
    # Shutdown: Clean up resources if needed
    print("🛰️ BioAegis X-Alpha: Offline.")

app = FastAPI(
    title="Vantix BioAegis API", 
    version="3.0.0-ULTIMATE",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/analyze")
async def analyze_compound(request: PredictionRequest):
    smiles = request.smiles.strip()
    
    # Check chemical validity
    valid, mol = validate_smiles(smiles)
    if not valid:
        return {"smiles": smiles, "valid": False, "error": "Invalid SMILES string"}
    
    # Get high-level summary (properties + SVG)
    summary = get_molecule_summary(smiles)
    if not summary:
        return {"smiles": smiles, "valid": False, "error": "Chemistry engine processing failed"}
    
    # 1. Run GNN Inference (Predictive + Attribution Pass)
    results = engine.predict(smiles)
    if not results:
        return {"smiles": smiles, "valid": False, "error": "GNN inference engine failed"}
    
    # 2. Get high-level summary with Toxicophore Highlighting
    atom_scores = results.get("explanation", {}).get("atom_scores")
    summary = get_molecule_summary(smiles, atom_scores=atom_scores)
    
    # 3. Generate 3D PDB data with embedded attribution scores
    pdb_data = get_3d_data(smiles, atom_scores=atom_scores)
    
    # 4. Global Metadata Synchronization (Flattened Payload)
    return {
        "smiles": smiles,
        "valid": True,
        **results,
        "properties": summary["properties"],
        "svg": summary["svg"],
        "pdb": pdb_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
