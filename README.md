# 🛍️ AI-Driven Omnichannel Conversational Sales Agent  
### EY Techathon 6.0 | Team Mavericks

---
🎥 **Watch the Full Working Demo :**  
👉 **YouTube Demo Video:** https://www.youtube.com/watch?v=tmCWYhV8wxI

## 📌 Problem Statement  
**Retail Fashion & Lifestyle (ABFRL – Omnichannel Retail Ecosystem)**

Modern fashion retail faces fragmented customer journeys across multiple touchpoints:

- Mobile apps  
- Websites  
- Chat interfaces  
- In-store experiences  

This fragmentation leads to:

- ❌ Lost personalization  
- ❌ Broken shopping context  
- ❌ Lower conversion rates and AOV  
- ❌ Increased operational workload on store and support teams  

---

## 💡 Our Solution  

We built a **deterministic, state-machine–driven Conversational Sales Agent** that simulates a real-world omnichannel fashion shopping experience.

Instead of relying on prompt-based LLM guessing, our system uses a **Sales Orchestrator–style workflow** where:

- Each user interaction follows a controlled state transition  
- No infinite loops or hallucinations occur  
- The system remains predictable and production-ready  

### What the Agent Supports

- Guided shopping (category → product → size → cart → checkout)  
- Context-aware product recommendations  
- Dynamic pricing and bank offers  
- Payment success and failure handling  
- Automated invoice generation  
- Post-purchase returns and exchanges  

---

## 🧠 Architecture Overview  

### Core Design Principle  
**Conversation as a State Machine, not free-form chat.**

### Key Components  

**1. Central Sales Orchestrator**  
Controls conversation flow using explicit states such as `ask_product`, `select_product`, and `payment`.

**2. Inventory & Pricing Engine**  
Provides stock-aware product listings and dynamic cart totals.

**3. Recommendation Logic**  
ML-inspired price-affinity and complementary-category recommendations.

**4. Post-Purchase Support Agent**  
Handles returns and exchanges without resetting the session.

---

## 🛠️ Technologies Used  

### Core Stack  

- **Python** – Business logic and orchestration  
- **LangGraph** – State-machine–based conversation flow  
- **ReportLab** – Invoice generation  
- **TypedDict** – Strongly typed conversational state  

### Conceptual Stack (EY Proposal Alignment)

- Omnichannel interfaces (Web / App / Messaging)  
- Centralized Sales Orchestrator  
- Worker-agent architecture (Recommendation, Payment, Support)  


## 📓 Prototype Notebook  

The complete working prototype is implemented in a **Google Colab notebook**.

**Open in Colab:**  
https://colab.research.google.com/drive/138hUSaNXROHWMrOxCpf9U0H4YoU3Tjc_?usp=sharing  

### The Notebook Demonstrates

- State-driven conversational flow  
- Inventory-aware product selection  
- Recommendation logic  
- Checkout and payment handling  
- Invoice generation  
- Returns and exchange workflows  

---
## 🚀 Live Demo

Kindly refer to our demo video to see the UI and our sales agent in action

Video link: https://www.youtube.com/watch?v=tmCWYhV8wxI


## 📊 Impact Metrics (Proposed)

| Metric | Expected Impact |
|------|----------------|
| Conversion Rate | +15–30% |
| Average Order Value (AOV) | +10–25% |
| Customer Retention | +15–25% |
| Operational Efficiency | Reduced manual workload |
| Omnichannel Revenue | +10–20% |

---

## 🏆 Key Highlights  

- Deterministic, loop-free conversational flow  
- Stock-aware and context-aware recommendations  
- Realistic retail checkout and post-purchase support  
- Designed for omnichannel continuity  
- Strong alignment with ABFRL’s retail ecosystem  

---

## 👥 Team Mavericks  
**Manipal Institute of Technology**

- Ankur Goel  
- Anshul Pradhan  
- Aditya Banasri  
- Riya Aparanji  
- Shashank Reddy  

---

## 🔚 Final Note  
This project demonstrates how agentic AI systems can be built using structured orchestration rather than prompt-only LLMs, making them suitable for real-world retail deployment with measurable ROI.
---



