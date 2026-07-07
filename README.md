# GrowEasy AI-Powered CSV Importer

> **AI-powered CSV importer that intelligently extracts CRM lead information from any CSV format using Google Gemini.**

Live Demo: _[add your hosted URL here]_  
GitHub: _[add your repo URL here]_  
Position Applied: Software Developer Intern

---

## 🚀 Features

- 📤 **Drag & Drop** or click-to-upload CSV files
- 🔍 **Instant CSV Preview** — see your data before any AI processing
- 🤖 **AI-Powered Field Mapping** — Gemini intelligently maps any column names to GrowEasy CRM fields
- 📊 **Beautiful Results Table** — colour-coded status badges, stats dashboard
- ⚡ **Batch Processing** — handles large files by splitting into batches
- 🔄 **Retry Mechanism** — auto-retries failed AI batches with exponential backoff
- 📱 **Fully Responsive** — works on mobile, tablet, and desktop
- 🌑 **Dark Mode** — premium dark UI by default

---

## 🧩 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, TypeScript, Vanilla CSS |
| Backend  | Node.js, Express                    |
| AI       | Google Gemini 1.5 Flash             |
| Parsing  | csv-parse, PapaParse                |

---

## 📁 Project Structure

```
groweasy-csv-importer/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── routes/
│   │   │   └── import.js         # /api/import/preview & /process
│   │   ├── services/
│   │   │   ├── csvParser.js      # CSV parsing (handles BOM, multi-delimiter)
│   │   │   └── aiExtractor.js    # Gemini batch extraction with retry
│   │   ├── prompts/
│   │   │   └── crmExtraction.js  # Engineered extraction prompt
│   │   └── middleware/
│   │       └── upload.js         # Multer config
│   ├── .env                      # Your API key goes here
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx            # Root layout + metadata
    │   ├── page.tsx              # Main wizard page
    │   └── globals.css           # Full design system
    ├── components/
    │   ├── UploadZone.tsx        # Drag & drop uploader
    │   ├── StepIndicator.tsx     # 4-step progress bar
    │   ├── PreviewTable.tsx      # Raw CSV preview table
    │   ├── LoadingState.tsx      # Animated AI processing screen
    │   └── ResultTable.tsx       # CRM results + stats
    ├── types/index.ts            # TypeScript interfaces
    └── .env.local                # Frontend env (API URL)
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js v18+** — [Download here](https://nodejs.org)
- **Google Gemini API key** — [Get free key](https://aistudio.google.com/app/apikey)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/groweasy-csv-importer.git
cd groweasy-csv-importer
```

---

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
copy .env.example .env
```

Open `backend/.env` and paste your Gemini API key:

```
GEMINI_API_KEY=your_actual_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

✅ Backend runs at **http://localhost:3001**  
✅ Visit **http://localhost:3001/health** to verify it's running

---

### Step 3 — Set up the Frontend

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs at **http://localhost:3000**

---

### Step 4 — Open in your browser

Navigate to **http://localhost:3000** and start importing CSVs! 🎉

---

## 🔑 Getting a Gemini API Key (Free)

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key and paste it into `backend/.env`

The free tier supports generous usage — more than enough for this project.

---

## 📋 CRM Fields Extracted

| Field | Description |
|-------|-------------|
| `created_at` | Lead creation date |
| `name` | Lead full name |
| `email` | Primary email |
| `country_code` | Country calling code (e.g., +91) |
| `mobile_without_country_code` | Phone number digits |
| `company` | Company name |
| `city` | City |
| `state` | State/province |
| `country` | Country |
| `lead_owner` | Lead owner email |
| `crm_status` | `GOOD_LEAD_FOLLOW_UP` / `DID_NOT_CONNECT` / `BAD_LEAD` / `SALE_DONE` |
| `crm_note` | Notes, extra emails, extra phones |
| `data_source` | One of the allowed source values |
| `possession_time` | Property possession timeline |
| `description` | Additional description |

---

## 🌐 Deployment

### Backend → Render.com
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set root to `backend/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable: `GEMINI_API_KEY=your_key`

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set root to `frontend/`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
4. Deploy!

---

## 📝 API Reference

### `POST /api/import/preview`
Parses the CSV and returns raw rows for preview. No AI processing.

**Request:** `multipart/form-data` with `file` field  
**Response:**
```json
{
  "success": true,
  "fileName": "leads.csv",
  "totalRows": 150,
  "headers": ["Name", "Email", "Phone", ...],
  "preview": [{ "Name": "John", ... }]
}
```

### `POST /api/import/process`
Runs AI extraction on the CSV and returns CRM records.

**Request:** `multipart/form-data` with `file` field  
**Response:**
```json
{
  "success": true,
  "totalProcessed": 150,
  "totalImported": 143,
  "totalSkipped": 7,
  "records": [{ "name": "John Doe", "email": "...", ... }],
  "skipped": [{ "reason": "No email or mobile number" }],
  "errors": []
}
```

---

## 🏗️ How the AI Extraction Works

1. **CSV Parsing** — File is parsed, handling BOM, multiple delimiters (`,`, `;`, `\t`, `|`), and uneven column counts
2. **Batching** — Records are split into batches of 15 for API efficiency
3. **Prompt Engineering** — Each batch is sent to Gemini with a carefully engineered prompt that:
   - Explains all CRM fields and rules
   - Enforces allowed status/source enum values
   - Handles multiple emails and phones
   - Skips records without contact info
4. **Retry Logic** — Failed batches are retried up to 3 times with exponential backoff
5. **Response Validation** — AI output is cleaned and validated before returning

---

*Built with ❤️ for GrowEasy · Submission Deadline: 12 July 2026*
