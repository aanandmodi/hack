# StadiumIQ — AI-Powered Stadium Experience Platform

> Intelligent crowd flow analysis, queue management, and personalized navigation for 50,000+ capacity stadiums.

![StadiumIQ](https://img.shields.io/badge/StadiumIQ-v1.0-1A2E1A?style=for-the-badge&labelColor=C4651A)

## Architecture

**Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand · shadcn/ui · TanStack Query

**Backend**: FastAPI · Python · LangChain · LangGraph · GPT-4o

**Database**: Supabase (PostgreSQL)

**Streaming**: Server-Sent Events (SSE) via FastAPI StreamingResponse

## Two Views

| Operations Dashboard | Attendee PWA |
|---------------------|-------------|
| For venue staff and ops teams | For fans on their phones |
| Asymmetric grid layout (58/42) | Mobile-first, max-width 420px |
| Zone heatmap with congestion badges | Quick action pills |
| AI-powered analysis pipeline | AI concierge with typewriter response |
| Real-time alerts with resolve actions | Step-by-step walking directions |
| Queue status horizontal scroll | Nearest food/facility finder |

## AI Agent Pipeline

5-node LangGraph pipeline streaming via SSE:

1. **Crowd Flow Analysis** — Zone occupancy & hotspot detection
2. **Queue Analysis** — Wait time evaluation & alternatives
3. **Route Optimization** — Congestion-aware pathfinding
4. **Alert Generation** — Actionable staff notifications
5. **Concierge Response** — Natural language fan guidance

## Setup

### 1. Database

Run `backend/schema.sql` in your Supabase SQL Editor to create all tables and seed realistic match data.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Edit `.env` with your actual keys:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

Run the server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| Ivory | `#F5F0E8` | Base background |
| Forest Green | `#1A2E1A` | Nav, headings, text |
| Burnt Amber | `#C4651A` | Buttons, CTAs, highlights |
| Slate Blue | `#3D5A8A` | Data & status |
| Sage | `#6B8F71` | Success / safe zones |
| Ochre | `#D4A017` | Warning / moderate |
| Terracotta | `#C4451A` | Danger / congested |
| Off-white | `#FDFAF4` | Card backgrounds |

**Typography**: Playfair Display (serif headlines & metrics) + DM Sans (UI body text)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/run` | Run AI pipeline (SSE stream) |
| GET | `/api/zones` | All stadium zones |
| GET | `/api/queues` | Open queue stalls |
| GET | `/api/alerts` | Unresolved alerts |
| PATCH | `/api/alerts/:id/resolve` | Resolve an alert |
| GET | `/api/stats` | Aggregate statistics |
| GET | `/health` | Health check |

## License

MIT
