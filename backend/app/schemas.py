from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# --- Product ---

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    quantity_in_stock: int

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v):
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity must be non-negative")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity_in_stock: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity must be non-negative")
        return v


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    quantity_in_stock: int
    created_at: datetime
    low_stock: bool = False

    model_config = {"from_attributes": True}


# --- Customer ---

class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Order ---

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: float
    item_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderDetailResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}


# --- Dashboard ---

class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_products: List[ProductResponse]
