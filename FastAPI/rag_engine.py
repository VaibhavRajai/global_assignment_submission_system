import os
import re
import io
import requests
import chromadb
from chromadb.utils import embedding_functions
import google.generativeai as genai
from dotenv import load_dotenv
import pdfplumber
import PyPDF2

load_dotenv()

# Environment Variables
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "student_documents")
HF_EMBEDDING_MODEL = os.getenv("HF_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class RAGEngine:
    def __init__(self):
        # Configure Gemini AI
        if GEMINI_API_KEY:
            try:
                genai.configure(api_key=GEMINI_API_KEY)
            except Exception as e:
                print(f"[RAGEngine] Error configuring Gemini SDK: {e}")

        # Initialize Hugging Face Embedding Function for ChromaDB
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=HF_EMBEDDING_MODEL
        )

        # Initialize Persistent ChromaDB Client
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        
        # Get or create collection using Hugging Face embeddings
        self.collection = self.chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.embedding_fn,
            metadata={"description": "Student assignment document vector collection"}
        )

    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> str:
        """
        Extracts text from PDF binary bytes using pdfplumber and PyPDF2 as fallback.
        """
        extracted_pages = []

        # 1. Try pdfplumber
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    txt = page.extract_text()
                    if txt:
                        extracted_pages.append(txt)
            if extracted_pages:
                return "\n".join(extracted_pages).strip()
        except Exception as e:
            print(f"[RAGEngine] pdfplumber extraction failed: {e}")

        # 2. Try PyPDF2 fallback
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            for page in reader.pages:
                txt = page.extract_text()
                if txt:
                    extracted_pages.append(txt)
            if extracted_pages:
                return "\n".join(extracted_pages).strip()
        except Exception as e:
            print(f"[RAGEngine] PyPDF2 extraction failed: {e}")

        return ""

    def download_and_extract_text(self, file_url: str) -> str:
        """
        Downloads a document from S3/HTTP URL and extracts text content.
        """
        if not file_url:
            return ""

        try:
            print(f"[RAGEngine] Fetching document from URL: {file_url[:80]}...")
            resp = requests.get(file_url, timeout=15)
            if resp.status_code == 200:
                content_type = resp.headers.get("Content-Type", "").lower()
                if "pdf" in content_type or file_url.lower().endswith(".pdf"):
                    return self.extract_text_from_pdf_bytes(resp.content)
                else:
                    return resp.text.strip()
        except Exception as e:
            print(f"[RAGEngine] Error fetching/extracting document from URL {file_url}: {e}")

        return ""

    def chunk_text(self, text: str, chunk_size: int = 400, overlap: int = 80) -> list:
        """
        Splits text into overlapping chunks for embedding.
        """
        if not text or not text.strip():
            return []

        cleaned_text = re.sub(r'\s+', ' ', text).strip()
        words = cleaned_text.split(' ')

        if len(words) <= chunk_size:
            return [cleaned_text]

        chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunks.append(' '.join(chunk_words))
            i += (chunk_size - overlap)

        return chunks

    def is_document_indexed(self, doc_id: str) -> bool:
        """
        Checks if document vectors for doc_id already exist in ChromaDB.
        """
        if not doc_id:
            return False

        try:
            results = self.collection.get(
                where={"doc_id": doc_id},
                limit=1
            )
            return len(results.get("ids", [])) > 0
        except Exception as e:
            print(f"[RAGEngine] Error checking indexing status for {doc_id}: {e}")
            return False

    def ingest_mongo_text(self, doc_id: str, text: str, metadata: dict = None) -> dict:
        """
        Embeds document text into ChromaDB using HuggingFace embeddings.
        Skips embedding if doc_id is already indexed.
        """
        if not doc_id or not text or not text.strip():
            return {"status": "error", "message": "Invalid doc_id or empty text"}

        if self.is_document_indexed(doc_id):
            existing = self.collection.get(where={"doc_id": doc_id})
            chunk_count = len(existing.get("ids", []))
            return {
                "status": "already_indexed",
                "doc_id": doc_id,
                "chunks_count": chunk_count,
                "message": "Document text is already embedded in ChromaDB."
            }

        chunks = self.chunk_text(text)
        if not chunks:
            return {"status": "error", "message": "Failed to generate text chunks"}

        meta_base = metadata or {}
        meta_base["doc_id"] = doc_id

        ids = [f"{doc_id}_chunk_{idx}" for idx in range(len(chunks))]
        metadatas = [{**meta_base, "chunk_index": idx} for idx in range(len(chunks))]

        try:
            self.collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            print(f"[RAGEngine] Successfully indexed {len(chunks)} chunks for document {doc_id}.")
            return {
                "status": "success",
                "doc_id": doc_id,
                "chunks_count": len(chunks),
                "message": f"Successfully vectorized and stored {len(chunks)} chunks using HuggingFace embeddings."
            }
        except Exception as e:
            print(f"[RAGEngine] Error ingesting document {doc_id}: {e}")
            return {"status": "error", "message": str(e)}

    def count_keyword_occurrences(self, text: str, query: str) -> dict:
        """
        Calculates case-insensitive occurrences and line numbers for keywords.
        """
        if not text or not query:
            return {"total_count": 0, "term_counts": {}, "keywords": [], "matching_lines": []}

        stop_words = {
            "is", "the", "in", "it", "there", "doc", "document", "this", "that", "are", "was", "were", 
            "and", "or", "to", "of", "for", "with", "a", "an", "present", "inside", "does", "have", "contains", "file"
        }
        raw_words = re.findall(r'[a-zA-Z0-9_\-\.\+#]+', query.lower())
        keywords = [w for w in raw_words if w not in stop_words and len(w) > 1]

        text_lower = text.lower()
        total_count = 0
        term_counts = {}
        matching_lines = []

        # Split into lines for line number tracking
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        for kw in keywords:
            pattern = r'(?i)' + re.escape(kw)
            matches = len(re.findall(pattern, text_lower))
            term_counts[kw] = matches
            if matches > 0:
                total_count += matches

            for idx, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    # Clean up multiple spaces
                    clean_line = re.sub(r'\s+', ' ', line).strip()
                    item = {"line_num": idx, "line_text": clean_line, "keyword": kw}
                    if item not in matching_lines:
                        matching_lines.append(item)

        return {
            "total_count": total_count,
            "term_counts": term_counts,
            "keywords": keywords,
            "matching_lines": matching_lines
        }

    def generate_gemini_summary(self, query: str, context_chunks: list, occurrence_info: dict, full_text: str = "") -> str:
        """
        Calls Gemini AI to generate a clean answer without '#' headings, including line numbers and excerpts.
        """
        combined_context = "\n\n---\n\n".join(context_chunks) if context_chunks else (full_text[:3000] if full_text else "No document text available.")
        term_counts = occurrence_info.get("term_counts", {})
        total_count = occurrence_info.get("total_count", 0)
        matching_lines = occurrence_info.get("matching_lines", [])
        keywords = occurrence_info.get("keywords", [])

        # Build clean line excerpts
        excerpts_str = ""
        if matching_lines:
            for item in matching_lines[:3]:
                excerpts_str += f"• Line {item['line_num']}: \"{item['line_text'][:120]}\"\n"

        prompt = f"""You are an AI Teaching Assistant evaluating a student submission.
Teacher's Question: "{query}"

Retrieved Context from Student Document:
--------------------------------------------------
{combined_context}
--------------------------------------------------

Line Excerpts Found:
{excerpts_str}

CRITICAL FORMATTING INSTRUCTION:
DO NOT USE ANY '#' OR '##' OR '###' HEADING TAGS IN YOUR OUTPUT AT ALL.
Format cleanly strictly as follows:

**Status:** [Found in Document (Line X) OR Not Found in Document]
**Matches:** [List terms and line numbers]

**Exact Excerpt:**
[List matching lines with line numbers]

**AI Summary:**
[A clean 2-3 sentence answer for the teacher]
"""

        # 1. Fast direct REST API calls (4s timeout)
        if GEMINI_API_KEY:
            for model_name in ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-pro", "gemini-2.0-flash"]:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
                    headers = {"Content-Type": "application/json"}
                    payload = {"contents": [{"parts": [{"text": prompt}]}]}
                    res = requests.post(url, json=payload, headers=headers, timeout=4)
                    res_data = res.json()

                    if "candidates" in res_data and len(res_data["candidates"]) > 0:
                        parts = res_data["candidates"][0]["content"]["parts"]
                        answer_text = "".join([p.get("text", "") for p in parts]).strip()
                        if answer_text and len(answer_text) > 10:
                            # Strip any stray # headings if Gemini added them
                            clean_ans = re.sub(r'#+\s*', '', answer_text)
                            return clean_ans.strip()
                except Exception as http_err:
                    print(f"[RAGEngine] Fast HTTP call to {model_name} failed: {http_err}")

        # 2. Try Python SDK fallback (3s timeout)
        try:
            model = genai.GenerativeModel("gemini-1.5-flash-latest")
            response = model.generate_content(prompt, request_options={"timeout": 3})
            if response and response.text:
                clean_ans = re.sub(r'#+\s*', '', response.text)
                return clean_ans.strip()
        except Exception as e:
            print(f"[RAGEngine] Gemini SDK call failed: {e}")

        # 3. Clean Local RAG Fallback (No '#' symbols, line number references)
        is_general_query = any(w in query.lower() for w in [
            "summarize", "summary", "overview", "what", "about", "explain", "tell", "describe", 
            "details", "project", "education", "skill", "experience", "resume", "submission", 
            "file", "document", "work", "grade", "review", "hi", "hello", "who"
        ])
        is_present = total_count > 0 or len(matching_lines) > 0

        if is_present:
            line_ref = f" (Line {matching_lines[0]['line_num']})" if matching_lines else ""
            out = f"**Status:** Found in Document{line_ref}\n\n"
            out += "**Matches Found:**\n"
            if term_counts:
                for k, c in term_counts.items():
                    if c > 0:
                        out += f"• **{k.upper()}**: {c} match(es)\n"
            else:
                out += f"• Mentioned **{total_count} time(s)**\n"

            if matching_lines:
                out += "\n**Exact Excerpt:**\n"
                for item in matching_lines[:2]:
                    out += f"• Line {item['line_num']}: *\"{item['line_text'][:150]}\"*\n"

            out += "\n**AI Summary:**\n"
            kw_str = ", ".join([k.upper() for k in keywords]) if keywords else "the requested topic"
            out += f"The student's submission contains verified content for **{kw_str}** as detailed above."
            return out

        elif is_general_query or not keywords:
            out = "**Status:** Document Processed\n\n"
            if matching_lines:
                out += "**Exact Excerpt:**\n"
                for item in matching_lines[:2]:
                    out += f"• Line {item['line_num']}: *\"{item['line_text'][:150]}\"*\n"

            out += "\n**AI Summary:**\n"
            text_source = combined_context if combined_context else full_text
            if text_source and "No text could be extracted" not in text_source:
                clean_text = re.sub(r'\s+', ' ', text_source).strip()
                out += f"Student submission overview:\n> {clean_text[:350]}..."
            else:
                out += "No readable text extracted from document."
            return out

        else:
            out = "**Status:** Not Found in Document\n"
            out += "**Matches Found:** 0 occurrences\n\n"
            out += "**AI Summary:**\n"
            out += f"The term **'{query}'** was not found in the student's submission."
            return out




    def query_rag(self, doc_id: str, text: str, query: str, file_url: str = "", top_k: int = 5) -> dict:
        """
        Main RAG query method:
        1. Ensures document text is retrieved (from MongoDB or downloaded from file_url).
        2. Embeds and vector searches query against HuggingFace embeddings in ChromaDB.
        3. Analyzes occurrences and passes context to Gemini AI / RAG engine.
        """
        if not query or not query.strip():
            return {"status": "error", "message": "Query cannot be empty"}

        document_text = text if text and "No text could be extracted" not in text else ""

        # Download and extract text from S3/file URL if document_text is empty
        if not document_text and file_url:
            extracted_from_url = self.download_and_extract_text(file_url)
            if extracted_from_url:
                document_text = extracted_from_url
                print(f"[RAGEngine] Extracted {len(document_text)} chars directly from file URL.")

        if not document_text:
            document_text = text or ""

        # Ingest into ChromaDB if text exists and not already embedded
        if document_text and "No text could be extracted" not in document_text:
            self.ingest_mongo_text(doc_id=doc_id, text=document_text)

        # ChromaDB Vector Search using HuggingFace Query Embedding
        retrieved_chunks = []
        try:
            where_clause = {"doc_id": doc_id} if doc_id else None
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_clause
            )
            
            if results and "documents" in results and len(results["documents"]) > 0:
                retrieved_chunks = results["documents"][0]
        except Exception as e:
            print(f"[RAGEngine] Error querying ChromaDB: {e}")

        if not retrieved_chunks and document_text:
            chunks = self.chunk_text(document_text)
            retrieved_chunks = chunks[:top_k]

        # Calculate case-insensitive occurrences & sentence matches
        occurrence_info = self.count_keyword_occurrences(document_text, query)

        # Generate Gemini AI Response
        gemini_answer = self.generate_gemini_summary(
            query=query,
            context_chunks=retrieved_chunks,
            occurrence_info=occurrence_info,
            full_text=document_text
        )

        is_present = occurrence_info.get("total_count", 0) > 0 or len(occurrence_info.get("matching_sentences", [])) > 0

        return {
            "status": "success",
            "doc_id": doc_id,
            "query": query,
            "answer": gemini_answer,
            "present": is_present,
            "occurrences": occurrence_info.get("total_count", 0),
            "sources": retrieved_chunks
        }
