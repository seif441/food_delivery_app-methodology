# Sprint 2 — Story 2.1: Menu Management

**Epic**: Restaurant & Menu Management
**Sprint**: Sprint 2
**Status**: In Progress

---

## Tasks

### FDM-10 — Frontend: Menu Management Interface

**Description**: Build the restaurant menu management UI allowing owners to add, edit, delete items and manage categories.

**UI Components**:
- Menu item list with image thumbnails
- Add/Edit item modal with form validation
- Category filter tabs
- Drag-and-drop item reordering
- Image upload preview
- Toggle item availability (in-stock / out-of-stock)

**Acceptance Criteria**:
- [ ] Restaurant owner can view all menu items grouped by category
- [ ] Can add a new item with name, description, price, category, image
- [ ] Can edit any existing item inline
- [ ] Can delete item with a confirmation dialog
- [ ] Image upload validates file type (PNG/JPG) and max size (2MB)
- [ ] Availability toggle reflects immediately in the customer view

---

### FDM-11 — Backend: Menu Item APIs with Image Upload

**Description**: Implement REST API for menu CRUD operations including secure file upload for item images.

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu-items` | List all items (paginated) |
| `GET` | `/api/menu-items/{id}` | Get single item |
| `POST` | `/api/menu-items` | Create new item |
| `PUT` | `/api/menu-items/{id}` | Update item |
| `DELETE` | `/api/menu-items/{id}` | Soft delete item |
| `POST` | `/api/menu-items/{id}/image` | Upload item image |
| `PATCH` | `/api/menu-items/{id}/availability` | Toggle availability |

**Request Body — Create Item**:
```json
{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 89.99,
  "categoryId": 1,
  "available": true
}
```

**Acceptance Criteria**:
- [ ] All CRUD operations secured — only restaurant owner can modify their items
- [ ] Image stored in `/uploads/menu/` with UUID filename
- [ ] Price must be positive, name required (max 100 chars)
- [ ] Returns 409 Conflict on duplicate item name within same category
- [ ] Soft delete sets `available = false` rather than removing the record
