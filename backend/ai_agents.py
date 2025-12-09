import os
import json
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = None

def get_openai_client():
    global openai_client
    if openai_client is None and OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    return openai_client

def ai_generate_response(system_prompt: str, user_message: str) -> str:
    client = get_openai_client()
    if not client:
        return None
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI error: {e}")
        return None


class RecommendationAgent:
    def __init__(self, db_session):
        self.db = db_session
    
    def get_recommendations(self, user_id: int, limit: int = 6) -> Dict[str, Any]:
        from database import Product, Order, OrderItem
        
        past_categories = []
        orders = self.db.query(Order).filter(Order.user_id == user_id).all()
        for order in orders:
            for item in order.items:
                past_categories.append(item.product.category)
        
        if past_categories:
            preferred_category = max(set(past_categories), key=past_categories.count)
            recommended = self.db.query(Product).filter(
                Product.category == preferred_category
            ).limit(limit).all()
        else:
            recommended = self.db.query(Product).order_by(Product.id).limit(limit).all()
        
        ai_message = None
        if past_categories and OPENAI_API_KEY:
            prompt = f"Based on the customer's purchase history showing preference for {preferred_category}, generate a friendly 1-2 sentence personalized recommendation message."
            ai_message = ai_generate_response(
                "You are a helpful shopping assistant. Be friendly and concise.",
                prompt
            )
        
        return {
            "products": [
                {
                    "id": p.id,
                    "pid": p.pid,
                    "title": p.title,
                    "description": p.description,
                    "category": p.category,
                    "price": p.price
                }
                for p in recommended
            ],
            "ai_message": ai_message or "Here are some products you might like!",
            "based_on": preferred_category if past_categories else "popular items"
        }


class InventoryAgent:
    def __init__(self, db_session):
        self.db = db_session
    
    def get_inventory(self, category: Optional[str] = None) -> Dict[str, Any]:
        from database import Product
        
        query = self.db.query(Product)
        if category:
            query = query.filter(Product.category == category)
        
        products = query.all()
        
        inventory = []
        for p in products:
            total_stock = p.stock_s + p.stock_m + p.stock_l + p.stock_xl
            inventory.append({
                "pid": p.pid,
                "title": p.title,
                "category": p.category,
                "price": p.price,
                "stock": {
                    "S": p.stock_s,
                    "M": p.stock_m,
                    "L": p.stock_l,
                    "XL": p.stock_xl
                },
                "total_stock": total_stock,
                "availability": "In Stock" if total_stock > 0 else "Out of Stock"
            })
        
        return {
            "category": category or "all",
            "total_products": len(inventory),
            "inventory": inventory
        }
    
    def check_stock(self, product_id: int, size: str) -> Dict[str, Any]:
        from database import Product
        
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"available": False, "message": "Product not found"}
        
        size_map = {"S": "stock_s", "M": "stock_m", "L": "stock_l", "XL": "stock_xl"}
        stock_field = size_map.get(size.upper(), "stock_m")
        available_qty = getattr(product, stock_field, 0)
        
        return {
            "available": available_qty > 0,
            "quantity": available_qty,
            "message": f"{available_qty} units available" if available_qty > 0 else "Out of stock"
        }


class LoyaltyOffersAgent:
    def __init__(self, db_session):
        self.db = db_session
    
    def get_available_offers(self) -> List[Dict[str, Any]]:
        from database import BankOffer
        
        offers = self.db.query(BankOffer).filter(BankOffer.is_active == True).all()
        return [
            {
                "id": o.id,
                "bank_name": o.bank_name,
                "discount_percent": o.discount_percent,
                "max_discount": o.max_discount,
                "min_order": o.min_order,
                "description": o.description
            }
            for o in offers
        ]
    
    def calculate_final_price(self, cart_total: float, selected_offer_id: Optional[int] = None) -> Dict[str, Any]:
        from database import BankOffer
        
        result = {
            "original_total": cart_total,
            "discount_amount": 0,
            "final_price": cart_total,
            "applied_offer": None
        }
        
        if selected_offer_id:
            offer = self.db.query(BankOffer).filter(BankOffer.id == selected_offer_id).first()
            if offer and cart_total >= offer.min_order:
                discount = min(cart_total * (offer.discount_percent / 100), offer.max_discount)
                result["discount_amount"] = discount
                result["final_price"] = cart_total - discount
                result["applied_offer"] = {
                    "bank_name": offer.bank_name,
                    "discount_percent": offer.discount_percent,
                    "saved": discount
                }
        
        ai_message = None
        if OPENAI_API_KEY:
            if result["discount_amount"] > 0:
                prompt = f"Customer saved Rs.{result['discount_amount']:.0f} on their purchase of Rs.{cart_total:.0f}. Generate a short celebratory message."
            else:
                prompt = f"Customer is purchasing items worth Rs.{cart_total:.0f}. Suggest they could save more with bank offers in a friendly way."
            ai_message = ai_generate_response(
                "You are a helpful shopping assistant. Keep responses to 1-2 sentences.",
                prompt
            )
        
        result["ai_message"] = ai_message or "Thank you for shopping with us!"
        return result


class PaymentAgent:
    def __init__(self, db_session):
        self.db = db_session
        self.payment_attempts = {}
    
    def initiate_payment(self, user_id: int, order_type: str, payment_method: str, amount: float) -> Dict[str, Any]:
        attempt_key = f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M')}"
        
        if attempt_key not in self.payment_attempts:
            self.payment_attempts[attempt_key] = 0
        
        self.payment_attempts[attempt_key] += 1
        attempt_number = self.payment_attempts[attempt_key]
        
        if order_type == "store":
            return {
                "status": "store_pickup",
                "message": "Please complete payment at the store",
                "order_type": "store"
            }
        
        success = random.random() < 0.7
        
        if success:
            return {
                "status": "success",
                "message": "Payment successful!",
                "payment_method": payment_method,
                "amount": amount,
                "transaction_id": f"TXN{random.randint(100000, 999999)}",
                "order_type": "online"
            }
        else:
            if attempt_number >= 2:
                return {
                    "status": "failed_final",
                    "message": "Payment declined. Please complete payment at your nearest store.",
                    "attempt_number": attempt_number,
                    "redirect_to_store": True
                }
            else:
                return {
                    "status": "failed",
                    "message": "Payment declined. Would you like to try again?",
                    "attempt_number": attempt_number,
                    "can_retry": True
                }
    
    def get_payment_options(self) -> Dict[str, Any]:
        return {
            "order_types": [
                {"id": "online", "name": "Online Delivery", "description": "Get it delivered to your doorstep"},
                {"id": "store", "name": "Buy from Store", "description": "Pick up from your nearest store"}
            ],
            "payment_methods": [
                {"id": "upi", "name": "UPI", "description": "Pay using UPI apps"},
                {"id": "cod", "name": "Cash on Delivery", "description": "Pay when you receive"}
            ]
        }


class FulfillmentAgent:
    def __init__(self, db_session):
        self.db = db_session
    
    def get_delivery_estimate(self, city: str) -> Dict[str, Any]:
        delivery_days = {"Hyderabad": 3, "Mumbai": 4, "Delhi": 5}
        days = delivery_days.get(city, 5)
        estimated_date = datetime.now() + timedelta(days=days)
        
        return {
            "estimated_delivery": estimated_date.strftime("%A, %d %B %Y"),
            "delivery_days": days,
            "message": f"Expected delivery in {days} business days"
        }
    
    def get_store_slots(self, store_id: int) -> List[Dict[str, Any]]:
        from database import Store
        
        store = self.db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return []
        
        slots = []
        for i in range(1, 4):
            date = datetime.now() + timedelta(days=i)
            slots.extend([
                {
                    "id": f"{store_id}_{date.strftime('%Y%m%d')}_morning",
                    "date": date.strftime("%A, %d %B"),
                    "time": "10:00 AM - 1:00 PM",
                    "store": store.name
                },
                {
                    "id": f"{store_id}_{date.strftime('%Y%m%d')}_afternoon",
                    "date": date.strftime("%A, %d %B"),
                    "time": "2:00 PM - 5:00 PM",
                    "store": store.name
                },
                {
                    "id": f"{store_id}_{date.strftime('%Y%m%d')}_evening",
                    "date": date.strftime("%A, %d %B"),
                    "time": "5:00 PM - 8:00 PM",
                    "store": store.name
                }
            ])
        
        return slots
    
    def confirm_fulfillment(self, order_id: int, fulfillment_type: str, slot_id: Optional[str] = None) -> Dict[str, Any]:
        from database import Order
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"success": False, "message": "Order not found"}
        
        if fulfillment_type == "delivery":
            order.status = "processing"
            self.db.commit()
            return {
                "success": True,
                "message": "Your order is being processed for delivery!",
                "estimated_delivery": order.estimated_delivery.strftime("%A, %d %B %Y") if order.estimated_delivery else "3-5 business days"
            }
        else:
            order.store_pickup_slot = slot_id
            order.status = "ready_for_pickup"
            self.db.commit()
            return {
                "success": True,
                "message": "Store pickup confirmed!",
                "pickup_slot": slot_id
            }


class PostPurchaseSupportAgent:
    def __init__(self, db_session):
        self.db = db_session
    
    def track_shipment(self, order_id: int) -> Dict[str, Any]:
        from database import Order
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"found": False, "message": "Order not found"}
        
        status_timeline = {
            "confirmed": [
                {"status": "Order Confirmed", "date": order.created_at.strftime("%d %B, %I:%M %p"), "completed": True}
            ],
            "processing": [
                {"status": "Order Confirmed", "date": order.created_at.strftime("%d %B, %I:%M %p"), "completed": True},
                {"status": "Processing", "date": "In Progress", "completed": True}
            ],
            "shipped": [
                {"status": "Order Confirmed", "date": order.created_at.strftime("%d %B, %I:%M %p"), "completed": True},
                {"status": "Processing", "date": order.created_at.strftime("%d %B"), "completed": True},
                {"status": "Shipped", "date": "In Transit", "completed": True}
            ],
            "delivered": [
                {"status": "Order Confirmed", "date": order.created_at.strftime("%d %B, %I:%M %p"), "completed": True},
                {"status": "Processing", "date": order.created_at.strftime("%d %B"), "completed": True},
                {"status": "Shipped", "date": order.created_at.strftime("%d %B"), "completed": True},
                {"status": "Delivered", "date": order.estimated_delivery.strftime("%d %B") if order.estimated_delivery else "Pending", "completed": True}
            ]
        }
        
        return {
            "found": True,
            "order_number": order.order_number,
            "current_status": order.status,
            "timeline": status_timeline.get(order.status, status_timeline["confirmed"]),
            "estimated_delivery": order.estimated_delivery.strftime("%A, %d %B %Y") if order.estimated_delivery else None
        }
    
    def request_return(self, order_id: int, reason: str, request_type: str = "return") -> Dict[str, Any]:
        from database import Order, ReturnRequest
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"success": False, "message": "Order not found"}
        
        return_request = ReturnRequest(
            order_id=order_id,
            user_id=order.user_id,
            reason=reason,
            request_type=request_type,
            status="pending"
        )
        self.db.add(return_request)
        self.db.commit()
        
        ai_message = None
        if OPENAI_API_KEY:
            prompt = f"Customer wants to {request_type} an order. Reason: {reason}. Generate a helpful acknowledgment message."
            ai_message = ai_generate_response(
                "You are a customer support agent. Be empathetic and helpful. Keep it to 2-3 sentences.",
                prompt
            )
        
        return {
            "success": True,
            "request_id": return_request.id,
            "message": ai_message or f"Your {request_type} request has been submitted. We'll process it within 2-3 business days.",
            "status": "pending"
        }
    
    def submit_feedback(self, order_id: int, user_id: int, rating: int, comment: str) -> Dict[str, Any]:
        from database import Feedback
        
        feedback = Feedback(
            order_id=order_id,
            user_id=user_id,
            rating=rating,
            comment=comment
        )
        self.db.add(feedback)
        self.db.commit()
        
        ai_message = None
        if OPENAI_API_KEY:
            prompt = f"Customer gave a {rating}/5 rating with comment: '{comment}'. Generate a personalized thank you message."
            ai_message = ai_generate_response(
                "You are a customer support agent. Be genuine and appreciative. Keep it to 1-2 sentences.",
                prompt
            )
        
        return {
            "success": True,
            "message": ai_message or "Thank you for your feedback! We appreciate you taking the time to share your experience."
        }
    
    def get_order_history(self, user_id: int) -> List[Dict[str, Any]]:
        from database import Order
        
        orders = self.db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
        
        return [
            {
                "id": o.id,
                "order_number": o.order_number,
                "total": o.final_amount,
                "status": o.status,
                "date": o.created_at.strftime("%d %B %Y"),
                "items_count": len(o.items)
            }
            for o in orders
        ]
