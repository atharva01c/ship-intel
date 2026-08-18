# ShipIntel

AI-powered shipment risk analysis platform that monitors, analyzes, and provides smart recommendations for your logistics chain in real-time.

## Features

- **Landing Page** — Cinematic full-screen video background with glassmorphism UI, Instrument Serif typography, and an AI-powered search input that auto-analyzes shipments
- **Dashboard** — Bento grid layout with real-time stats (total shipments, high risk count, average risk score), quick actions, and a recent shipments table
- **Analyze** — Describe any shipment and get instant AI-powered risk analysis with detailed breakdowns
- **Shipment History** — View all analyzed shipments with risk badges, priority labels, and full details
- **Shipment Details** — Deep dive into any shipment with overview, risk assessment, alerts, and recommendations

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v4 with custom liquid glass components
- **Backend:** Node.js + Express + MongoDB (separate `/backend` directory)
- **AI:** NVidia NIM API for shipment risk analysis
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and API key

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## Environment Variables (Backend)

| Variable         | Description               |
| ---------------- | ------------------------- |
| `MONGO_URI`      | MongoDB connection string |
| `NVIDIA_API_KEY` | AI API key                |

## Project Structure

```
ship-intel/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Navbar, UI components
│   │   ├── pages/         # Landing, Dashboard, Analyze, Shipments, Details
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript interfaces
│   └── ...
├── backend/           # Express + MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── ...
└── README.md
```
