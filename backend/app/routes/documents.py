import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from app.services.parser import DocumentParser, IMAGES_DIR
from app.services.vector_store import VectorStoreService
from langchain_ollama import ChatOllama

router = APIRouter(prefix="/api", tags=["Documents"])
vector_service = VectorStoreService()

# ── Supported file types ───────────────────────────────────────────────────────
SUPPORTED_EXTENSIONS = {
    "pdf":   "pdf",
    "docx":  "docx",
    "xlsx":  "excel",
    "xls":   "excel",
    "csv":   "csv",
    "txt":   "txt",
    "md":    "txt",
    "pptx":  "pptx",
    "ipynb": "ipynb",
}

EXTENSION_LABELS = {
    "pdf":   "PDF Document",
    "docx":  "Word Document",
    "xlsx":  "Excel Spreadsheet",
    "xls":   "Excel Spreadsheet (Legacy)",
    "csv":   "CSV Spreadsheet",
    "txt":   "Plain Text",
    "md":    "Markdown Document",
    "pptx":  "PowerPoint Presentation",
    "ipynb": "Jupyter Notebook",
}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    filename = file.filename or "unnamed_file"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in SUPPORTED_EXTENSIONS:
        supported_list = ", ".join(f".{ext}" for ext in SUPPORTED_EXTENSIONS)
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{extension}'. Supported formats: {supported_list}"
        )

    try:
        file_bytes = await file.read()
        file_type = SUPPORTED_EXTENSIONS[extension]

        if file_type == "pdf":
            parsed_data = DocumentParser.parse_pdf_advanced(file_bytes)
        elif file_type == "docx":
            parsed_data = DocumentParser.parse_docx_advanced(file_bytes)
        elif file_type == "excel":
            parsed_data = DocumentParser.parse_excel(file_bytes)
        elif file_type == "csv":
            parsed_data = DocumentParser.parse_csv(file_bytes)
        elif file_type == "txt":
            parsed_data = DocumentParser.parse_txt(file_bytes)
        elif file_type == "pptx":
            parsed_data = DocumentParser.parse_pptx(file_bytes)
        elif file_type == "ipynb":
            parsed_data = DocumentParser.parse_ipynb(file_bytes)
        else:
            raise HTTPException(status_code=400, detail="Unrecognized file type.")

        if not parsed_data or not parsed_data.get("text"):
            raise HTTPException(status_code=422, detail="No readable text detected in document.")

        indexed_chunks = vector_service.add_document(
            text=parsed_data["text"],
            filename=filename,
            session_id=session_id,
        )

        # Quick auto-summary (first 3000 chars of text — fast, no vector search needed)
        preview_text = parsed_data["text"][:3000]
        summary = _generate_summary(filename, preview_text, parsed_data.get("page_count", 1))

        return {
            "filename": filename,
            "file_type": EXTENSION_LABELS.get(extension, extension.upper()),
            "page_count": parsed_data.get("page_count", 1),
            "indexed_chunks": indexed_chunks,
            "summary": summary,
            "status": "success",
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"UPLOAD ERROR: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {exc}")


def _generate_summary(filename: str, preview_text: str, page_count: int) -> str:
    """Generate a concise 3-sentence document summary using the LLM."""
    try:
        prompt = (
            f"Document: {filename} ({page_count} page(s))\n\n"
            f"CONTENT PREVIEW:\n{preview_text}\n\n"
            "Write a concise 2-3 sentence summary of what this document is about. "
            "Be factual and specific. Do not use phrases like 'This document' — start directly."
        )
        llm = ChatOllama(model="gemma2:2b", temperature=0.0, num_ctx=4096, num_predict=200)
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception:
        return f"{filename} has been indexed and is ready for questions."


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    try:
        success = vector_service.delete_session_vectors(session_id)
        if success:
            return {"status": "deleted", "session_id": session_id}
        return {"status": "not_found", "session_id": session_id}
    except Exception as exc:
        print(f"SESSION DELETION ERROR: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {exc}")


@router.get("/health/model")
async def check_model_health():
    """Quick check if Ollama and gemma2:2b are reachable."""
    try:
        llm = ChatOllama(model="gemma2:2b", temperature=0.0, num_ctx=512, num_predict=5)
        llm.invoke("ping")
        return {"status": "ok", "model": "gemma2:2b"}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@router.get("/images/{filename}")
async def get_image(filename: str):
    """Serve an extracted document image."""
    filepath = os.path.join(IMAGES_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)