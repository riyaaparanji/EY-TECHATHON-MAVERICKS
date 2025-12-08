# EY Shopping Assistant

A full-stack shopping assistant demo application with AI-powered product recommendations.

## Project Structure

```
├── backend/           # Python FastAPI backend
│   ├── app.py         # Main API endpoints
│   ├── ey_groq_adapter.py  # AI agent logic and product search
│   └── products.json  # Product catalog
├── frontend/          # Next.js React frontend
│   ├── pages/         # React pages
│   │   ├── index.tsx  # Home page
│   │   └── dashboard.tsx  # Product dashboard
│   └── styles/        # CSS styles
```

## Running the Application

The application runs with two workflows:
- **Backend API**: FastAPI server on port 8000
- **Frontend**: Next.js dev server on port 5000 (proxies API calls to backend)

## Features

- Product catalog display
- AI shopping assistant that can:
  - Browse and recommend products
  - Add items to cart
  - Check inventory
  - Process checkout
- Session-based cart management
- Natural language understanding for product queries

## API Endpoints

- `POST /api/agents/chat` - Chat with the shopping assistant
- `POST /api/agents/recommend` - Get product recommendations
- `GET /api/products` - List all products
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
