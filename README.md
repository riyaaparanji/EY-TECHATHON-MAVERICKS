AI-Driven Omnichannel Conversational Sales Agent
EY Techathon 6.0 | Team Mavericks
📌 Problem Statement

Retail Fashion & Lifestyle (ABFRL – Omnichannel Retail Ecosystem)

Modern fashion retail suffers from fragmented customer journeys across app, web, chat, and in-store touchpoints. This results in:

Lost personalization

Broken shopping context

Lower conversion rates and AOV

High operational workload on store and support teams

💡 Our Solution

We built a deterministic, state-machine–driven Conversational Sales Agent that simulates a real-world omnichannel fashion shopping experience.

Instead of relying on prompt-based LLM guessing, our system uses a Sales Orchestrator–style workflow where every user interaction follows a controlled, loop-free state transition—ensuring consistency, reliability, and production readiness.

The chatbot supports:

Guided shopping (category → product → size → cart → checkout)

Context-aware recommendations

Dynamic pricing and bank offers

Payment success/failure handling

Invoice generation

Post-purchase returns & exchanges

🧠 Architecture Overview

Core Design Principle:

Conversation as a State Machine, not free-form chat.

Key Components:

Central Sales Orchestrator
Controls conversation flow using explicit states (ask_product, select_product, payment, etc.)

Inventory & Pricing Engine
Stock-aware product listing with dynamic cart totals

Recommendation Logic
ML-inspired price-affinity + complementary-category recommendations

Post-Purchase Support Agent
Handles returns, exchanges, and order completion without session reset

🛠️ Technologies Used
Core Stack

Python – Business logic & orchestration

LangGraph – State-machine based conversation flow

ReportLab – Invoice generation

TypedDict – Strongly typed conversational state

Conceptual Stack (as per EY proposal)

Omnichannel interfaces (Web / App / Messaging)

Centralized Sales Orchestrator

Worker-agent architecture (Recommendation, Payment, Support)

📂 Repository Structure
.
├── notebooks/
│   └── ey1.ipynb                  # Full prototype (Colab)
│
├── data/
│   └── synthetic_customer_profile_1000.csv
│
├── demo/
│   └── demo_video.mp4             # Working prototype demo
│
├── README.md
└── requirements.txt

📓 Notebook (Prototype)

The complete working prototype is implemented in a Google Colab notebook.

👉 Open in Colab:
https://colab.research.google.com/drive/138hUSaNXROHWMrOxCpf9U0H4YoU3Tjc_?usp=sharing

The notebook demonstrates:

State-driven conversational flow

Inventory-aware product selection

Recommendation logic

Checkout, payment, and invoice generation

Returns & exchange handling


📊 Impact Metrics (Proposed)
Metric	Expected Impact
Conversion Rate	+15–30%
Average Order Value (AOV)	+10–25%
Customer Retention	+15–25%
Operational Efficiency	Reduced manual workload
Omnichannel Revenue	+10–20%
🏆 Key Highlights

Deterministic, loop-free conversational flow

Stock-aware and context-aware recommendations

Realistic retail checkout & post-purchase support

Designed for omnichannel continuity

Strong alignment with ABFRL’s retail ecosystem needs

👥 Team Mavericks – Manipal Institute of Technology

Ankur Goel

Anshul Pradhan

Aditya Banasri

Riya Aparanji

Shashank Reddy 

🔚 Final Note

This project demonstrates how agentic AI systems can be built using structured orchestration rather than prompt-only LLMs, making them suitable for real-world retail deployment with measurable ROI.
