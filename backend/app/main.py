import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import products, customers, orders
from .models import Product, Customer, Order, OrderItem  # ensure models are registered
from .schemas import DashboardStats
from sqlalchemy.orm import Session
from .database import get_db
from fastapi import Depends

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    from .routers.products import LOW_STOCK_THRESHOLD
    from .schemas import ProductResponse

    all_products = db.query(Product).all()
    low_stock = [p for p in all_products if p.quantity_in_stock < LOW_STOCK_THRESHOLD]

    return DashboardStats(
        total_products=len(all_products),
        total_customers=db.query(Customer).count(),
        total_orders=db.query(Order).count(),
        low_stock_count=len(low_stock),
        low_stock_products=[
            ProductResponse(
                id=p.id,
                name=p.name,
                sku=p.sku,
                price=p.price,
                quantity_in_stock=p.quantity_in_stock,
                created_at=p.created_at,
                low_stock=True,
            )
            for p in low_stock
        ],
    )
