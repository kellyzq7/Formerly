# Formerly
# Nova Receipt Reimbursement App

AI-powered receipt scanning and reimbursement tracking for clubs/teams.
Upload a receipt photo → Nova AI extracts details → Review & submit → Appended to Airtable.

## Architecture

```
receipt-app/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Express backend (Node.js)
│   ├── routes/      # API endpoints
│   ├── services/    # Nova AI, Airtable, Storage
│   └── config/      # Environment + constants
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- AWS account with Bedrock access (Nova model enabled)
- Google Cloud service account with Sheets API enabled

### 1. Clone & Install
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment
```bash
# Copy the example env file in /server
cp server/.env.example server/.env
# Fill in your credentials (see below)
```

### 3. Run
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001

## API Endpoints

| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| POST   | `/api/users/signup`            | Create user with name + clubs   |
| POST   | `/api/users/login`             | Log in by name                  |
| GET    | `/api/users/:id`               | Get user profile + clubs        |
| PUT    | `/api/users/:id/parts`         | Update club memberships         |
| POST   | `/api/receipts`                | Upload receipt image            |
| POST   | `/api/receipts/:id/extract`    | Run Nova AI extraction          |
| GET    | `/api/receipts/:id`            | Get receipt status/data         |
| POST   | `/api/receipts/:id/submit`     | Submit to Airtable         |

## User Flow

1. **Sign Up** → Enter name, select the clubs you belong to
2. **Select Club** → Pick which club this receipt is for (only shows your clubs)
3. **Upload Receipt** → Take a photo or upload an image
4. **Nova AI Extracts** → Scans receipt, returns structured data
5. **Review + Sheet Preview** → See editable fields + live Airtable row preview
6. **Confirm & Submit** → Row is appended to the club's Google Sheet tab
