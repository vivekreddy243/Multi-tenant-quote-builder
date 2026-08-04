# Multi-Tenant Quote Builder

A small full-stack quote builder for service businesses. The application supports multiple organizations, tenant-isolated quote access, editable quote sections and line items, discounts, tax, and server-calculated totals.

## Tech Stack

- Backend: NestJS and TypeScript
- Frontend: React, Vite, and TypeScript
- Persistence: In-memory seeded data
- Validation: class-validator
- Testing: Jest

## Features

- Multi-tenant quote isolation using the `X-User-Id` request header
- Create, list, view, and update quotes
- Add, edit, and remove line items
- Section-level percentage markup
- Percentage and fixed discounts
- Tax calculations
- Server-authoritative totals
- React live quote preview
- Seed data for two separate organizations
- Validation for quote request payloads
- Tests covering tenant isolation and total calculations

## Tenant Model

Users belong to an organization. The backend resolves the user's organization from the `X-User-Id` header and filters quote access by that organization.

The client cannot choose or override the `organizationId`. The backend always assigns it using the authenticated user's organization.

Seed users:

- `user-a1` and `user-a2` belong to `org-a`
- `user-b1` belongs to `org-b`

## Running the Backend

```bash
cd backend
npm install
npm run start:dev