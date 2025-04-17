# Fullstack App Template

## 🔧 Description

A production-grade, Dockerized fullstack application template featuring:

- ⚛️ **Frontend:** React with Next.js
- 🚀 **Backend:** Express.js with TypeScript
- 🐘 **Database:** PostgreSQL
- 🔄 **ORM:** Prisma for schema modeling and migrations
- 🐳 **Infrastructure:** Docker Compose for orchestration
- ⚙️ **Config:** Centralized in `config.json`
- 🔐 **Secrets:** Managed through `.env` files

Simulated production uses an Nginx reverse proxy to terminate HTTPS and route traffic to either the frontend or backend container based on the request path.

---

## ⚙️ Prerequisites

To run this app, ensure you have the following tools installed and configured properly on your system:

- [`Docker`](https://docs.docker.com/get-docker/) (Tool used to orchestrate nginx, postgres, frontend and backend services)
- [`Git Bash`](https://git-scm.com/downloads) (for Windows users to run the script properly)
- [`jq`](https://jqlang.org/) for parsing `config.json`
- [`openssl`](https://www.openssl.org/) for generating self-signed certificates

---

## 🚀 Running the App

Create the .env file by running the command below at project root

```bash
cp .env.dist .env
```

Populate all the secret fields with your keys. You can use the command below to generate secrets

```bash
openssl rand -hex 32
```

Run `chmod +x ./run.sh` to make the script executable then `./run.sh` to launch the application.

### 🔧 Flags

| Mode            | Command                                  | Description                                                       |
|-----------------|------------------------------------------|-------------------------------------------------------------------|
| Development     | `./run.sh development`                   | Starts all services with hot reloading for quick development      |
| Production      | `./run.sh production`                    | Simulates production with Nginx reverse proxy and built service   |
| Clean DB        | `--reset-db`                             | Deletes the named Docker volume used for Postgres data            |
| Detach Mode     | `--detach`                               | Runs Docker containers in detached mode (`-d`)                    |
| Config Path     | `--config=<file.json>`                   | Allows you to override the default `config.json` file path        |

**Example: Run the app in detached production mode with a fresh db instance and read from a config file designed for production**
```bash
./run.sh production --clean-db --detach --config=prod-config.json
```

---

## 📁 Project Structure


This template follows a clean, modular layout with clearly separated services and centralized configuration:

- **`backend/`** – Contains the Express API in TypeScript, Prisma schema/migrations, Dockerfiles, and environment templates.
- **`frontend/`** – Contains the Next.js app, configuration files, and environment templates for both dev and prod.
- **`.env.dist`** – Root-level secrets template. Actual secrets go in a `.env` file created from this.
- **`config.json`** – Central config used by `run.sh` to inject variables into Docker Compose, templates, and runtime environments.
- **`run.sh`** – Primary script for launching the stack in development or simulated production mode.
- **`nginx.template.conf`** – Nginx config template that gets populated with dynamic values at runtime.
- **`docker-compose.yaml`** & **`docker-compose.override.yaml`** – Define how all services are built and networked using Docker Compose.

Below is the complete file/folder layout for reference:

```
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── migration_lock.toml
│   │   └── schema.prisma
│   ├── src/
│   ├── .dockerignore
│   ├── .env.development.dist
│   ├── .env.production.dist
│   ├── dockerfile.development
│   ├── dockerfile.production
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── wait-for-db.sh
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .dockerignore
│   ├── .env.development.dist
│   ├── .env.production.dist
│   ├── dockerfile.development
│   ├── dockerfile.production
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
│
├── .env.dist
├── .gitignore
├── config.json
├── docker-compose.yaml
├── docker-compose.override.yaml
├── nginx.template.conf
├── README.md
└── run.sh
```

> 📌 All environment files ending in `.dist` act as templates and are never modified directly. Real `.env` files are generated at runtime by `run.sh`.

---

## 🛠️ Build Configuration

| Key | Description |
|-----|-------------|
| `projectName` | Project name used in Docker Compose context and volume naming. |

### Health Check

| Key | Description |
|-----|-------------|
| `health.endpoint` | URL to poll for backend readiness. |
| `health.interval` | Time (in seconds) between health checks. |
| `health.timeout`  | Timeout duration (in seconds) before failing. |

### SSL Certificate

| Key | Description |
|-----|-------------|
| `cert.path` | Path to the SSL certificate. |
| `cert.keyPath` | Path to the SSL private key. |

### OpenSSL Generation

| Key | Description |
|-----|-------------|
| `openssl.subject.country` | Country for SSL certificate. |
| `openssl.subject.state` | State for SSL certificate. |
| `openssl.subject.location` | City/Location for SSL certificate. |
| `openssl.subject.organization` | Organization name in SSL certificate. |
| `openssl.subject.organizationUnit` | Department/unit name in certificate. |
| `openssl.subject.commonName` | Domain name the cert is valid for. |
| `openssl.days` | Number of days the cert remains valid. |
| `openssl.keyAlgorithm` | Key algorithm (e.g., RSA). |
| `openssl.keySize` | Size of the generated key (e.g., 2048). |

### Nginx

| Key | Description |
|-----|-------------|
| `nginx.image` | Docker image used for Nginx. |
| `nginx.containerName` | Name of the Nginx container. |
| `nginx.templatePath` | Path to the Nginx config template (with `$VARS`). |
| `nginx.configurationPath` | Final generated Nginx config file path. |
| `nginx.host` | Hostname/domain used for TLS and routing. |
| `nginx.frontendEndpoint` | URL path to route frontend traffic. |
| `nginx.backendEndpoint` | URL path to route backend traffic. |
| `nginx.ports.http` | Port for HTTP access (usually 80). |
| `nginx.ports.https` | Port for HTTPS access (usually 443). |

### PostgreSQL

| Key | Description |
|-----|-------------|
| `postgres.image` | Docker image for Postgres. |
| `postgres.containerName` | Name of the Postgres container. |
| `postgres.username` | Database username. |
| `postgres.database` | Database name to initialize. |

### Frontend

| Key | Description |
|-----|-------------|
| `frontend.directory` | Local path to frontend code. |
| `frontend.workingDirectory` | Internal container working directory. |
| `frontend.envFile` | Path to frontend `.env` file. |
| `frontend.containerName` | Name of the frontend container. |
| `frontend.port` | Port exposed by the frontend dev server. |
| `frontend.development.image` | Docker image name for frontend dev. |
| `frontend.development.dockerfile` | Dockerfile used for frontend dev. |
| `frontend.production.image` | Docker image name for frontend prod. |
| `frontend.production.dockerfile` | Dockerfile used for frontend prod. |

### Backend

| Key | Description |
|-----|-------------|
| `backend.directory` | Local path to backend code. |
| `backend.workingDirectory` | Internal container working directory. |
| `backend.envFile` | Path to backend `.env` file. |
| `backend.containerName` | Name of the backend container. |
| `backend.port` | Port exposed by the Express server. |
| `backend.migrationsPath` | Path to Prisma migrations folder. |
| `backend.development.image` | Docker image name for backend dev. |
| `backend.development.dockerfile` | Dockerfile used for backend dev. |
| `backend.production.image` | Docker image name for backend prod. |
| `backend.production.dockerfile` | Dockerfile used for backend prod. |

## 🔐 Secret & Environment Variable Management

Secrets should **never** be stored in `config.json`. Each service (`frontend`, `backend`) has its own `.env` file that is generated dynamically at runtime.

These `.env` files are composed using:
- Config values from `config.json`
- Secrets defined in the **root-level** `.env` file

> 🛑 You should never edit the generated `.env` files directly. Instead, manage secrets through their corresponding `.dist` templates.

### 📌 How to Add a New Secret

1. **Define the secret in your root `.env` file:**

    ```env
    NEW_VARIABLE=super_secret_value
    ```

2. **Reference that secret in your `env.development.dist` and/or `env.production.dist` file inside `frontend/` or `backend/`:**

    ```env
    NEW_VARIABLE=$NEW_VARIABLE
    ```

At runtime, the `run.sh` script will inject values using `envsubst`, ensuring that secrets are kept secure and correctly passed into each container.
