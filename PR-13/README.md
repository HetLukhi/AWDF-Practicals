# Practical 13: AI API Integration into a Web Application

**Course:** ITUE301 - Advanced Web Development Frameworks  
**Candidate Name:** Kansagra Manav Atulbhai  
**Student ID:** 24DCS038  
**Department:** Computer Science & Engineering / Information Technology  
**Institution:** Charotar University of Science and Technology (CHARUSAT)  

---

## 🎯 Aim & Objectives
To integrate an external AI service (Google Gemini or OpenAI) into the existing Task Management web application, store API keys strictly server-side, implement resilient **Graceful Degradation** for zero downtime during API failure, and apply responsible AI principles with visible disclaimers.

---

## 🏗️ Architecture & Security Model
```
[React / Web Frontend]
       │  (1) POST /api/ai/generate-description { title }
       ▼
[Express.js Backend Controller]
       │  (2) Verify Rate Limit (max 1 req / 3 sec)
       │  (3) Secure Server-side Key Access (.env)
       ▼
[External AI API: Gemini / OpenAI]
       │  (4) If Success: Parse structured suggestions
       │  (5) If Error/Offline: Catch error -> Contextual Graceful Fallback
       ▼
[Frontend UI Display]
       └── Displays editable suggestion in task textarea with AI Disclaimer
```

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If you have an API key, add it to `.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
# or OPENAI_API_KEY=your_openai_api_key_here
```
*(If no key is configured, the built-in Graceful Degradation Engine automatically serves intelligent local fallback templates).*

### 3. Run Verification Suite (Screenshot 1 & 2)
```bash
node demo.js
```

### 4. Launch Interactive Web UI (Screenshot 3 & 4)
```bash
npm start
```
Open your browser at `http://localhost:5000` to interact with the task manager and AI generation tool.
