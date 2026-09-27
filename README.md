# Ideiateca

This application was developed as an MVP project for a graduate program at PUC-Rio.

The idea came from the need to organize and retain knowledge in a practical and lasting way,
using the **Zettelkasten** method created by Niklas Luhmann.

---

## Table of Contents

- [Overview and Structure](#overview-and-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
  - [Production Mode (Multi-stage Build)](#production-mode-multi-stage-build)
  - [Development Mode (Hot Reload)](#development-mode-hot-reload)
  - [Useful Docker Commands](#useful-docker-commands)

---

## Overview and Structure

```text
ideiateca/                             ← frontend root
├── src/                               ← Next.js source code
├── public/                            ← static public files
├── Dockerfile                         ← multi-stage (deps + builder + runner)
├── docker-compose.yml                 ← base (production with standalone)
├── docker-compose.override.yml        ← development (hot reload)
├── next.config.ts                     ← output: "standalone"
├── package.json
├── package-lock.json
├── .dockerignore
├── .env.example
└── .env.local                         ← NOT copied into the container
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20+ recommended)
- [npm](https://www.npmjs.com/) or an equivalent package manager
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (if running via containers)

---

## Environment Variables

Create a `.env.local` file at the project root based on `.env.example`:

```bash
cp .env.example .env.local
```

Available settings:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `API_URL` | Backend URL, accessed only by the Next.js server | `http://localhost:8000` locally |
| `API_PREFIX` | Backend API prefix | `/api/v1` |
| `API_CLIENT_USERNAME` | Backend service account username (server-only) | required |
| `API_CLIENT_PASSWORD` | Backend service account password (server-only) | required |
| `OPENAI_API_KEY` | OpenAI API key (used on the server side) | - |
| `PORT` | Port where the frontend is exposed | `3000` |

The service account credentials must stay private: do not prefix them with `NEXT_PUBLIC_`
or commit their values. In production, provide them through the deployment's secret manager
or environment configuration. Docker Compose defaults `API_URL` to
`http://host.docker.internal:8000`; set it to the backend's reachable address when needed.

> The `.env.local` file is not copied into the Docker image (listed in `.dockerignore`).
> Pass the variables through Docker Compose or the command line.

---

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production build

```bash
npm run build
npm run start
```

---

## Running with Docker

### Production Mode (Multi-stage Build)

The project uses Next.js's `output: "standalone"` feature together with a multi-stage
image (`deps` ➔ `builder` ➔ `runner`), producing a light and optimized final image.

Set the private variables in an uncommitted Compose env file (for local validation,
`.env.local` can be used; in production, use the deployment secret manager or a protected
env file). Then start the app with:

```bash
docker compose --env-file .env.local -f docker-compose.yml up --build
```

Or in the background (detached):

```bash
docker compose --env-file .env.local -f docker-compose.yml up --build -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To run it directly via the Docker CLI:

```bash
# Build the image
docker build -t ideiateca-web .

# Run the container
docker run -p 3000:3000 --env-file .env.local ideiateca-web
```

---

### Development Mode (Hot Reload)

To develop inside containers with volume sync and hot reload:

```bash
# Set API_URL=http://host.docker.internal:8000 in .env.local when the backend
# is running on the host machine. Compose does not load .env.local by default.
docker compose --env-file .env.local up --build --force-recreate
```

---

### Useful Docker Commands

| Action | Command |
| :--- | :--- |
| **Start services in the background** | `docker compose up -d` |
| **Rebuild and start images** | `docker compose up --build` |
| **Stop the containers** | `docker compose down` |
| **Stop and remove volumes** | `docker compose down -v` |
| **View logs in real time** | `docker compose logs -f web` |
| **Access the container shell** | `docker compose exec web sh` |
| **Check container status** | `docker compose ps` |
```
