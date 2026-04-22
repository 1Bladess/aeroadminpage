Aero Web Control

What this includes:
- Public website page with online count and devlog feed.
- Admin page with login (single owner) to manage devlog posts and update manifests.
- API for presence heartbeats, devlog, and update checks.

Setup:
1. Install Node.js 18+.
2. Open this folder in terminal.
3. Run: npm install
4. Copy .env.example to .env and fill values.
5. Run: npm start
6. Open:
   - http://localhost:8080/ (public site)
   - http://localhost:8080/admin.html (admin login)

Important:
- Only one admin account is supported by design (ADMIN_USERNAME + ADMIN_PASSWORD_HASH).
- Use a strong JWT_SECRET in production.
- If you host frontend and backend on different domains, set CORS_ORIGIN accordingly.

Aero client API usage:
- Online count: GET /api/presence/count
- Heartbeat: POST /api/presence/heartbeat
- Devlog: GET /api/devlog
- Update manifest: GET /api/updates/manifest?platform=windows&channel=stable

Permanent Hosting (Render)
1. Open: https://render.com/deploy?repo=https://github.com/1Bladess/aeroadminpage
2. Choose service name: aero-web-control (or your preferred unique name).
3. Keep plan as Starter for always-on hosting and persistent disk support.
4. Set required env var:
   - JWT_SECRET: long random string
5. Deploy.

After deploy:
1. Backend URL is typically https://aero-web-control.onrender.com
2. Health check: https://aero-web-control.onrender.com/api/health
3. Admin page: https://1bladess.github.io/aeroadminpage/admin.html

Notes:
- Frontend now defaults to the hosted backend URL on GitHub Pages.
- To override API target temporarily, append ?api=https://your-backend-domain to the page URL.
