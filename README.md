<div align="center">
  <img src="https://img.icons8.com/?size=512&id=vBw81wP69ZtX&format=png" alt="DocuMind Logo" width="100"/>
  <h1>DocuMind Pro</h1>
  <p><strong>Offline & Secure Local Document Intelligence — Mobile App</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
    <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
    <img src="https://img.shields.io/badge/ChromaDB-FFE02B?style=for-the-badge&logo=chromadb&logoColor=black" alt="ChromaDB" />
  </p>
</div>

---

## Overview

**DocuMind Pro** is an enterprise-grade **Retrieval-Augmented Generation (RAG)** platform designed for absolute data privacy. It runs entirely on your local machine — your sensitive documents never touch the cloud. Chat with your PDFs, DOCX, CSVs, Jupyter Notebooks, and more from your iOS or Android device.

### Key Features

* **100% Offline & Private:** Powered by local LLMs (Gemma2 via Ollama) and local embeddings (`all-MiniLM-L6-v2` via ChromaDB). No API keys, no internet required for AI inferences.
* **Native Mobile App:** Built with React Native + Expo for iOS and Android. No WebView wrappers.
* **Enterprise-Grade Authentication:** Secure login with time-sensitive email OTP verification. Sessions separated by authenticated user.
* **9+ Format Support:** PDF, DOCX, PPTX, Excel (XLSX, XLS), CSV, Markdown, TXT, and Jupyter Notebooks.
* **Native Document Picker:** Upload documents directly from your device's file system.
* **Real-Time Streaming:** Token-by-token streaming responses via Server-Sent Events (SSE).
* **Conversation Memory:** Context-aware AI that remembers the last 6 messages for natural follow-up questions.
* **Instant Auto-Summarization:** Generates a concise summary banner on document upload.
* **Session Isolation:** Each chat session is an isolated sandbox — no cross-contamination between threads.
* **Parent-Child Retrieval:** Chunks documents for accurate semantic search, returns larger parent context to the AI.
* **Markdown Responses:** Rich text rendering of AI responses with code highlighting.

---

## Project Structure

```
documind-pro-mobile/
├── mobile/                  # React Native + Expo app
│   ├── App.js               # Entry point
│   ├── app.json             # Expo configuration
│   ├── assets/              # App icons, splash screen
│   ├── src/
│   │   ├── components/      # Reusable UI & chat components
│   │   │   ├── chat/        # MessageBubble, MarkdownRenderer, OTPInput, etc.
│   │   │   └── ui/          # GradientButton, InputField, LoadingOverlay, etc.
│   │   ├── context/         # AuthContext provider
│   │   ├── navigation/      # React Navigation (Auth + Main navigators)
│   │   ├── screens/         # App screens
│   │   │   ├── auth/        # Login, Signup, ForgotPassword, ResetPassword
│   │   │   ├── landing/     # LandingScreen
│   │   │   └── workspace/   # WorkspaceScreen (chat + upload)
│   │   ├── services/        # API, auth, chat, document services
│   │   ├── theme/           # Color palette & theming
│   │   └── utils/           # Format helpers, storage utilities
│   ├── .env.example         # Environment config template
│   └── package.json
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # User model
│   │   ├── routes/          # Auth, chat, documents endpoints
│   │   └── services/        # Auth, email, parser, vector store
│   ├── requirements.txt
│   └── run_backend.ps1      # Windows startup script
├── README.md
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native 0.74, Expo SDK 51, React Navigation 6, expo-secure-store |
| **Backend** | FastAPI, SQLAlchemy (SQLite), PyJWT, bcrypt |
| **AI / RAG** | LangChain, Ollama (gemma2:2b), ChromaDB, HuggingFace (all-MiniLM-L6-v2) |
| **Document Parsing** | PyMuPDF, python-docx, openpyxl, python-pptx |
| **Email** | Gmail SMTP (SSL, port 465) with App Passwords |

---

## Getting Started

### Prerequisites

1. **Node.js** (v18+) and **Python 3.10+**
2. **Expo CLI** (optional, for advanced usage):
   ```bash
   npm install -g expo-cli
   ```
3. **Ollama** installed with the required model:
   ```bash
   ollama run gemma2:2b
   ```
4. A `.env` file in `backend/` for the email service:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

### 1. Start the Backend

```bash
cd backend
python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
source env/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Server starts at `http://127.0.0.1:8000`

### 2. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or run on a simulator:
- Android: `npx expo start --android`
- iOS: `npx expo start --ios`

### 3. Configure API URL

Create `mobile/.env` from the template:

```bash
cp mobile/.env.example mobile/.env
```

Edit `mobile/.env` based on your setup:

| Platform | API URL |
|----------|---------|
| Android Emulator | `http://10.0.2.2:8000` |
| iOS Simulator | `http://localhost:8000` |
| Physical Device | `http://YOUR_MACHINE_IP:8000` |

---

## Mobile App Screens

| Screen | Description |
|--------|-------------|
| **LandingScreen** | Welcome / onboarding screen |
| **SignupScreen** | Email registration with OTP verification |
| **LoginScreen** | Email + password login |
| **ForgotPasswordScreen** | Request password reset OTP |
| **ResetPasswordScreen** | Enter OTP and set new password |
| **WorkspaceScreen** | Main chat interface — upload documents, chat with AI |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/upload` | Upload document for processing |
| DELETE | `/api/session/{id}` | Delete a chat session |
| POST | `/api/chat` | Send a chat message |
| POST | `/api/chat/stream` | Stream chat response (SSE) |
| GET | `/api/images/{filename}` | Retrieve extracted image |
| GET | `/api/health/model` | Check Ollama model status |
| GET | `/health` | Health check |

---

## Usage Guide

1. **Sign Up:** Enter your Gmail address, receive an OTP, and verify your account.
2. **Login:** Enter your credentials to get a JWT token.
3. **Create a Session:** Tap "New Chat" in the workspace.
4. **Upload Documents:** Tap the upload button to pick PDF, DOCX, CSV, PPTX, or other supported files from your device.
5. **Chat & Analyze:** View the auto-summary, then ask questions about your document.
6. **View Images:** Ask about diagrams or charts — the AI will display extracted images in the chat.

---

## Security

* JWT tokens stored securely with `expo-secure-store`
* No secrets committed to the repository
* All AI inference runs locally — no data sent to external services
* Gmail SMTP credentials loaded from environment variables

---

<div align="center">
  <p><i>Engineered for zero-compromise local AI document intelligence.</i></p>
</div>
