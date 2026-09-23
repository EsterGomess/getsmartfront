# 기억공간 - Gieok Gonggan

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
gieok_gonggan/                         ← frontend root
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
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:8000` |
| `NEXT_PUBLIC_API_PREFIX` | Prefix for API routes | `/api/v1` |
| `OPENAI_API_KEY` | OpenAI API key (used on the server side) | - |
| `PORT` | Port where the frontend is exposed | `3000` |

> ⚠️ **Note:** The `.env.local` file is not copied into the Docker image for security reasons
> (listed in `.dockerignore`). In production/Docker, pass the variables through
> `docker-compose` or the command line.

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

To bring the application up in production with Docker Compose:

```bash
docker compose -f docker-compose.yml up --build
```

Or in the background (detached):

```bash
docker compose -f docker-compose.yml up --build -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

To run it directly via the Docker CLI:

```bash
# Build the image
docker build -t gieok-gonggan-web .

# Run the container
docker run -p 3000:3000 --env-file .env.local gieok-gonggan-web
```

---

### Development Mode (Hot Reload)

To develop inside containers with volume sync and hot reload:

```bash
# Docker Compose automatically merges docker-compose.override.yml
docker compose up --build
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
