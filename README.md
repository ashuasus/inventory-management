# Inventory Management System

A full-stack inventory and order management application built with FastAPI, React, PostgreSQL, and Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Vite |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

## Features

- **Products** — create, view, edit, delete; automatic low-stock alerts (threshold < 10 units); SKU uniqueness enforced
- **Customers** — full CRUD with email uniqueness validation
- **Orders** — place orders with multiple line items; stock deducted automatically; stock restored on order deletion
- **Dashboard** — live stats: total products, customers, orders, and a low-stock product list

## Running Locally with Docker Compose

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone https://github.com/ashuasus/inventory-management.git
cd inventory-management

# (Optional) copy and edit environment variables
cp .env.example .env

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

To stop:
```bash
docker compose down
```

To also remove the database volume:
```bash
docker compose down -v
```

## Running Without Docker

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your database URL
export DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory

uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
POSTGRES_DB=inventory
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://postgres:changeme@db:5432/inventory
ALLOWED_ORIGINS=*
```

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /products | List all products |
| POST | /products | Create a product |
| GET | /products/{id} | Get a product |
| PUT | /products/{id} | Update a product |
| DELETE | /products/{id} | Delete a product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | /customers | List all customers |
| POST | /customers | Create a customer |
| GET | /customers/{id} | Get a customer |
| PUT | /customers/{id} | Update a customer |
| DELETE | /customers/{id} | Delete a customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /orders | List all orders |
| POST | /orders | Place an order (deducts stock) |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard | Aggregated stats + low-stock list |
| GET | /health | Health check |

## Docker Hub

Pre-built images are available on Docker Hub:

```bash
docker pull ashuasus/inventory-management-backend:latest
docker pull ashuasus/inventory-management-frontend:latest
```

- Backend: https://hub.docker.com/r/ashuasus/inventory-management-backend
- Frontend: https://hub.docker.com/r/ashuasus/inventory-management-frontend

## Project Structure

```
inventory-management/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Products, Customers, Orders
│   │   ├── components/      # Layout, Modal, ConfirmDialog, StatCard
│   │   └── services/api.js  # Axios API client
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```
