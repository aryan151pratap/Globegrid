import hashlib
import os
from typing import Dict, List, Optional

import chromadb
import numpy as np
from google import genai
from google.genai import types


class GeminiChromaRetriever:
    def __init__(
        self,
        api_key: Optional[str] = None,
        embedding_model: str = "gemini-embedding-001",
        embedding_dim: int = 768,
        persist_dir: str = "./chroma_db",
        collection_name: str = "documents",
        chunk_size: int = 800,
        chunk_overlap: int = 100,
    ):
        self.client = genai.Client(api_key=api_key or os.environ["EMBEDDING_API_KEY"])
        self.embedding_model = embedding_model
        self.embedding_dim = embedding_dim
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.db = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.db.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    @staticmethod
    def load_file(path: str) -> str:
        """Read .txt/.md files or .pdf (needs pypdf)."""
        if path.lower().endswith(".pdf"):
            from pypdf import PdfReader

            reader = PdfReader(path)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks, breaking at whitespace where possible."""
        text = " ".join(text.split())  # normalize whitespace
        chunks, start = [], 0
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            if end < len(text):
                space = text.rfind(" ", start, end)
                if space > start + self.chunk_size // 2:
                    end = space
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            if end >= len(text):
                break
            start = max(end - self.chunk_overlap, start + 1)
        return chunks

    def embed(self, texts: List[str], task_type: str) -> List[List[float]]:
        """Generate normalized Gemini embeddings (batched)."""
        vectors = []
        for i in range(0, len(texts), 100):  # API batch limit
            batch = texts[i : i + 100]
            response = self.client.models.embed_content(
                model=self.embedding_model,
                contents=batch,
                config=types.EmbedContentConfig(
                    task_type=task_type,
                    output_dimensionality=self.embedding_dim,
                ),
            )
            vectors.extend(e.values for e in response.embeddings)

        arr = np.array(vectors, dtype=np.float32)
        arr /= np.linalg.norm(arr, axis=1, keepdims=True)
        return arr.tolist()

    def add_text(self, text: str, source: str = "text") -> int:
        """Chunk, embed and store text in ChromaDB. Returns number of chunks stored."""
        chunks = self.chunk_text(text)
        if not chunks:
            return 0

        embeddings = self.embed(chunks, task_type="RETRIEVAL_DOCUMENT")
        ids = [
            hashlib.md5(f"{source}:{i}:{c}".encode()).hexdigest()
            for i, c in enumerate(chunks)
        ]
        metadatas = [{"source": source, "chunk_index": i} for i in range(len(chunks))]

        self.collection.upsert(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return len(chunks)

    def add_file(self, path: str) -> int:
        return self.add_text(self.load_file(path), source=os.path.basename(path))

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Return the top_k most similar chunks (data only, no LLM)."""
        if self.collection.count() == 0:
            return []

        q_emb = self.embed([query], task_type="RETRIEVAL_QUERY")
        res = self.collection.query(
            query_embeddings=q_emb,
            n_results=min(top_k, self.collection.count()),
        )
        return [
            {
                "text": doc,
                "source": meta["source"],
                "chunk_index": meta["chunk_index"],
                "similarity": round(1 - dist, 4),  # cosine distance -> similarity
            }
            for doc, meta, dist in zip(
                res["documents"][0], res["metadatas"][0], res["distances"][0]
            )
        ]

    def count(self) -> int:
        return self.collection.count()

    def clear(self) -> None:
        name = self.collection.name
        self.db.delete_collection(name)
        self.collection = self.db.get_or_create_collection(
            name=name, metadata={"hnsw:space": "cosine"}
        )
