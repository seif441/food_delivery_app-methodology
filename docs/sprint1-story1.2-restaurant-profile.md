# Sprint 1 — Story 1.2: Restaurant Profile Management

**Epic**: User Management & Authentication
**Sprint**: Sprint 1
**Status**: In Progress

---

## Tasks

### FDM-9 — Backend: CRUD Endpoints for Restaurant Profiles

**Description**: Develop REST API endpoints for restaurant owners to manage their profile and operational schedules.

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/restaurants/{id}` | Retrieve restaurant profile |
| `PUT` | `/api/restaurants/{id}` | Update restaurant details |
| `PATCH` | `/api/restaurants/{id}/hours` | Update operating hours |
| `GET` | `/api/restaurants/{id}/hours` | Get operating schedule |

**Request Body — Update Profile**:
```json
{
  "name": "Bella Italia",
  "cuisineType": "Italian",
  "phone": "+20 10 1234 5678",
  "email": "contact@bellaitalia.com",
  "address": "123 Nile Street, Cairo",
  "description": "Authentic Italian cuisine in the heart of Cairo"
}
```

**Operating Hours Schema**:
```json
{
  "hours": [
    { "day": "Monday", "open": true, "from": "09:00", "to": "22:00" },
    { "day": "Sunday", "open": false }
  ]
}
```

**Acceptance Criteria**:
- [ ] Restaurant owner can update their name, cuisine type, address, phone
- [ ] Operating hours can be set per day of the week
- [ ] Closed days can be toggled independently
- [ ] API returns 404 if restaurant not found
- [ ] API returns 403 if user is not the owner of the restaurant

---

## Definition of Done
- Backend endpoints implemented and tested
- Frontend UI for profile settings connected to API
- Schema updated in `db_scripts/sqlserver/schema.sql`
- Postman collection updated with new endpoints
