# backend/rag/rag_service.py

import re
import os
import logging
from typing import List, Dict, Any
from pypdf import PdfReader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try importing Chromadb and SentenceTransformers
CHROMA_AVAILABLE = False
SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import chromadb
    CHROMA_AVAILABLE = True
except ImportError:
    logger.warning("chromadb package not found. RAG will use fallback in-memory store.")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("sentence-transformers package not found. RAG will use Gemini-API embeddings or cosine similarity.")


class RAGService:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.fallback_db = {}  # Fallback: {doc_id: [{"text": chunk, "embedding": vector}]}
        self.embedding_model = None
        self.fallback_mode = False

        # Initialize main ChromaDB + SentenceTransformers if available
        if CHROMA_AVAILABLE and SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                # Use in-memory or ephemeral client to avoid locking issues on Windows
                self.chroma_client = chromadb.Client()
                self.collection = self.chroma_client.get_or_create_collection(
                    name="job_requirements",
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info("Initializing SentenceTransformer Model: all-MiniLM-L6-v2")
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("RAG initialized successfully with ChromaDB and Sentence-Transformers.")
            except Exception as e:
                logger.error(f"Error initializing ChromaDB/SentenceTransformers: {e}. Switching to fallback mode.")
                self.fallback_mode = True
        else:
            self.fallback_mode = True
            logger.info("RAG starting in fallback mode (using in-memory search and semantic overlaps).")

    def reset(self):
        """Clears all stored requirements and indexes to prevent session bleed-through."""
        logger.info("Resetting RAG database store...")
        self.fallback_db = {}
        if not self.fallback_mode and self.chroma_client:
            try:
                self.chroma_client.delete_collection("job_requirements")
                self.collection = self.chroma_client.get_or_create_collection(
                    name="job_requirements",
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info("ChromaDB index deleted and recreated successfully.")
            except Exception as e:
                logger.warning(f"Error resetting ChromaDB collection: {e}")

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Reads a PDF file and extracts text, cleaning double spaces and extra newlines."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        try:
            reader = PdfReader(file_path)
            extracted_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"

            # Cleaning extracted text
            cleaned_text = re.sub(r'\s+', ' ', extracted_text)  # collapse multiple whitespaces
            cleaned_text = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', cleaned_text) # add space between lowercase and uppercase
            return cleaned_text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            raise ValueError(f"Failed to process PDF file: {str(e)}")

    def chunk_text(self, text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        """Splits text into overlapping chunks based on character length."""
        if not text:
            return []
        
        # Split by words to keep semantic units together
        words = text.split(' ')
        chunks = []
        
        current_words = []
        current_len = 0
        
        for word in words:
            current_words.append(word)
            current_len += len(word) + 1
            if current_len >= chunk_size:
                chunks.append(' '.join(current_words))
                # slide window back by overlap
                overlap_word_count = max(1, int(len(current_words) * (chunk_overlap / chunk_size)))
                current_words = current_words[-overlap_word_count:]
                current_len = sum(len(w) + 1 for w in current_words)
                
        if current_words:
            chunks.append(' '.join(current_words))
            
        return [c for c in chunks if len(c.strip()) > 10]

    def index_job_description(self, jd_text: str, doc_id: str = "jd_main") -> bool:
        """Splits the job description and indexes it in ChromaDB (or fallback in-memory store)."""
        try:
            # Explicitly reset RAG collections before indexing a new job description
            self.reset()

            chunks = self.chunk_text(jd_text, chunk_size=400, chunk_overlap=50)
            if not chunks:
                logger.warning("No text chunks generated for indexing.")
                return False

            if not self.fallback_mode:
                try:
                    embeddings = self.embedding_model.encode(chunks).tolist()
                    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
                    metadatas = [{"source": "job_description", "chunk_index": i} for i in range(len(chunks))]

                    self.collection.add(
                        embeddings=embeddings,
                        documents=chunks,
                        ids=ids,
                        metadatas=metadatas
                    )
                    logger.info(f"Successfully indexed {len(chunks)} chunks in ChromaDB.")
                    return True
                except Exception as e:
                    logger.error(f"Failed to add to ChromaDB: {e}. Switching to fallback index.")
                    self.fallback_mode = True

            # Fallback In-Memory Indexing
            self.fallback_db[doc_id] = []
            for i, chunk in enumerate(chunks):
                self.fallback_db[doc_id].append({
                    "id": f"{doc_id}_chunk_{i}",
                    "text": chunk,
                    "words": set(self.clean_and_tokenize(chunk))
                })
            logger.info(f"Successfully indexed {len(chunks)} chunks in Fallback In-Memory Store.")
            return True
        except Exception as e:
            logger.error(f"Error indexing job description: {e}")
            return False

    def clean_and_tokenize(self, text: str) -> List[str]:
        """Cleans and tokenizes text for basic keyword overlap search."""
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', text.lower())
        return [w for w in cleaned.split() if len(w) > 2]

    def retrieve_relevant_requirements(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Retrieves relevant job description requirements based on query."""
        retrieved_items = []
        
        if not self.fallback_mode:
            try:
                query_vector = self.embedding_model.encode([query]).tolist()
                results = self.collection.query(
                    query_embeddings=query_vector,
                    n_results=limit
                )
                if results and 'documents' in results and results['documents']:
                    documents = results['documents'][0]
                    distances = results['distances'][0] if 'distances' in results else [0.0]*len(documents)
                    for doc, dist in zip(documents, distances):
                        retrieved_items.append({
                            "text": doc,
                            "score": float(1 - dist)
                        })
                    return retrieved_items
            except Exception as e:
                logger.error(f"Error querying ChromaDB: {e}. Using fallback retriever.")

        # Fallback keyword overlap retrieval
        query_words = set(self.clean_and_tokenize(query))
        if not query_words:
            for doc_id, items in self.fallback_db.items():
                for item in items[:limit]:
                    retrieved_items.append({"text": item["text"], "score": 0.5})
            return retrieved_items

        candidates = []
        for doc_id, items in self.fallback_db.items():
            for item in items:
                overlap = len(query_words.intersection(item["words"]))
                if overlap > 0:
                    score = overlap / (len(query_words) + len(item["words"]) - overlap)
                    candidates.append((item["text"], score))
                    
        candidates.sort(key=lambda x: x[1], reverse=True)
        for doc, score in candidates[:limit]:
            retrieved_items.append({
                "text": doc,
                "score": float(score)
            })

        if not retrieved_items:
            for doc_id, items in self.fallback_db.items():
                for item in items[:limit]:
                    retrieved_items.append({"text": item["text"], "score": 0.1})

        return retrieved_items
