# EY Shopping Assistant

A comprehensive e-commerce platform with AI-powered shopping agents, built with FastAPI backend and Next.js frontend.

## Project Structure

```
├── backend/              # Python FastAPI backend
│   ├── app.py            # Main API endpoints and authentication
│   ├── database.py       # SQLAlchemy database models
│   ├── ai_agents.py      # AI-powered shopping agents with OpenAI
│   ├── fashion_chatbot.py # LangGraph-style conversational shopping assistant
│   ├── seed_data.py      # Database seeding (150 products, 9 stores, offers)
│   └── ey_groq_adapter.py  # Legacy adapter (unused)
├── frontend/             # Next.js React frontend
│   ├── pages/
│   │   ├── index.tsx     # Login/Registration page
│   │   └── dashboard.tsx # Main shopping dashboard with AI chatbot
│   ├── styles/
│   │   └── globals.css   # Global styles with dark theme
│   └── next.config.js    # Next.js configuration with API proxy
```

## Running the Application

The application runs with two workflows:
- **Backend API**: FastAPI server on port 8000
- **Frontend**: Next.js dev server on port 5000 (proxies API calls to backend)

## Features

### User Authentication
- Registration with full name, phone, email
- Location selection from 3 cities: Hyderabad, Mumbai, Delhi
- Nearest store selection (3 stores per city)
- JWT-based session management

### Product Catalog
- 150 products across 6 categories (25 each):
  - Shirts, Pants, Belts, Ethnic wear, Innerwear, Athleisure
- Category filtering and search
- Stock availability display

### AI-Powered Agents
1. **Recommendation Agent**: Personalized suggestions based on purchase history
2. **Inventory Agent**: Real-time stock checking
3. **Loyalty & Offers Agent**: Bank discounts and promotional offers
4. **Payment Agent**: Online/store purchases with COD/UPI (70% success rate, retry logic)
5. **Fulfillment Agent**: Delivery dates and in-store slot booking
6. **Post-Purchase Support Agent**: Returns, tracking, and feedback

### Shopping Flow
- Add products to cart
- Apply bank offers for discounts
- Choose payment method (UPI/Card/COD)
- Payment retry logic (max 2 attempts before in-store redirect)
- Order confirmation and tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products & Cart
- `GET /api/products` - List all products
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/{item_id}` - Remove from cart

### AI Agents
- `POST /api/agents/recommend` - Get product recommendations
- `POST /api/agents/inventory` - Check inventory
- `POST /api/agents/loyalty` - Get offers and discounts
- `POST /api/agents/payment` - Process payment
- `POST /api/agents/fulfillment` - Get delivery options
- `POST /api/agents/support` - Post-purchase support

### Orders
- `POST /api/checkout` - Place order
- `GET /api/orders` - Order history
- `POST /api/payment/retry` - Retry failed payment

### Chatbot
- `GET /api/chat/start` - Start new chat session
- `POST /api/chat` - Send message to chatbot
- `POST /api/chat/reset` - Reset chat session

### Reference Data
- `GET /api/cities` - List cities (Hyderabad, Mumbai, Delhi)
- `GET /api/stores` - List stores by city
- `GET /api/bank-offers` - Available bank offers

## Design
- Black theme with glass morphism UI
- Mobile-responsive layout
- Premium shopping experience

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `OPENAI_API_KEY` - OpenAI API key for AI agent responses (optional)

## Recent Changes
- Dec 2025: LangGraph-style AI Fashion Chatbot with state-machine flow
  - Product selection (shirts/pants/ethnic/athleisure)
  - Smart recommendations based on cart contents
  - Bank offers (HDFC ₹300/ICICI ₹250/SBI ₹200)
  - Payment with retry logic (2 attempts max)
  - Invoice generation with UUID
  - Post-purchase support and CSAT ratings
- Complete e-commerce platform with 6 AI agents
- Authentication with city/store selection
- Payment retry logic with 70% success simulation
- OpenAI integration for intelligent agent responses
