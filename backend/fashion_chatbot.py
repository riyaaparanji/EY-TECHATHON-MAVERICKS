import random
import uuid
from datetime import datetime
from typing import Dict, Any

INVENTORY = {
    "shirts": [
        {"name": "Formal Shirt 1", "stock": 5, "price": 1999},
        {"name": "Formal Shirt 2", "stock": 0, "price": 1799},
        {"name": "Formal Shirt 3", "stock": 4, "price": 2199},
    ],
    "pants": [
        {"name": "Pant 1", "stock": 6, "price": 2499},
        {"name": "Pant 2", "stock": 3, "price": 2299},
        {"name": "Pant 3", "stock": 0, "price": 2699},
    ],
    "ethnic": [
        {"name": "Ethnic Wear 1", "stock": 2, "price": 3499},
        {"name": "Ethnic Wear 2", "stock": 5, "price": 2999},
    ],
    "athleisure": [
        {"name": "Athleisure Wear 1", "stock": 7, "price": 1599},
        {"name": "Athleisure Wear 2", "stock": 4, "price": 1799},
    ]
}

COMPLEMENTARY = {
    "shirts": ["pants"],
    "pants": ["shirts"],
    "ethnic": ["ethnic"],
    "athleisure": ["athleisure"]
}

def norm(text):
    return text.strip().lower()

def available_products(category):
    return [i["name"] for i in INVENTORY[category] if i["stock"] > 0]

def smart_recommend(category, cart, top_k=2):
    cart_products = {item["product"] for item in cart}
    cart_prices = [item["price"] for item in cart]
    avg_price = sum(cart_prices) / len(cart_prices) if cart_prices else 2000

    candidates = []

    for cat in COMPLEMENTARY.get(category, []):
        for item in INVENTORY.get(cat, []):
            if item["stock"] <= 0:
                continue
            if item["name"] in cart_products:
                continue

            price_diff = abs(item["price"] - avg_price)
            score = 1 / (1 + price_diff)

            candidates.append({
                "product": item["name"],
                "price": item["price"],
                "score": score
            })

    candidates.sort(key=lambda x: x["score"], reverse=True)
    return [c["product"] for c in candidates[:top_k]]

def generate_invoice(state):
    invoice_id = str(uuid.uuid4())[:8]
    date = datetime.now().strftime("%d-%m-%Y %H:%M")

    items = "\n".join(
        [f"{i+1}. {item['product']} (Size {item['size']}) - ₹{item['price']}"
         for i, item in enumerate(state["cart"])]
    )

    invoice_text = f"""
==============================
        SMART FASHION STORE
==============================
Invoice ID : {invoice_id}
Date       : {date}

Items Purchased:
{items}

------------------------------
Subtotal      : ₹{state['cart_total']}
Discount      : ₹{state['discount']}
Final Amount  : ₹{state['final_price']}
------------------------------

Thank you for shopping with us!
==============================
"""
    filename = f"invoice_{invoice_id}.txt"
    return invoice_text, filename

def ask_product(state):
    text = norm(state["user_input"])
    for cat in INVENTORY:
        if cat in text or cat[:-1] in text:
            state["category"] = cat
            state["response"] = (
                f"Available {cat}:\n" +
                ", ".join(available_products(cat)) +
                "\n\nWhich one would you like?"
            )
            state["step"] = "select_product"
            return state

    state["response"] = "What are you shopping for? (shirts / pants / ethnic / athleisure)"
    return state

def select_product(state):
    state["product"] = state["user_input"]
    state["price"] = next(
        (i["price"] for i in INVENTORY[state["category"]] if i["name"] == state["product"]),
        random.choice([1499, 1999, 2499])
    )
    state["response"] = "Select size: S / M / L / XL"
    state["step"] = "select_size"
    return state

def select_size(state):
    state["size"] = state["user_input"].upper()
    state["response"] = "Add to cart? (yes / no)"
    state["step"] = "cart_decision"
    return state

def cart_decision(state):
    if norm(state["user_input"]) == "yes":
        state["cart"].append({
            "product": state["product"],
            "size": state["size"],
            "price": state["price"]
        })
        state["cart_total"] += state["price"]

        recs = smart_recommend(state["category"], state["cart"])
        if recs:
            state["recommended_items"] = recs
            state["response"] = (
                "Item added to cart 🛒\n\n"
                "Recommended for you:\n" +
                ", ".join(recs) +
                "\n\nAdd a recommended item? (yes / no)"
            )
            state["step"] = "recommendation"
            return state

        state["response"] = "Item added to cart 🛒\nShop more? (yes / no)"
        state["step"] = "shop_more"
        return state

    state["response"] = "Okay 🙂 What else would you like to shop for?"
    state["step"] = "ask_product"
    return state

def recommendation(state):
    if norm(state["user_input"]) == "yes" and state["recommended_items"]:
        item = state["recommended_items"][0]
        price = next(
            (i["price"] for cat in INVENTORY for i in INVENTORY[cat] if i["name"] == item),
            999
        )
        state["cart"].append({"product": item, "size": "M", "price": price})
        state["cart_total"] += price
        state["response"] = f"{item} added 👍\nShop more? (yes / no)"
    else:
        state["response"] = "No problem 🙂 Shop more? (yes / no)"

    state["step"] = "shop_more"
    return state

def shop_more(state):
    if norm(state["user_input"]) == "yes":
        state["step"] = "ask_product"
        state["response"] = "What would you like next?"
        return state

    summary = "\n".join([f"{i['product']} – ₹{i['price']}" for i in state["cart"]])
    state["response"] = (
        "🛒 CART SUMMARY:\n" + summary +
        f"\n\nSubtotal: ₹{state['cart_total']}\n\n"
        "Offers:\n1) HDFC ₹300\n2) ICICI ₹250\n3) SBI ₹200\nChoose offer:"
    )
    state["step"] = "apply_offer"
    return state

def apply_offer(state):
    offers = {"1": 300, "2": 250, "3": 200}
    state["discount"] = offers.get(state["user_input"], 0)
    state["final_price"] = state["cart_total"] - state["discount"]
    state["response"] = f"Final amount: ₹{state['final_price']}\nBuy online or store?"
    state["step"] = "payment"
    return state

def payment(state):
    choice = state["user_input"].lower()

    if choice == "store":
        state["response"] = "Please complete payment at the nearest store."
        state["step"] = "support"
        return state

    state["payment_attempts"] += 1
    success = random.random() < 0.7

    if success:
        state["response"] = "✅ Payment successful! Delivery in 3–5 days."
        state["step"] = "support"
        return state

    if state["payment_attempts"] == 1:
        state["response"] = "❌ Payment failed. Retry? (yes / no)"
        state["step"] = "payment"
        return state

    state["response"] = "❌ Payment failed twice. Please pay at store."
    state["step"] = "support"
    return state

def support(state):
    invoice_text, filename = generate_invoice(state)

    state["response"] = (
        "✅ Order completed successfully!\n\n"
        "🧾 INVOICE:\n"
        f"{invoice_text}\n"
        f"📁 Invoice saved as: {filename}\n\n"
        "⭐ Please rate your experience (1–5):"
    )

    state["step"] = "csat"
    return state

def csat(state):
    rating = state["user_input"]
    state["response"] = f"Thank you for your {rating}-star rating! Have a great day!"
    state["step"] = "end"
    return state

NODE_MAP = {
    "ask_product": ask_product,
    "select_product": select_product,
    "select_size": select_size,
    "cart_decision": cart_decision,
    "recommendation": recommendation,
    "shop_more": shop_more,
    "apply_offer": apply_offer,
    "payment": payment,
    "support": support,
    "csat": csat
}

def create_initial_state() -> Dict[str, Any]:
    return {
        "user_input": "",
        "step": "ask_product",
        "category": "",
        "product": "",
        "size": "",
        "cart": [],
        "cart_total": 0,
        "discount": 0,
        "final_price": 0,
        "payment_attempts": 0,
        "recommended_items": [],
        "response": "",
        "price": 0
    }

def process_message(state: Dict[str, Any], user_input: str) -> Dict[str, Any]:
    state["user_input"] = user_input
    current_step = state["step"]
    
    if current_step in NODE_MAP:
        state = NODE_MAP[current_step](state)
    
    return state
