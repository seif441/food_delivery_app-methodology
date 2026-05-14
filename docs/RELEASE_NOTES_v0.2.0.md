# Release Notes — v0.2.0

**Release Date**: 2026-05-14
**Sprint Coverage**: Sprint 1 & Sprint 2

---

## What's New

### Epic 1 — User Management & Authentication
- **FDM-8** Restaurant dashboard and profile settings UI
- **FDM-9** CRUD API endpoints for restaurant profiles and operational schedules

### Epic 2 — Restaurant & Menu Management
- **FDM-10** Menu management interface (add/edit/delete items, categories)
- **FDM-11** Menu item APIs with secure image upload
- **FDM-12** MenuItems, Categories, MenuModifiers DB schema + Full-text search indexes

### Bug Fixes
- **FDM-B3** Fixed duplicate menu items created on double-click (debounce + unique constraint)

---

## Upgrade Notes
- Run updated `db_scripts/sqlserver/schema.sql` to add new tables and indexes
- No breaking changes to existing APIs

---

## Next: Sprint 3
- Cart & Order processing (FDM-14 → FDM-19)
- Stripe payment integration (FDM-20 → FDM-24)
