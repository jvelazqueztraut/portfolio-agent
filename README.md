# 🌌 Interactive AI-Powered Personal Portfolio

A web-based, real-time 3D interactive experience where **a virtual character** becomes an **AI-powered guide and storyteller**, presenting my work, skills, and projects through an immersive journey — blending **AI, creativity, and interactivity**.

Author: Javier Velazquez Traut (j.velazqueztraut@gmail.com)

---

## 🚀 Project Structure

```
/frontend  → Next.js + React Three Fiber (R3F) frontend
/backend   → FastAPI + Pydantic AI backend pointing to OpenRouter
```

---

## 🧠 Core Idea

The virtual character acts as a digital guide that interacts with visitors in real time — using voice, gestures, and adaptive storytelling. The experience evolves dynamically, showcasing my portfolio, projects, and expertise through an immersive and AI-driven interactive journey.

---

## 🧩 Tech Stack Overview

### **Frontend (/frontend)**
- **Framework:** Next.js (App Router)
- **3D Engine:** Three.js via React Three Fiber (R3F)
- **State Management:** Zustand + optional XState for phase control
- **UI & Effects:** Drei utilities, WebGL shaders, Web Audio API
- **Interaction:** MediaPipe for gesture recognition and hand tracking
- **Hosting:** Vercel (recommended)

### **Backend (/backend)**
- **Framework:** FastAPI (Python)
- **AI Logic:** Pydantic AI for structured agent orchestration
- **Model Gateway:** OpenRouter (access to GPT, Claude, etc.)
- **Streaming:** SSE or WebSockets for real-time responses
- **Hosting:** AWS Lambda or ECS/Fargate
- **Infra:** Terraform or AWS CDK (optional)

---

## 🧭 How It Works (High-Level Flow)

1. **User enters experience** on Next.js frontend.
2. **Interactions** (clicks, gestures, text) are sent to FastAPI backend.
3. **Pydantic AI Agent** processes logic and calls OpenRouter LLMs.
4. **Streaming responses** (text + control cues) update virtual character behavior and scene.
5. **Frontend renders real-time effects** — lighting, animation, or dialogue synced to AI output.

---

## 🎯 Target Audience

Portfolio visitors — potential employers, clients, collaborators, and anyone interested in exploring my work through an innovative and immersive experience.

---

## 🧮 Tracking & Analytics

- UTM parameters for acquisition tracking  
- Custom event tracking for engagement and completion rates  
- Optional Mixpanel or GA4 integration

---

## 🛠️ Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/portfolio-agent.git
cd portfolio-agent
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables
Create `.env` files in both `/backend` and `/frontend` for:
- OpenRouter API key  
- Backend base URL  
- Optional analytics or voice API keys

---

## 📄 License

MIT © Javier Velazquez Traut
