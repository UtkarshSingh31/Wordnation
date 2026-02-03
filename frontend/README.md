# Vocab Tutor – Frontend

Chat-style UI for the Vocab Tutor API (grey/black theme, sidebar chat list, message area, input at bottom).

## Run locally

1. Start the API (from project root):
   ```bash
   uvicorn app.main:app --reload
   ```
2. Serve the frontend (from this folder or project root). For example:
   ```bash
   cd frontend && python -m http.server 5500
   ```
   Or with Node: `npx serve frontend -p 5500`
3. Open in browser: **http://127.0.0.1:5500** (or the port you used).

The app talks to **http://127.0.0.1:8000** by default. To use another API URL, edit `API_BASE` in `app.js`.
