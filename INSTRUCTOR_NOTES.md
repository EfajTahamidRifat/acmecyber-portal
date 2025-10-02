INSTRUCTOR NOTES — KEEP PRIVATE (do not ship to students with the repo)

Purpose:
- Explain which endpoints are safe to demo to students and which are intentionally insecure for demonstration.

Safe (production-like) endpoints:
- POST /api/login  (secure, parameterized)
- POST /api/logout
- GET  /api/content (paginated)
- POST /api/admin/add-content (requires server-side session & role)
- GET  /api/admin/users (requires admin session)

Insecure endpoints (only for controlled demos; keep private):
- GET /insecure/search?q=...   --> SQL injection demo (string interpolation)
- GET /insecure/secret/:key    --> reveals secrets by key (backdoor demo)

Seed and reset:
- Use `npm run seed` to create a fresh data.db.
- Default seeded credentials: carol/adminpass (admin), alice/password123, bob/letmein.

Demo suggestions:
1. Show sign-in with carol/adminpass and access admin console (safe).
2. Explain how server-side sessions and role checks protect admin operations.
3. In an isolated lab, enable and call `/insecure/search` to demonstrate SQLi:
   - Example payload to illustrate (only in lab): `q=%' OR '1'='1`
4. Demonstrate discovery of hidden artifacts using `/insecure/secret/legacy_api_backdoor_2025`
5. After demos, reseed DB.

Logistics:
- Never enable the insecure endpoints on a publicly reachable host.
- If running in a classroom with multiple devices, use host-only network or local machine only.
