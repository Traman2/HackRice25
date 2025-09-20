# HackRice25
Initial Repo for hackrice

## Twelvelabs Video Analysis Proxy

This workspace includes a small Express proxy server to interact with the Twelvelabs API for video transcription and summarization.

Server files: `server/`

Quick start:

1. Copy `server/.env.example` to `server/.env` and set `TWELVE_API_KEY`.
2. Install dependencies and run the server:

```powershell
cd server; npm install; npm run dev
```

3. In the client, the helper is at `client/src/api/twelvelabs.ts`. It calls the local proxy at `http://localhost:4000` by default. Override with `VITE_TWELVE_PROXY`.

Endpoints exposed by the proxy:
- `POST /analyze/url` - body: `{ "url": "https://..." }` to transcribe a public video URL.
- `POST /analyze/upload` - multipart form upload: field `file` with a video/audio file.
- `POST /summarize` - body: `{ "transcription": string, "timestamps": array?, "wantTimestamps": boolean? }` returns a basic summary and optional timestamp highlights.

Note: This proxy is intentionally lightweight. Adjust request shapes and integration with Twelvelabs if their API has different endpoints or authentication names.
