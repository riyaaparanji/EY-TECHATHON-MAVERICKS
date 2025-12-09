import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(String(500))
    phone = Column(String(20))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    city = Column(String(100), nullable=False)
    nearest_store_id = Column(Integer, ForeignKey("stores.id"))
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = Column(JSON, default=dict)
    
    nearest_store = relationship("Store")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    pid = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String(500))
    stock_s = Column(Integer, default=10)
    stock_m = Column(Integer, default=10)
    stock_l = Column(Integer, default=10)
    stock_xl = Column(Integer, default=10)

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size = Column(String(10), default="M")
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0)
    final_amount = Column(Float, nullable=False)
    payment_method = Column(String(50))
    payment_status = Column(String(50), default="pending")
    order_type = Column(String(50))
    delivery_address = Column(Text)
    estimated_delivery = Column(DateTime)
    store_pickup_slot = Column(String(100))
    status = Column(String(50), default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    feedback = relationship("Feedback", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    size = Column(String(10))
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class BankOffer(Base):
    __tablename__ = "bank_offers"
    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(100), nullable=False)
    discount_percent = Column(Float, nullable=False)
    max_discount = Column(Float, nullable=False)
    min_order = Column(Float, default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="feedback")

class ReturnRequest(Base):
    __tablename__ = "return_requests"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text)
    request_type = Column(String(50))
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
