# Multi-Tenant Quote Builder

A full-stack quote management application for service-based businesses. The system allows multiple organizations to manage customer quotes while ensuring that users can access only the data that belongs to their organization.

The project was built with NestJS, React, and TypeScript. It demonstrates multi-tenant isolation, quote editing, server-side financial calculations, runtime validation, frontend-to-backend communication, and automated testing.

## Technology Stack

### Backend

- NestJS
- TypeScript
- Express through NestJS
- class-validator
- class-transformer
- Jest

### Frontend

- React
- Vite
- TypeScript
- Native Fetch API
- CSS

### Persistence

- In-memory seeded data

The exact dependency versions are available in the `package.json` and `package-lock.json` files inside the backend and frontend directories.

## Application Architecture

The application follows a layered architecture:

```text
React Frontend
      |
      | HTTP request with X-User-Id
      v
NestJS Controller
      |
      v
Quotes Service
      |
      | User validation
      | Tenant isolation
      | Quote business logic
      | Total calculations
      v
In-Memory Data
      |
      v
JSON Response
      |
      v
React UI
```

The React frontend is responsible for displaying and editing quote information. The NestJS backend is responsible for authorization, request validation, quote ownership, business logic, and final financial calculations.

## Multi-Tenant Design

Each user belongs to one organization, and each quote belongs to one organization.

```text
Organization
   ├── Users
   └── Quotes
         └── Sections
               └── Line Items
```

Every request includes a demo user ID through the `X-User-Id` header.

Example:

```http
X-User-Id: user-a1
```

The backend uses this user ID to:

1. Find the user.
2. Read the user’s `organizationId`.
3. Filter quote access using that organization.
4. Reject access to quotes owned by another organization.

For example:

```text
user-a1 belongs to org-a
quote-a1 belongs to org-a
```

This request is allowed.

```text
user-a1 belongs to org-a
quote-b1 belongs to org-b
```

This request is rejected.

Tenant isolation is enforced in the backend service layer. The frontend does not decide quote ownership, and the client cannot override the `organizationId`.

Authentication is outside the scope of this project. The `X-User-Id` header simulates an authenticated user for testing tenant isolation.

## Features

- List quotes belonging to the current organization
- View an individual quote
- Create a quote
- Update an existing quote
- Add, edit, and remove line items
- Group line items into sections
- Apply section-level percentage markup
- Apply percentage discounts
- Apply fixed discounts
- Calculate tax
- Calculate final totals on the server
- Display live quote totals in React
- Validate incoming request payloads
- Prevent cross-tenant quote access
- Seed two organizations and multiple users
- Test tenant isolation and total calculations

## Quote Calculation Flow

All final financial values are calculated by the backend.

```text
Quantity × Unit Price
        ↓
Line Item Total
        ↓
Section Subtotal
        ↓
Section Markup
        ↓
Quote Subtotal
        ↓
Discount
        ↓
Taxable Amount
        ↓
Tax
        ↓
Final Total
```

Money is stored in integer cents.

Example:

```text
10000 cents = $100.00
2500 cents = $25.00
```

Using cents reduces floating-point precision issues in financial calculations.

The frontend displays totals immediately while the user edits the quote, but the backend recalculates all totals before returning the saved result. The backend therefore remains the source of truth.

## Quote Statuses

Supported quote statuses:

```text
draft
sent
accepted
```

The status is implemented as a TypeScript union type, which prevents unsupported values from being used during development.

## Discount Types

### Percentage discount

```json
{
  "type": "percentage",
  "value": 10
}
```

This represents a 10% discount.

### Fixed discount

```json
{
  "type": "fixed",
  "valueCents": 2500
}
```

This represents a fixed discount of $25.00.

## API Endpoints

```text
GET    /quotes
GET    /quotes/:id
POST   /quotes
PATCH  /quotes/:id
```

### List quotes

```bash
curl \
  -H "X-User-Id: user-a1" \
  http://localhost:3000/quotes
```

### Get one quote

```bash
curl \
  -H "X-User-Id: user-a1" \
  http://localhost:3000/quotes/quote-a1
```

### Test cross-tenant isolation

```bash
curl -i \
  -H "X-User-Id: user-a1" \
  http://localhost:3000/quotes/quote-b1
```

Expected result:

```text
404 Not Found
```

Returning `404` avoids revealing whether another organization’s quote exists.

## Project Structure

```text
MULTI_TENENT_SAAS/
├── backend/
│   ├── src/
│   │   ├── quotes/
│   │   │   ├── dto/
│   │   │   │   └── quote.dto.ts
│   │   │   ├── quote.types.ts
│   │   │   ├── quotes.controller.ts
│   │   │   ├── quotes.module.ts
│   │   │   ├── quotes.service.ts
│   │   │   ├── quotes.service.spec.ts
│   │   │   ├── seed-data.ts
│   │   │   └── totals.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── quotes.ts
│   │   ├── types/
│   │   │   └── quote.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Running the Backend

```bash
cd backend
npm install
npm run start:dev
```

The backend runs at:

```text
http://localhost:3000
```

## Running the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Both applications must be running at the same time.

## Running Tests

Backend tests:

```bash
cd backend
npm test -- --runInBand
```

Backend verification:

```bash
npm run lint
npm run build
```

Frontend verification:

```bash
cd frontend
npm run lint
npm run build
```

The backend tests cover:

- Tenant-isolated quote listing
- Cross-tenant access prevention
- Invalid user handling
- Server-side total calculations

## Seed Users

```text
user-a1 → org-a
user-a2 → org-a
user-b1 → org-b
```

The frontend user selector is only a demo mechanism for testing different tenants. It is not a real authentication system.

## In-Memory Persistence

Initial data is defined in:

```text
backend/src/quotes/seed-data.ts
```

When the backend starts, the seed data is loaded into the Node.js process memory.

When a quote is updated, the backend changes the quote object inside the running in-memory array. The source file is not rewritten.

```text
Browser refresh:
Saved changes remain

Backend restart:
Data resets to the original seed values
```

This behavior is expected because the project does not use a persistent database.

## Validation

Incoming request payloads are validated using NestJS `ValidationPipe`, `class-validator`, and `class-transformer`.

Validation covers:

- Required fields
- Allowed quote statuses
- Numeric quantities
- Numeric prices
- Non-negative values
- Nested sections
- Nested line items
- Discount structure
- Unsupported request properties

TypeScript types do not validate runtime JSON by themselves, so DTO classes are used to validate actual API requests.

## Design Decisions

### Backend-enforced tenant isolation

Tenant isolation is implemented in the service layer so authorization does not depend on the frontend. Every quote request checks both the quote ID and the current user’s organization.

### Server-authoritative totals

The backend recalculates all totals to prevent manipulated values from being accepted from the client.

### Money stored in cents

Integer cents reduce floating-point precision issues and make financial calculations safer.

### In-memory storage

In-memory storage was selected to keep the implementation focused on tenant isolation, quote logic, validation, frontend integration, and testing.

## Assumptions and Tradeoffs

- A user belongs to one organization.
- A quote belongs to one organization.
- Authentication is outside the project scope.
- Users and organizations are seeded.
- The `X-User-Id` header simulates the current user.
- Quote totals are calculated by the backend.
- Data resets when the backend restarts.
- The frontend is not responsible for tenant security.

## Future Improvements

For a production version, the following improvements would be added:

- PostgreSQL persistence
- Database migrations
- JWT or session-based authentication
- Role-based access control
- Admin organization and user management
- Quote history and audit logs
- Optimistic concurrency control
- Pagination, filtering, and search
- Integration and end-to-end tests
- Docker deployment
- Environment-based configuration
- CI/CD pipeline
- Monitoring and structured logging
