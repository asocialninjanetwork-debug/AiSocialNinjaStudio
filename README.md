# AI Social Ninja Studio

Lightweight fullstack project for a computer vision reference archive that can be integrated into LLM agent pipelines.

## Architecture

- `backend/`: Express server with `library` and `query` endpoints (file-backed JSON).
- `frontend/`: Vite + React UI for adding/searching archives and issuing CV queries.

## Run Locally

### Backend

```bash
cd backend
npm install
npm run start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If both start, open `http://localhost:5173` and use the UI.

## API Endpoints

- `GET /api/library` (with optional `?q=term`)
- `GET /api/library/:id`
- `POST /api/library` JSON: `{title,tags,content}`
- `POST /api/query` JSON: `{question,maxRefs?}`

## Use Case

This enables your LLM agent to query the archive and then compose answers with CV-specific references in the response body.
