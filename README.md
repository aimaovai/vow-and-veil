# Vow & Veil

A premium wedding planning SaaS foundation built for Phase 1.

## Monorepo structure

- `frontend/` — React + TypeScript + Vite public site and authenticated application shell
- `backend/` — Java 21 + Spring Boot API with PostgreSQL and server-managed sessions
- `docker-compose.yml` — local development stack

## Quick start

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start PostgreSQL and the app stack:
   `docker compose up --build`
3. Frontend: http://localhost:5173
4. Backend API: http://localhost:8080

## Local dev (without Docker)

Backend:
```bash
cd backend
mvn spring-boot:run
```

Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Phase 1 capabilities

- Public marketing website
- Authentication with secure server-managed sessions
- Wedding workspace creation and updates
- Personalized dashboard summary
- Multi-step onboarding workflow
- PostgreSQL-backed persistence using Flyway migrations

## Notes

- Venue marketplace, advanced billing, and deeper collaboration flows are intentionally deferred to future phases.
- The product is presented as a portfolio/demo foundation rather than an established operating business.
