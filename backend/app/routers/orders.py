from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from ..schemas import OrderCreate, OrderResponse, OrderDetailResponse, OrderItemResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Validate all products and stock in a single pass before mutating
    line_items = []
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found",
            )
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Insufficient stock for '{product.name}': available {product.quantity_in_stock}, requested {item.quantity}",
            )
        line_items.append((product, item.quantity))

    total = sum(product.price * qty for product, qty in line_items)

    order = Order(customer_id=payload.customer_id, total_amount=total)
    db.add(order)
    db.flush()

    order_items = []
    for product, qty in line_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=product.price,
        )
        db.add(order_item)
        product.quantity_in_stock -= qty
        order_items.append((order_item, product))

    db.commit()
    db.refresh(order)

    return OrderDetailResponse(
        id=order.id,
        customer_id=customer.id,
        customer_name=customer.full_name,
        customer_email=customer.email,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=oi.id,
                product_id=oi.product_id,
                product_name=p.name,
                quantity=oi.quantity,
                unit_price=oi.unit_price,
                subtotal=oi.quantity * oi.unit_price,
            )
            for oi, p in order_items
        ],
    )


@router.get("", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [
        OrderResponse(
            id=o.id,
            customer_id=o.customer_id,
            customer_name=o.customer.full_name,
            total_amount=o.total_amount,
            item_count=len(o.items),
            created_at=o.created_at,
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return OrderDetailResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        customer_email=order.customer.email,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.quantity * item.unit_price,
            )
            for item in order.items
        ],
    )


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Restore stock before deleting
    for item in order.items:
        item.product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
