# FastAPI RAG & Document Processing Microservice

This service handles **RAG (Retrieval-Augmented Generation)**, vector search with **ChromaDB**, document parsing (`PyPDF2`, `pdfplumber`), and OCR image extraction (`tesseract`) for **GlobalAssign**.

---

## 📂 Folder Structure

```
FastAPI/
├── main.py              # FastAPI application entry point with CORS & endpoints
├── requirements.txt      # Python dependencies (FastAPI, ChromaDB, Uvicorn, OCR)
├── Dockerfile           # Docker container configuration with Tesseract OCR support
├── .env.example         # Environment template file
├── services/            # Dedicated folder for RAG modules & vector store logic
│   ├── rag_engine.py
│   ├── vector_store.py
│   └── text_extractor.py
└── README.md
```

---

## 🚀 Running the FastAPI Service

### Option 1: Local Python Environment

```bash
# Navigate to FastAPI directory
cd FastAPI

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server with Uvicorn
uvicorn main:app --port 8000 --reload
```

Interactive API documentation available at `http://localhost:8000/docs`.

---

### Option 2: Docker Container

```bash
# Build Docker image
docker build -t globalassign-fastapi .

# Run Docker container
docker run -p 8000:8000 globalassign-fastapi
```

---

## 📑 Core Endpoints

* `GET /health` - Health check status endpoint.
* `POST /extract-text` - Accepts file upload for PDF parsing & OCR text extraction.
* `POST /rag/query` - Executes ChromaDB vector search and retrieves context for AI chatbot grading responses.
