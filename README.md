# Antigravity - Meta-Driven Automation Platform

A production-ready n8n clone with SaaS layer and dynamic "Meta-Node" engine.

## Features

- **Meta-Driven Architecture**: 100+ integration steps created dynamically via JSON, not hardcoded files
- **Super Admin Dashboard**: Create integration definitions without writing code
- **Multi-Tenant SaaS**: Organizations, user management, and Stripe billing
- **Visual Workflow Editor**: React Flow-based canvas for building automations
- **Generic Execution Engine**: Dynamic step executor with variable substitution
- **BullMQ Queue System**: Reliable job processing with Redis

## Tech Stack

### Backend
- Node.js 20 LTS
- Express.js
- MongoDB (Mongoose)
- Redis + BullMQ
- Stripe SDK
- Swagger/OpenAPI

### Frontend
- React 18
- React Flow
- Tailwind CSS
- Zustand
- React Router v6

## Getting Started

### Prerequisites
- Node.js 20 LTS
- Docker & Docker Compose

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd antigravity
```

2. Start MongoDB and Redis
```bash
docker-compose up -d
```

3. Install server dependencies
```bash
cd server
npm install
cp .env.example .env
```

4. Install client dependencies
```bash
cd ../client
npm install
```

5. Start the development servers
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## Project Structure

```
/antigravity
├── docker-compose.yml
├── /server              # Backend API
│   ├── /src
│   │   ├── /config     # Configuration files
│   │   ├── /models     # Mongoose schemas
│   │   ├── /modules    # Feature modules
│   │   ├── /engine     # Execution engine
│   │   ├── /seeder     # Database seeders
│   │   └── app.js      # Entry point
│   └── package.json
└── /client             # Frontend React app
    ├── /src
    │   ├── /api        # API clients
    │   ├── /components # React components
    │   ├── /pages      # Page components
    │   ├── /store      # Zustand store
    │   └── App.jsx
    └── package.json
```

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for Swagger documentation.

## License

MIT
