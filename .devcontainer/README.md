# Dev Container Configuration

This directory contains the configuration for using Cursor/VS Code with your Docker-based development environment.

## What This Does

The dev container configuration:
- Connects Cursor/VS Code to your Docker containers
- Enables proper IntelliSense for TypeScript/Next.js and Python/Django
- Installs recommended extensions automatically
- Configures proper paths for file imports and environment variables
- Sets up port forwarding for all services (frontend: 3000, backend: 8000, db: 5432)

## How to Use

1. **Open in Dev Container**: 
   - In Cursor/VS Code, press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Dev Containers: Reopen in Container"
   - Select it and wait for the container to build/start

2. **First Time Setup**:
   - The dev container will automatically install recommended extensions
   - Make sure your `.env` file exists in the project root
   - The containers will start automatically via docker-compose

3. **Working with the Project**:
   - Frontend code is in `/app` (which maps to `frontend/package`)
   - Backend code is accessible at `/workspace/backend/warm_signal`
   - IntelliSense should now work for both TypeScript and Python imports

## Troubleshooting

If IntelliSense still doesn't work:
1. Make sure the dev container is running (check the bottom-left corner of Cursor/VS Code)
2. Reload the window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check that `node_modules` exists in `frontend/package` (run `npm install` if needed)
4. For Python, ensure the Python extension is installed and active

## Services

- **Frontend**: Next.js app running on port 3000
- **Backend**: Django API running on port 8000
- **Database**: PostgreSQL running on port 5432

All services are accessible from your host machine via the forwarded ports.








