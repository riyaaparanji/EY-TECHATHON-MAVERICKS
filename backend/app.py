import os
import random
from datetime import datetime, timedelta
from typing import Optional, Any, Dict, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import uvicorn

from database import (
    get_db, init_db, User, Store, Product, CartItem, Order, OrderItem, 
    BankOffer, Feedback, ReturnRequest, SessionLocal
)
from ai_agents import (
    RecommendationAgent, InventoryAgent, LoyaltyOffersAgent,
    PaymentAgent, FulfillmentAgent, PostPurchaseSupportAgent
)
from seed_data import seed_all

app = FastAPI(title='Shopping Assistant API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    city: str
    nearest_store_id: int
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CartItemCreate(BaseModel):
    product_id: int
    size: str = "M"
    quantity: int = 1

class CheckoutRequest(BaseModel):
    order_type: str
    payment_method: str
    offer_id: Optional[int] = None

class PaymentRetryRequest(BaseModel):
    order_id: int
    payment_method: str

class FeedbackRequest(BaseModel):
    order_id: int
    rating: int
    comment: str

class ReturnRequestCreate(BaseModel):
    order_id: int
    reason: str
    request_type: str = "return"

class SlotConfirmRequest(BaseModel):
    order_id: int
    slot_id: str


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user

def require_user(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@app.on_event('startup')
async def startup_event():
    init_db()
    seed_all()


@app.get('/api/stores')
async def get_stores(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Store)
    if city:
        query = query.filter(Store.city == city)
    stores = query.all()
    return [
        {"id": s.id, "name": s.name, "city": s.city, "address": s.address, "phone": s.phone}
        for s in stores
    ]

@app.get('/api/cities')
async def get_cities():
    return ["Hyderabad", "Mumbai", "Delhi"]


@app.post('/api/auth/register')
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        city=user_data.city,
        nearest_store_id=user_data.nearest_store_id,
        password_hash=get_password_hash(user_data.password),
        preferences={"categories": [], "sizes": ["M"]}
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "city": user.city
        }
    }

@app.post('/api/auth/login')
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "city": user.city
        }
    }

@app.get('/api/auth/me')
async def get_me(user: User = Depends(require_user), db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == user.nearest_store_id).first()
    last_order = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).first()
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "city": user.city,
        "nearest_store": {"id": store.id, "name": store.name, "address": store.address} if store else None,
        "preferences": user.preferences,
        "last_purchase": {
            "order_number": last_order.order_number,
            "total": last_order.final_amount,
            "date": last_order.created_at.strftime("%d %B %Y"),
            "status": last_order.status
        } if last_order else None
    }


@app.get('/api/products')
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))
    
    products = query.all()
    return [
        {
            "id": p.id,
            "pid": p.pid,
            "title": p.title,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "stock": {
                "S": p.stock_s,
                "M": p.stock_m,
                "L": p.stock_l,
                "XL": p.stock_xl
            }
        }
        for p in products
    ]

@app.get('/api/products/categories')
async def get_categories():
    return ["shirt", "pants", "belt", "ethnic", "innerwear", "athleisure"]

@app.get('/api/products/{product_id}')
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": product.id,
        "pid": product.pid,
        "title": product.title,
        "description": product.description,
        "category": product.category,
        "price": product.price,
        "stock": {
            "S": product.stock_s,
            "M": product.stock_m,
            "L": product.stock_l,
            "XL": product.stock_xl
        }
    }


@app.get('/api/cart')
async def get_cart(user: User = Depends(require_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    total = sum(item.product.price * item.quantity for item in items)
    
    return {
        "items": [
            {
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "pid": item.product.pid,
                    "title": item.product.title,
                    "price": item.product.price,
                    "category": item.product.category
                },
                "size": item.size,
                "quantity": item.quantity,
                "subtotal": item.product.price * item.quantity
            }
            for item in items
        ],
        "total": total,
        "items_count": len(items)
    }

@app.post('/api/cart')
async def add_to_cart(
    item: CartItemCreate,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == item.product_id,
        CartItem.size == item.size
    ).first()
    
    if existing:
        existing.quantity += item.quantity
    else:
        cart_item = CartItem(
            user_id=user.id,
            product_id=item.product_id,
            size=item.size,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    db.commit()
    return {"success": True, "message": "Added to cart"}

@app.delete('/api/cart/{item_id}')
async def remove_from_cart(
    item_id: int,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(item)
    db.commit()
    return {"success": True}

@app.delete('/api/cart')
async def clear_cart(user: User = Depends(require_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"success": True}


@app.get('/api/agents/recommendations')
async def get_recommendations(user: User = Depends(require_user), db: Session = Depends(get_db)):
    agent = RecommendationAgent(db)
    return agent.get_recommendations(user.id)

@app.get('/api/agents/inventory')
async def get_inventory(category: Optional[str] = None, db: Session = Depends(get_db)):
    agent = InventoryAgent(db)
    return agent.get_inventory(category)

@app.get('/api/agents/inventory/{product_id}')
async def check_product_stock(product_id: int, size: str = "M", db: Session = Depends(get_db)):
    agent = InventoryAgent(db)
    return agent.check_stock(product_id, size)

@app.get('/api/agents/offers')
async def get_offers(db: Session = Depends(get_db)):
    agent = LoyaltyOffersAgent(db)
    return agent.get_available_offers()

@app.post('/api/agents/offers/calculate')
async def calculate_discount(
    cart_total: float,
    offer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    agent = LoyaltyOffersAgent(db)
    return agent.calculate_final_price(cart_total, offer_id)

@app.get('/api/agents/payment/options')
async def get_payment_options(db: Session = Depends(get_db)):
    agent = PaymentAgent(db)
    return agent.get_payment_options()

@app.post('/api/checkout')
async def checkout(
    request: CheckoutRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    loyalty_agent = LoyaltyOffersAgent(db)
    price_result = loyalty_agent.calculate_final_price(total, request.offer_id)
    
    payment_agent = PaymentAgent(db)
    payment_result = payment_agent.initiate_payment(
        user.id, request.order_type, request.payment_method, price_result["final_price"]
    )
    
    if payment_result["status"] == "success" or payment_result["status"] == "store_pickup":
        order = Order(
            order_number=f"ORD{random.randint(100000, 999999)}",
            user_id=user.id,
            total_amount=total,
            discount_amount=price_result["discount_amount"],
            final_amount=price_result["final_price"],
            payment_method=request.payment_method,
            payment_status="paid" if payment_result["status"] == "success" else "pending",
            order_type=request.order_type,
            status="confirmed"
        )
        
        if request.order_type == "online":
            fulfillment_agent = FulfillmentAgent(db)
            delivery = fulfillment_agent.get_delivery_estimate(user.city)
            order.estimated_delivery = datetime.now() + timedelta(days=delivery["delivery_days"])
        
        db.add(order)
        db.flush()
        
        for item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                size=item.size,
                quantity=item.quantity,
                price=item.product.price
            )
            db.add(order_item)
            
            size_field = f"stock_{item.size.lower()}"
            current_stock = getattr(item.product, size_field, 0)
            setattr(item.product, size_field, max(0, current_stock - item.quantity))
        
        db.query(CartItem).filter(CartItem.user_id == user.id).delete()
        db.commit()
        
        response = {
            "success": True,
            "order": {
                "id": order.id,
                "order_number": order.order_number,
                "total": order.final_amount,
                "discount": order.discount_amount,
                "status": order.status,
                "payment_status": order.payment_status
            },
            "payment": payment_result,
            "pricing": price_result
        }
        
        if request.order_type == "online":
            response["delivery"] = {
                "estimated_date": order.estimated_delivery.strftime("%A, %d %B %Y") if order.estimated_delivery else None
            }
        else:
            fulfillment_agent = FulfillmentAgent(db)
            response["store_slots"] = fulfillment_agent.get_store_slots(user.nearest_store_id)
        
        return response
    else:
        return {
            "success": False,
            "payment": payment_result,
            "pricing": price_result
        }

@app.post('/api/checkout/retry')
async def retry_payment(
    request: PaymentRetryRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == request.order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    payment_agent = PaymentAgent(db)
    payment_result = payment_agent.initiate_payment(
        user.id, order.order_type, request.payment_method, order.final_amount
    )
    
    if payment_result["status"] == "success":
        order.payment_status = "paid"
        order.payment_method = request.payment_method
        db.commit()
    
    return {
        "success": payment_result["status"] == "success",
        "payment": payment_result
    }

@app.post('/api/checkout/confirm-slot')
async def confirm_pickup_slot(
    request: SlotConfirmRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    fulfillment_agent = FulfillmentAgent(db)
    return fulfillment_agent.confirm_fulfillment(request.order_id, "pickup", request.slot_id)


@app.get('/api/orders')
async def get_orders(user: User = Depends(require_user), db: Session = Depends(get_db)):
    support_agent = PostPurchaseSupportAgent(db)
    return support_agent.get_order_history(user.id)

@app.get('/api/orders/{order_id}/track')
async def track_order(order_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    support_agent = PostPurchaseSupportAgent(db)
    return support_agent.track_shipment(order_id)

@app.post('/api/orders/return')
async def request_return(
    request: ReturnRequestCreate,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    support_agent = PostPurchaseSupportAgent(db)
    return support_agent.request_return(request.order_id, request.reason, request.request_type)

@app.post('/api/orders/feedback')
async def submit_feedback(
    request: FeedbackRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    support_agent = PostPurchaseSupportAgent(db)
    return support_agent.submit_feedback(request.order_id, user.id, request.rating, request.comment)


@app.get('/api/dashboard')
async def get_dashboard(user: User = Depends(require_user), db: Session = Depends(get_db)):
    recommendation_agent = RecommendationAgent(db)
    recommendations = recommendation_agent.get_recommendations(user.id)
    
    loyalty_agent = LoyaltyOffersAgent(db)
    offers = loyalty_agent.get_available_offers()
    
    last_order = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).first()
    
    store = db.query(Store).filter(Store.id == user.nearest_store_id).first()
    
    return {
        "profile": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "city": user.city,
            "nearest_store": {"name": store.name, "address": store.address} if store else None
        },
        "last_purchase": {
            "order_number": last_order.order_number,
            "total": last_order.final_amount,
            "date": last_order.created_at.strftime("%d %B %Y"),
            "status": last_order.status,
            "items": [
                {"title": item.product.title, "quantity": item.quantity, "price": item.price}
                for item in last_order.items
            ]
        } if last_order else None,
        "preferences": user.preferences,
        "recommendations": recommendations,
        "offers": offers[:3]
    }


if __name__ == '__main__':
    uvicorn.run('app:app', host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), reload=True)
