FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for RDKit and structural visualization
RUN apt-get update && apt-get install -y \
    libxrender1 \
    libxext6 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire API and the trained Model
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=7860

# Launch the BioAegis X-Alpha Engine
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
