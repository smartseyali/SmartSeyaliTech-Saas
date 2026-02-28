# Multi-Tenant SaaS Ecommerce Platform Architecture

This document defines the production-ready structure and schema for migrating the backend to **FastAPI**, **PostgreSQL**, and **Redis** with **JWT Auth**, enforcing a full multi-tenant architecture and Website Connector module.

## 1. Tech Stack
- **Frontend**: React + TypeScript (Vite)
- **Styling**: TailwindCSS, Lucide Icons, Recharts (Design Token Based)
- **Backend Framework**: FastAPI (Python)
- **Database**: PostgreSQL (SQLAlchemy ORM + Alembic)
- **Caching**: Redis
- **Auth**: JWT + Refresh Tokens (HttpOnly cookies for frontend, Bearer for APIs)
- **Storage**: S3 Compatible (AWS S3, MinIO)

---

## 2. Multi-Tenant Architecture & Database Schema

Every core entity contains structural traceability enforced at the SQLAlchemy model layer:
```python
class TenantMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    soft_delete = Column(Boolean, default=False)
```

### Table Definitions

**1. `tenants` (Companies)**
Stores individual merchant companies.
- `id` (UUID, PK)
- `name` (String)
- `subdomain` (String, Unique)
- `plan_id` (FK)
- `custom_domain` (String, Nullable)

**2. `users` & `tenant_users`**
- `users`: Global users (id, email, password_hash, is_platform_admin).
- `tenant_users`: Maps users to specific tenants.
    - `tenant_id`
    - `user_id`
    - `role_id` (FK to roles)

**3. RBAC Schema**
- `roles`: id, tenant_id (optional, null = global role), name (Super Admin, Admin, Manager, Merchant, Staff, Customer).
- `permissions`: id, name (`view`, `create`, `update`, `delete`, `export`, `approve`, `manage_settings`, etc.)
- `role_permissions`: role_id, permission_id

**4. Products Core**
- `products`: id, tenant_id, name, slug, description, category_id, brand_id, has_variants, seo_metadata (JSONB)
- `product_variants`: id, product_id, sku, price, compare_at_price, stock_quantity, attributes (JSONB)
- `categories`: id, tenant_id, name, parent_id

**5. Orders Core**
- `orders`: id, tenant_id, customer_id, order_number, total_amount, payment_status, fullfillment_status
- `order_line_items`: order_id, variant_id, quantity, unit_price

---

## 3. Subscription Engine Middleware

The `SubscriptionMiddleware` in FastAPI intercepts requests and enforces plan limits utilizing Redis caching for speed.

### Plan Structure
- Starter (Limits: 100 products, API disabled)
- Growth (Limits: 1000 products, 5 staff accounts, basic API)
- Pro (Unlimited products, advanced integrations)
- Enterprise (Custom limits, White-label)

**Middleware Logic:**
```python
from fastapi import Request
from redis import Redis

async def subscription_enforcement_middleware(request: Request, call_next):
    tenant_id = request.state.tenant_id
    # 1. Check Redis for active plan limits mapping
    limits = redis.get(f"tenant:{tenant_id}:limits")
    route_name = request.url.path
    
    # Example logic: blocking creation if product limit hit
    if request.method == "POST" and "products" in route_name:
        current_count = await get_product_count(tenant_id)
        if current_count >= limits['product_limit']:
            return JSONResponse(status_code=402, content={"error": "Plan limit reached."})

    response = await call_next(request)
    return response
```

---

## 4. RBAC Implementation

Roles and scopes are validated using OAuth2 HTTPBearer and Dependency Injection in FastAPI.

```python
def require_permissions(required_perms: list[str]):
    async def permission_checker(
        current_user = Depends(get_current_user),
        tenant_id = Depends(get_tenant_id)
    ):
        user_perms = await get_cached_user_permissions(current_user.id, tenant_id)
        for perm in required_perms:
            if perm not in user_perms:
                raise HTTPException(status_code=403, detail="Insufficient Permissions")
        return current_user
    return permission_checker

@app.post("/api/tenant/products")
async def create_product(
    product: ProductCreate, 
    user = Depends(require_permissions(["create"])),
    tenant_id: UUID = Depends(get_tenant_id)
):
    pass
```

---

## 5. Website Connector APIs

A headless connector system allowing merchants with existing sites (like WordPress/Webflow) to use our backend via API Keys.

### 5.1 Connector Models
- `api_keys`: id, tenant_id, key_hash, label, expires_at, created_at, revoked
- `webhooks`: id, tenant_id, event_type, target_url, secret, status

### 5.2 Required Headless API Endpoints (`/api/v1/headless/`)
- `GET /products`: Retrieve products with variants for catalog rendering.
- `POST /orders`: Allows external frontend to construct an order natively and send cart contents.
- `POST /customers`: Push externally registered users to SaaS CRM.
- `GET /inventory/{sku}`: Live stock check.

*Auth mechanism for headless APIs is distinct. It utilizes an `X-Api-Key` header mapped intrinsically to the `tenant_id`.*

### 5.3 Webhook Dispatcher (Celery/Redis)
Fires outbound hooks asynchronously:
- `order.created`, `order.updated`
- `inventory.updated`
- `payment.captured`

---

## 6. Frontend / Backend Structural Summary

### Standard Backend Tree (FastAPI):
```text
backend/
 ├── core/
 │   ├── config.py
 │   ├── security.py       # JWT processing
 │   └── middleware.py     # Tenant scoping, Rate Limiting, Subscriptions
 ├── api/
 │   ├── dependencies.py   # RBAC logic, Tenant ID extraction
 │   ├── routes/
 │   │   ├── admin/        # Super Admin only (Manage tenants, plans)
 │   │   ├── tenant/       # Standard Dashboard APIs (Needs JWT + Tenant ID)
 │   │   └── headless/     # External Connector APIs (Needs API Key)
 ├── models/               # SQLAlchemy definitions (TenantMixin)
 ├── schemas/              # Pydantic validation
 └── services/             # Busines logic (Orders, Webhooks, Payments)
```

### Standard Frontend Tree (React/Vite):
```text
src/
 ├── App.tsx               # Primary Routing Map
 ├── components/
 │   ├── global/           # ThemeProvider, Shadcn Components
 │   ├── storefront/       # Organic Theme Sections (Hero, ProductGrid)
 │   └── dashboard/        # SaaS Sidebar, TopNav, Tables
 ├── pages/
 │   ├── storefront/       # Public-facing views
 │   ├── ecommerce/        # Merchant Dashboard views
 │   └── super-admin/      # Platform-level views
 ├── hooks/
 │   ├── useAuth.ts        # JWT token handlers
 │   └── useTenant.ts      # Subdomain routing resolver
 └── lib/
     └── api.ts            # Axios interceptors handling auth & tenant headers
```

This ensures complete horizontal separation while running under a unified global codebase.
