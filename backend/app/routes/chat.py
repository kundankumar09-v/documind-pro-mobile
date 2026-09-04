import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from langchain_ollama import ChatOllama
from app.services.vector_store import VectorStoreService

router = APIRouter(prefix="/api", tags=["Chat"])
vector_service = VectorStoreService()


# ── Request / response models ──────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str   # "user" | "assistant"
    text: str

class IsolatedChatRequest(BaseModel):
    question: str
    session_id: str
    history: List[HistoryMessage] = []   # last N turns for conversation memory


# ── Shared context builder ─────────────────────────────────────────────────────

def _build_prompt(question: str, context: str, history: List[HistoryMessage]) -> str:
    """
    Compose the full prompt: system rules + conversation history + document context + question.
    """
    # Last 6 messages (3 turns) for conversation memory
    recent = history[-6:] if len(history) > 6 else history
    history_block = ""
    if recent:
        turns = []
        for msg in recent:
            role_label = "User" if msg.role == "user" else "DocuMind"
            turns.append(f"{role_label}: {msg.text}")
        history_block = "\n\nCONVERSATION HISTORY (for follow-up context only):\n" + "\n".join(turns)

    return f"""You are DocuMind, a precise document intelligence assistant.
Your absolute priority is to answer the user's question using ONLY the provided document context.

<strict_rules>
1. You must base your answer strictly on the text inside the <document_context> tags.
2. If the document context does not contain the answer, you must say exactly: "The uploaded document does not contain information about this topic." Do not try to guess or use your prior knowledge.
3. Do not start your answer with "Based on the text" or "According to the document". Just give the answer.
4. Use clear structure: ## headings, - bullet points, numbered lists where appropriate.
5. Highlight key figures, dates, names, and technical terms in **bold**.
6. If the context contains an image marker (e.g., `[Image available at: /api/images/...]`) and it is relevant to the user's question, you MUST include it in your response exactly like this: `![Relevant Image](/api/images/...)`.
</strict_rules>
{history_block}
<document_context>
{context}
</document_context>

<user_question>
{question}
</user_question>

Answer:"""


def _retrieve_context(question: str, session_id: str):
    """Retrieve parent chunks and build context string + citations list."""
    parent_docs = vector_service.similarity_search_isolated(
        query=question,
        session_id=session_id,
        k=12,
    )

    if not parent_docs:
        return None, []

    context_blocks = []
    citations = []
    total_len = 0
    CONTEXT_LIMIT = 12000

    for doc in parent_docs:
        chunk = doc.page_content
        if total_len + len(chunk) > CONTEXT_LIMIT:
            break
        context_blocks.append(chunk)
        total_len += len(chunk)
        source = doc.metadata.get("source") if doc.metadata else None
        if source and source not in citations:
            citations.append(source)

    context = "\n\n---\n\n".join(context_blocks)
    return context, citations


# ── Standard (non-streaming) endpoint ─────────────────────────────────────────

@router.post("/chat")
async def chat_with_documents(request: IsolatedChatRequest):
    try:
        context, citations = _retrieve_context(request.question, request.session_id)

        if context is None:
            return {
                "answer": (
                    "No relevant content was found in the uploaded documents.\n\n"
                    "Please upload a PDF or DOCX file to **this chat session** first."
                ),
                "citations": [],
            }

        prompt = _build_prompt(request.question, context, request.history)
        llm = ChatOllama(model="gemma2:2b", temperature=0.0, num_ctx=8192, num_predict=1024)
        response = llm.invoke(prompt)

        return {"answer": response.content, "citations": citations}

    except Exception as exc:
        print(f"CHAT EXCEPTION: {exc}")
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}")


# ── Streaming SSE endpoint ─────────────────────────────────────────────────────

@router.post("/chat/stream")
async def stream_chat_with_documents(request: IsolatedChatRequest):
    """
    Server-Sent Events streaming endpoint.
    Emits:
      data: {"type": "meta",  "citations": [...]}        ← sent first
      data: {"type": "token", "content": "..."}          ← one per token
      data: {"type": "done"}                             ← signals end
      data: {"type": "error", "message": "..."}          ← on failure
    """
    try:
        context, citations = _retrieve_context(request.question, request.session_id)
    except Exception as exc:
        async def err_gen():
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
        return StreamingResponse(err_gen(), media_type="text/event-stream")

    if context is None:
        async def no_doc_gen():
            msg = (
                "No relevant content found in the uploaded documents.\n\n"
                "Please upload a PDF or DOCX to **this chat session** first."
            )
            yield f"data: {json.dumps({'type': 'meta', 'citations': []})}\n\n"
            yield f"data: {json.dumps({'type': 'token', 'content': msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        return StreamingResponse(no_doc_gen(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    prompt = _build_prompt(request.question, context, request.history)
    llm = ChatOllama(model="gemma2:2b", temperature=0.0, num_ctx=8192, num_predict=1024, streaming=True)

    async def token_generator():
        try:
            # First, send metadata (citations)
            yield f"data: {json.dumps({'type': 'meta', 'citations': citations})}\n\n"
            await asyncio.sleep(0)

            # Stream tokens
            async for chunk in llm.astream(prompt):
                content = chunk.content if hasattr(chunk, "content") else str(chunk)
                if content:
                    yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
                    await asyncio.sleep(0)   # yield control to event loop

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as exc:
            print(f"STREAM EXCEPTION: {exc}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        token_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )