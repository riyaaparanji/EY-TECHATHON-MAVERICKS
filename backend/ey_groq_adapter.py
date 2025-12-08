import re
import json
import threading
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime

try:
    import numpy as np
    from sentence_transformers import SentenceTransformer
    import faiss
except Exception:
    np = None
    SentenceTransformer = None
    faiss = None

_lock = threading.RLock()
session_store: Dict[str, Dict[str, Any]] = {}
inventory_store: Dict[str, Dict[str, int]] = {
    "p01": {"M": 5, "L": 3},
    "p02": {"M": 2, "L": 2},
    "p03": {"M": 4, "L": 0},
}
ORDER_STORE: List[Dict[str, Any]] = []

ORDINALS = {"first": 1, "second": 2, "third": 3}
PRONOUNS = {"it", "that", "this", "those", "these", "them", "itself"}
COLOR_WORDS = ["black", "white", "blue", "red"]

products = [
    {"pid": "p01", "title": "Black Cotton Shirt", "desc": "Men's black cotton shirt", "price": 1299},
    {"pid": "p02", "title": "Blue Denim Shirt", "desc": "Casual blue denim shirt", "price": 1899},
    {"pid": "p03", "title": "White Linen Shirt", "desc": "Breathable linen shirt", "price": 1499},
]
product_texts = [p["title"] + ". " + p["desc"] for p in products]
product_ids = [p["pid"] for p in products]
pid_to_prod = {p["pid"]: p for p in products}

_embedder = None
_index = None
_embs_norm = None

def l2_norm(x):
    if x is None:
        return None
    norm = np.linalg.norm(x, axis=1, keepdims=True)
    norm[norm == 0] = 1.0
    return x / norm

def init():
    global _embedder, _index, _embs_norm
    with _lock:
        if _embedder is not None and _index is not None:
            return
        if SentenceTransformer is None or faiss is None or np is None:
            return
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        embs = _embedder.encode(product_texts, convert_to_numpy=True).astype('float32')
        _embs_norm = l2_norm(embs)
        dim = _embs_norm.shape[1]
        _index = faiss.IndexFlatIP(dim)
        _index.add(_embs_norm)

def faiss_search(query: str, k: int = 5):
    global _embedder, _index, _embs_norm
    if _embedder is None or _index is None:
        results = product_ids[:k]
        scores = [float(1.0 - 0.05 * i) for i in range(len(results))]
        return results, scores
    q_emb = _embedder.encode([query], convert_to_numpy=True).astype('float32')
    q_emb_norm = l2_norm(q_emb)
    D, I = _index.search(q_emb_norm, k)
    ranked_pids = [product_ids[idx] for idx in I[0] if idx < len(product_ids)]
    return ranked_pids, D[0].tolist()

def ask_llm(system_prompt: str, user_input: str) -> str:
    user_lower = (user_input or "").lower()
    if "under" in user_lower or "price" in user_lower:
        return json.dumps({"query": user_input, "max_price": 1500})
    return json.dumps({"query": user_input})

def normalize_size(s: str):
    if not s:
        return None
    s = s.strip().upper()
    mapping = {"XS":"XS","S":"S","M":"M","L":"L","XL":"XL","XXL":"XXL"}
    s = re.sub(r"[^A-Za-z0-9]","",s)
    return mapping.get(s[:3], None)

def start_session(session_id: str):
    with _lock:
        session = {'session_id': session_id, 'history': [], 'cart': [], 'last_recs': [], 'last_query': None, 'last_mentioned': None, 'created_at': datetime.utcnow().isoformat()}
        session_store[session_id] = session
        return session

def get_session(session_id: str):
    with _lock:
        if session_id not in session_store:
            return start_session(session_id)
        return session_store[session_id]

def add_to_history(session_id: str, role: str, text: str):
    s = get_session(session_id)
    s['history'].append({'role': role, 'text': text, 'ts': datetime.utcnow().isoformat()})

def resolve_reference_to_pid(user_text: str, session_id: str):
    s = get_session(session_id)
    last_recs = s.get('last_recs', [])[:]
    last_mentioned = s.get('last_mentioned')
    text_lower = (user_text or '').lower()
    for pid in product_ids:
        if pid.lower() in text_lower:
            s['last_mentioned'] = pid
            return pid
    for word, idx in ORDINALS.items():
        if f" {word} " in f" {text_lower} " or text_lower.strip().endswith(f" {word}"):
            if last_recs and 1 <= idx <= len(last_recs):
                pid = last_recs[idx-1]
                s['last_mentioned'] = pid
                return pid
    if any(p in text_lower.split() for p in PRONOUNS):
        if last_mentioned:
            return last_mentioned
        if last_recs:
            pid = last_recs[0]
            s['last_mentioned'] = pid
            return pid
    return None

def clarifying_ui_for_products(candidate_pids):
    cards = []
    for pid in candidate_pids:
        p = pid_to_prod.get(pid)
        if not p:
            continue
        cards.append({'pid': pid, 'title': p['title'], 'subtitle': p['desc'], 'price': p['price']})
    return {'title': 'Which one did you mean?', 'cards': cards}

def handle_possible_disambiguation(session_id: str, user_id: str, user_text: str):
    pid = resolve_reference_to_pid(user_text, session_id)
    if pid:
        size = None
        m = re.search(r"size\s*[:=]?\s*([xsmlxl0-9]+)", user_text, re.IGNORECASE)
        if m:
            size = normalize_size(m.group(1))
        qty = 1
        m2 = re.search(r"(\d+)\s*(?:pcs|pieces|qty|quantity|x|times)?", user_text, re.IGNORECASE)
        if m2:
            try:
                qty = max(1, int(m2.group(1)))
            except:
                qty = 1
        return {"pid": pid, "size": size, "qty": qty, "resolved": True, "reason": "heuristic"}
    s = get_session(session_id)
    candidates, _ = faiss_search(user_text if user_text.strip() else s.get('last_query') or "shirt", k=5)
    candidates = list(dict.fromkeys(candidates))[:5]
    return {"resolved": False, "reason": "ambiguous", "clarify_payload": clarifying_ui_for_products(candidates)}

def add_to_cart_flow(session_id: str, user_id: str, user_text: str):
    s = get_session(session_id)
    resolved = handle_possible_disambiguation(session_id, user_id, user_text)
    if not resolved.get("resolved"):
        return {"reply": "I need to clarify which product you mean.", "actions": [], "ui": resolved.get("clarify_payload")}
    pid = resolved["pid"]
    size = resolved.get("size") or "M"
    qty = resolved.get("qty", 1)
    reserved = reserve_inventory(pid, size, qty)
    if not reserved:
        alt_sizes = ["M","L","S","XL"]
        for alt in alt_sizes:
            if alt == size:
                continue
            if reserve_inventory(pid, alt, qty):
                size = alt
                reserved = True
                break
    if not reserved:
        return {"reply": f"Sorry, we couldn't reserve {qty} of {pid} in any size.", "actions": [], "ui": {}}
    item = {"pid": pid, "size": size, "qty": qty, "added_at": datetime.utcnow().isoformat()}
    s["cart"].append(item)
    add_to_history(session_id, "assistant", f"Added {qty} x {pid} size {size} to cart")
    return {"reply": f"Added {qty} of {pid} (size {size}) to your cart.", "actions":[{"type":"add_to_cart","pid":pid,"size":size,"qty":qty}], "ui":{"title":"Added to cart","item":item}}

def check_inventory(pid: str, size: str):
    sizes = inventory_store.get(pid, {})
    qty = sizes.get(size, 0)
    return ("yes", qty) if qty > 0 else ("no", 0)

def reserve_inventory(pid: str, size: str, qty: int) -> bool:
    with _lock:
        sizes = inventory_store.get(pid, {})
        avail = sizes.get(size, 0)
        if avail >= qty:
            inventory_store[pid][size] = avail - qty
            return True
        return False

def release_inventory(pid: str, size: str, qty: int) -> bool:
    with _lock:
        if pid not in inventory_store:
            inventory_store[pid] = {}
        inventory_store[pid][size] = inventory_store[pid].get(size, 0) + qty
        return True

def checkout_flow(session_id: str, user_id: str):
    s = get_session(session_id)
    cart = s.get("cart", [])
    if not cart:
        return {"reply":"Your cart is empty.","actions":[]}
    total = 0
    items = []
    for it in cart:
        p = pid_to_prod.get(it["pid"], {})
        price = p.get("price",0)
        items.append({"pid":it["pid"],"size":it["size"],"qty":it["qty"],"price":price})
        total += price * it["qty"]
    payment_ok = True
    if payment_ok:
        order_id = f"ORD{len(ORDER_STORE)+1:05d}"
        ORDER_STORE.append({"order_id":order_id,"user_id":user_id,"items":items,"total":total,"created_at":datetime.utcnow().isoformat()})
        s["cart"] = []
        add_to_history(session_id,"assistant",f"Order {order_id} placed. Total Rs{total}")
        return {"reply":f"Payment succeeded. Order {order_id} placed.","actions":[{"type":"order","order_id":order_id}],"ui":{"title":"Order Confirmed","order_id":order_id,"total":total,"items":items}}
    for it in cart:
        release_inventory(it["pid"],it["size"],it["qty"])
    s["cart"]=[]
    return {"reply":"Payment failed. Your cart has been restored.","actions":[]}

def classify_intent(user_msg: str):
    msg = (user_msg or "").lower()
    if any(w in msg for w in ["show","find","suggest","recommend"]):
        return "browse"
    if any(w in msg for w in ["add","cart","buy"]):
        return "add_to_cart"
    if any(w in msg for w in ["size","available","inventory"]):
        return "inventory"
    if any(w in msg for w in ["checkout","pay","purchase"]):
        return "checkout"
    if any(w in msg for w in ["detail","does it","is it"]):
        return "product_details"
    return "other"

def product_detail_agent(pid: str, user_message: str):
    p = pid_to_prod.get(pid)
    if not p:
        return {"answer":"Product not found."}
    return {"answer":f"{p['title']}: {p['desc']} Price Rs{p['price']}"}

def format_product_cards(pids):
    cards = []
    for pid in pids:
        p = pid_to_prod.get(pid)
        if p:
            cards.append({'pid': pid, 'title': p['title'], 'subtitle': p['desc'], 'price': p['price']})
    return cards

def recommendation_agent(user_message: str, top_k: int = 3):
    recs, _ = faiss_search(user_message, k=top_k)
    return recs

def sales_agent_handle_with_memory(session_id: str, user_id: str, user_message: str):
    add_to_history(session_id,"user",user_message)
    intent = classify_intent(user_message)
    if intent in ("browse","filter"):
        recs = recommendation_agent(user_message, top_k=3)
        s = get_session(session_id)
        s["last_recs"] = recs
        s["last_query"] = user_message
        add_to_history(session_id,"assistant",json.dumps(recs))
        return {"type":"recommendation","intent":"browse","products":recs,"ui":{"title":"Recommended for you","subtitle":"Based on your query","cards":format_product_cards(recs)}}
    if intent == "product_details":
        pid = resolve_reference_to_pid(user_message, session_id)
        if not pid:
            return {"intent":"product_details","error":"could_not_resolve_product"}
        detail = product_detail_agent(pid, user_message)
        add_to_history(session_id,"assistant",detail["answer"])
        return {"type":"product_detail","intent":"product_details","product":pid,"answer":detail["answer"],"ui":{"title":f"Details about {pid}","description":detail["answer"]}}
    if intent == "add_to_cart":
        return add_to_cart_flow(session_id,user_id,user_message)
    if intent == "inventory":
        pid = resolve_reference_to_pid(user_message, session_id)
        size = None
        m = re.search(r"size\s*[:=]?\s*([xsmlxl0-9]+)", user_message, re.IGNORECASE)
        if m:
            size = normalize_size(m.group(1))
        if not pid:
            return {"reply":"Which product do you mean?","ui":{}}
        status, qty = check_inventory(pid, size or "M")
        return {"reply":f"Inventory for {pid} size {size or 'M'}: {status} ({qty})","actions":[]}
    if intent == "checkout":
        return checkout_flow(session_id,user_id)
    return {"intent":"other","message":"I did not understand the request."}

def chat_agent(user_id: str, message: str, session_context: Dict[str, Any] = None):
    session_id = (session_context or {}).get("session_id","default")
    return sales_agent_handle_with_memory(session_id,user_id,message)

try:
    init()
except Exception:
    pass
