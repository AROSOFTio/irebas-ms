# IREBAS - Intelligent Real-Time Bank Security Monitoring System

This is a comprehensive internal security monitoring and incident management platform designed for Centenary Bank Uganda Ltd (Case Study).

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js, Socket.IO, JWT
- **Database**: MySQL 8.0
- **Deployment**: Docker, Docker Compose

## Phase 1 Implementation Features
- Complete project folder structure
- Database schema (MySQL)
- Docker integration for Frontend, Backend, Database, and phpMyAdmin
- Professional UI layout using React and Tailwind CSS
- Responsive sidebar for desktop
- Off-canvas sidebar drawer for mobile
- Dashboard page with summary cards, activity feeds, and statistical charts using the defined color palette: Primary Blue `#1455c6` and Accent Red `#b12917`.

## How to Run Locally or on Contabo VPS

This project is fully containerized using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Steps to Deploy

1. Clone or upload the repository to your VPS.
2. Navigate to the root directory `irebas-ms`.
3. Build and start the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```

### Accessing the Application
- **Frontend App**: `http://<your-vps-ip>` (Port 80)
- **Backend API**: `http://<your-vps-ip>:5000`
- **phpMyAdmin**: `http://<your-vps-ip>:8080` (Use `root` and `rootpassword` or `irebas_user` and `irebas_password`)

### Stopping the System
```bash
docker-compose down
```
