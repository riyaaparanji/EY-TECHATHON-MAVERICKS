from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Any, Dict
import uvicorn
import os

from ey_groq_adapter import init, chat_agent, faiss_search

app = FastAPI(title='EY Groq Agents API')

@app.on_event('startup')
async def startup_event():
    init()

class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    context: Optional[Dict[str, Any]] = None

class RecommendRequest(BaseModel):
    query: str
    k: Optional[int] = 5

@app.post('/api/agents/chat')
async def agents_chat(req: ChatRequest):
    try:
        out = chat_agent(req.user_id or 'anonymous', req.message, req.context or {})
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/agents/recommend')
async def agents_recommend(req: RecommendRequest):
    try:
        results = faiss_search(req.query, k=req.k or 5)
        return {"results": [{"id": r[0], "score": r[1]} for r in results]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/products')
async def products():
    import json, pathlib
    path = pathlib.Path(__file__).parent / 'products.json'
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding='utf-8'))

# demo cart
CART = []

@app.post('/api/cart')
async def add_cart(item: Dict[str, Any]):
    CART.append(item)
    return {"ok": True, "cartSize": len(CART)}

@app.get('/api/cart')
async def get_cart():
    return {"cart": CART}

if __name__ == '__main__':
    uvicorn.run('app:app', host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), reload=True)
