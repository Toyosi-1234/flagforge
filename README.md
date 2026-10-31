# FlagForge API — foundation

Node.js + Express + MongoDB/Mongoose starter for FlagForge.

## Requirements

- Node.js 20 or newer
- MongoDB local service or MongoDB Atlas
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.

Generate a secret (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start MongoDB locally, then:
```bash
npm run dev
```

Health check: `GET http://localhost:4000/health`

## API flow

1. `POST /api/v1/auth/register`
```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "a-long-password-123",
  "accountName": "Acme"
}
```
The response includes a JWT. Registration is intentionally open for local bootstrap; add email verification and restrict sign-up before production.

2. `POST /api/v1/auth/login`
```json
{ "email": "ada@example.com", "password": "a-long-password-123" }
```

3. Create a project:
`POST /api/v1/projects`
Header: `Authorization: Bearer <JWT>`
Body:
```json
{ "name": "Web App" }
```
The response creates `dev` and `prod` environments and returns one SDK key for each. **SDK secrets are only returned at creation time.** Save them safely.

4. List projects:
`GET /api/v1/projects`
Header: `Authorization: Bearer <JWT>`

5. Test SDK key:
`GET /api/v1/sdk/whoami`
Header: `x-flagforge-sdk-key: <SDK key>`

SDK keys have evaluation-only permissions. They are not accepted by admin routes. Admin JWTs are not accepted as SDK keys.

## Tests

```bash
npm test
```

The included tests cover health and rejection of unauthenticated admin/SDK requests. They do not require MongoDB.

## Foundation models

Models are defined for accounts, users, projects, environments, SDK keys, flags, immutable flag versions, audit entries, plans, usage records, payments, and webhook events.

## Important next steps before production

- Add email verification, password reset, invitation flow, and stricter registration controls.
- Add account/tenant authorization tests for every route.
- Add project/environment SDK key rotation and revocation endpoints.
- Project creation uses compensating cleanup so it also runs on a standard local standalone MongoDB instance. For production workflows spanning many documents, prefer replica-set transactions where supported.
- Add flag CRUD with immutable version/audit writes, then evaluation logic and Redis.
- Add structured logging, request IDs, security monitoring, backups, and deployment secrets management.
- Implement Squad sandbox only with real Squad sandbox credentials and documented webhook verification; never accept client-side payment claims.
