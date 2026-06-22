# HealthCare Pro

Your Digital Health Partner — a full-stack health application restructured into separate backend, frontend, and database layers for better scalability, cleaner separation of concerns, and ease of deployment.

---

## Project Structure

This project is organized as a multi-tier workspace:

```
HealthCareApplication/
├── database/            # Database schema, migrations, and seed scripts
│   ├── prisma/
│   │   └── schema.prisma
│   └── scripts/         # Seed and user management scripts
│
├── backend/             # Standalone Express.js + TypeScript server
│   ├── src/             # Express API routes, middlewares, storage helpers
│   └── package.json
│
├── frontend/            # Pure Next.js React frontend (UI and pages)
│   ├── app/             # Page layouts and components (No API routes)
│   └── package.json
│
├── .env                 # Root environment variables configuration
└── README.md            # This documentation
```

---

## Tech Stack

- **Frontend**: Next.js 14 (React), Tailwind CSS, Framer Motion, Recharts, Radix UI (via shadcn/ui)
- **Backend**: Node.js, Express.js, TypeScript, Multer, Cookie Parser
- **Database**: MySQL (hosted on Railway Cloud), Prisma ORM
- **AI Integrations**: Groq (Llama-3.3 for chat + Whisper for voice transcription), OpenAI (GPT-4o Realtime Audio sessions), Sarvam AI (TTS for Indian languages)
- **Mail Integration**: Nodemailer + SMTP/Brevo for OTP delivery

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MySQL Database](https://railway.app/) (or local MySQL server instance)

### Setup Environment Variables

Create a `.env` file at the root of the repository containing:

```env
# MySQL Database (e.g. Railway Cloud)
DATABASE_URL="mysql://username:password@host:port/database"

# JWT Token Secret
JWT_SECRET="your_random_jwt_secret_key"

# Brevo / SMTP Configuration (for registration/verification OTP emails)
BREVO_API_KEY="your_brevo_api_key"
BREVO_SENDER_EMAIL="your_sender_email@gmail.com"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_app_password"
SMTP_SENDER="HealthCare Support <your_email@gmail.com>"

# Groq API Key (for AI health advice chat & voice STT)
GROQ_API_KEY="your_groq_api_key"

# Sarvam AI Key (for Indian language text-to-speech)
SARVAM_API_KEY="your_sarvam_api_key"

# OpenAI Key (for voice Realtime sessions)
OPENAI_API_KEY="your_openai_api_key"
```

---

## Local Development Execution

### 1. Database Setup
Navigate to the `database` folder, install dependencies, run migrations, and seed initial values:

```bash
cd database
npm install
npx prisma generate
npm run db:seed
```

### 2. Start Express Backend
Navigate to the `backend` folder, install dependencies, generate the local Prisma client, and start the development server:

```bash
cd ../backend
npm install
npx prisma generate --schema=../database/prisma/schema.prisma
npm run dev
```
The backend API server will run at [http://localhost:5000](http://localhost:5000).

### 3. Start Next.js Frontend
Navigate to the `frontend` folder, install dependencies, and start the Next.js development server:

```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Build for Production

To build the projects for production:

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## Author

**Vanitha Lakshmi N**
- 🎓 B.E. CSE (2022–2026)
- 📍 Bengaluru, India
- 🔗 [LinkedIn](https://www.linkedin.com/in/vanitha-lakshmi-n)
