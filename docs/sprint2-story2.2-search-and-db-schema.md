# Sprint 2 — Story 2.1 (cont.) & Story 2.2: Search & Filtering

**Epic**: Restaurant & Menu Management
**Sprint**: Sprint 2

---

## FDM-12 — Database: MenuItems, Categories, MenuModifiers Tables

**Schema additions** to `db_scripts/sqlserver/schema.sql`:

### New Tables
```sql
-- Menu modifiers (e.g. size, toppings)
CREATE TABLE menu_modifiers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id BIGINT NOT NULL,
    modifier_name VARCHAR(100) NOT NULL,  -- e.g. "Size", "Extra Cheese"
    price_delta FLOAT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Full-text search index on restaurant/product names
CREATE FULLTEXT CATALOG ft_catalog AS DEFAULT;
CREATE FULLTEXT INDEX ON products(name, description)
    KEY INDEX PK__products ON ft_catalog;
CREATE FULLTEXT INDEX ON categories(name, description)
    KEY INDEX PK__categories ON ft_catalog;
```

### Indexes for Performance
```sql
-- Optimize search and filter queries
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
```

---

## FDM-13 — Backend: Search, Filtering & Pagination Endpoints

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products/search?q=pizza` | Full-text search |
| `GET` | `/api/products?category=1&minPrice=10&maxPrice=100&sort=price` | Filter + sort |
| `GET` | `/api/categories` | List all categories |

**Query Parameters**:
- `q` — search keyword (full-text)
- `category` — filter by category ID
- `minPrice` / `maxPrice` — price range filter
- `sort` — `price_asc`, `price_desc`, `name`, `newest`
- `page` / `size` — pagination (default: page=0, size=20)
- `available` — filter only available items (`true`/`false`)

---

## Bug FDM-B3 — Fix: Duplicate Menu Items on Double-Click

**Bug**: Duplicate menu items created when restaurant owner double-clicks "Save Item".

**Root Cause**: No debounce on the save button; multiple POST requests fired.

**Fix**: Add debounce (500ms) and disable button on first click until API response.

```javascript
// Frontend fix — debounce save button
let saving = false;
document.getElementById('saveItemBtn').addEventListener('click', async () => {
    if (saving) return;
    saving = true;
    btn.disabled = true;
    try {
        await saveMenuItem();
    } finally {
        saving = false;
        btn.disabled = false;
    }
});
```

**Backend fix**: Add unique constraint on `(name, category_id)` per restaurant.
