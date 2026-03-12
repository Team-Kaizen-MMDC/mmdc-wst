## Docker & Local Deploy Notes — backend

This file explains how to build and run the `backend` using Docker and includes sample commands for quick testing.

Prerequisites
- Docker installed (Desktop or Engine)

Build the image (from repo root):

```bash
cd backend
docker build -t mmdc-backend:latest .
```

Run the container locally (bind port 3000):

```bash
# Copy a .env file to backend/.env (do NOT commit)
docker run --env-file .env -p 3000:3000 mmdc-backend:latest
```

Background run with restart policy:

```bash
docker run -d --restart unless-stopped --env-file .env -p 3000:3000 --name mmdc-backend mmdc-backend:latest
```

Build + run with Docker Compose (example):

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    restart: unless-stopped

# Save as docker-compose.yml and run: docker compose up -d
```

Notes
- The Dockerfile uses Node 18 and runs `node server.js` as the CMD. The container listens on the `PORT` environment variable (defaults to 3000). Make sure `MONGODB_URI` and other secrets are provided in `.env`.
- For production, push the image to a registry (ECR/GCR/Docker Hub) and use your orchestration provider (ECS/Fargate, Render, Fly, etc.).
