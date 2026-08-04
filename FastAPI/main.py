import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from rag_engine import RAGEngine

load_dotenv()

app = FastAPI(
    title="GlobalAssign RAG & Document Q&A Microservice",
    description="Vector search using HuggingFace embeddings, ChromaDB storage, and Gemini AI context summarization.",
    version="1.0.0"
)

# Enable CORS for Next.js Frontend and Express Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy singleton instance of RAGEngine
_rag_engine_instance = None

def get_rag_engine() -> RAGEngine:
    global _rag_engine_instance
    if _rag_engine_instance is None:
        print("[FastAPI] Initializing RAGEngine...")
        _rag_engine_instance = RAGEngine()
    return _rag_engine_instance


# Pydantic Schemas
class IngestMongoTextRequest(BaseModel):
    doc_id: str = Field(..., description="Document or Submission ObjectId from MongoDB")
    text: Optional[str] = Field(None, description="Extracted text of document stored in MongoDB")
    file_url: Optional[str] = Field(None, description="S3 or HTTP file URL to download and extract text if text is empty")
    title: Optional[str] = Field(None, description="Optional document title or filename")


class RAGQueryRequest(BaseModel):
    doc_id: Optional[str] = Field(None, description="Document or Submission ObjectId from MongoDB")
    text: Optional[str] = Field(None, description="Extracted text from MongoDB if not already embedded")
    file_url: Optional[str] = Field(None, description="S3 / HTTP URL of the document file to extract text from if MongoDB text is empty")
    query: str = Field(..., description="Teacher's question or search query (e.g. 'is Java present in doc')")
    top_k: int = Field(5, description="Number of top matching chunks to retrieve from ChromaDB")


class RAGQueryResponse(BaseModel):
    status: str
    doc_id: Optional[str]
    query: str
    answer: str
    present: bool
    occurrences: int
    sources: List[str]


# Background Worker Function
def process_bg_ingest(doc_id: str, text: Optional[str], file_url: Optional[str], title: Optional[str]):
    """
    Background worker task to extract text and pre-embed vector chunks in ChromaDB.
    """
    try:
        engine = get_rag_engine()
        if engine.is_document_indexed(doc_id):
            return

        doc_text = text if text and "No text could be extracted" not in text else ""
        if not doc_text and file_url:
            doc_text = engine.download_and_extract_text(file_url)

        if doc_text:
            engine.ingest_mongo_text(doc_id=doc_id, text=doc_text, metadata={"title": title or ""})
    except Exception as e:
        print(f"[FastAPI] Background ingestion failed for {doc_id}: {e}")


# Routes
@app.get("/")
def read_root():
    return {
        "service": "GlobalAssign RAG Microservice",
        "status": "online",
        "embeddings": "HuggingFace (all-MiniLM-L6-v2)",
        "vector_store": "ChromaDB",
        "llm": "Gemini AI"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/rag/status/{doc_id}")
def check_indexing_status(doc_id: str):
    engine = get_rag_engine()
    is_indexed = engine.is_document_indexed(doc_id)
    return {
        "doc_id": doc_id,
        "is_indexed": is_indexed
    }


@app.post("/api/v1/rag/ingest")
def ingest_text_from_mongo(request: IngestMongoTextRequest, background_tasks: BackgroundTasks):
    engine = get_rag_engine()
    if engine.is_document_indexed(request.doc_id):
        return {
            "status": "already_indexed",
            "doc_id": request.doc_id,
            "message": "Document is already pre-indexed in ChromaDB."
        }

    background_tasks.add_task(
        process_bg_ingest,
        doc_id=request.doc_id,
        text=request.text,
        file_url=request.file_url,
        title=request.title
    )

    return {
        "status": "background_indexing_started",
        "doc_id": request.doc_id,
        "message": "Background vector indexing launched for instant Q&A retrieval."
    }


@app.post("/api/v1/rag/query", response_model=RAGQueryResponse)
def query_rag_microservice(request: RAGQueryRequest):
    engine = get_rag_engine()
    res = engine.query_rag(
        doc_id=request.doc_id,
        text=request.text,
        file_url=request.file_url or "",
        query=request.query,
        top_k=request.top_k
    )

    if res.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message", "RAG Query processing failed")
        )

    return res


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
