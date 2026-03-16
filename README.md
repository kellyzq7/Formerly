# Formerly — Receipt Reimbursement App

AI-powered receipt scanning and reimbursement tracking for clubs/teams.
Upload a receipt photo → Amazon Nova AI extracts details → Review & submit → Appended to Airtable.

## Architecture

```
Formerly/
├── client/                          # React frontend (Vite + Tailwind)
│   └── src/
│       ├── components/
│       │   ├── AdminDashboard.jsx   # Admin-only: spreadsheet view of club receipts
│       │   ├── Header.jsx
│       │   ├── SuccessScreen.jsx
│       │   └── ...
│       ├── utils/api.js             # Axios wrapper + all API calls
│       └── App.jsx                  # Screen-based routing (member vs admin flows)
├── server/                          # Express backend (Node.js)
│   └── src/
│       ├── routes/
│       │   ├── users.js             # Google OAuth + user profile
│       │   ├── admin.js             # Admin-only receipt CRUD
│       │   └── receipts.js          # Upload, extract, submit
│       ├── services/
│       │   ├── airtableService.js   # Airtable read/write/delete
│       │   ├── userService.js       # DynamoDB-backed user store
│       │   └── novaService.js       # Amazon Bedrock Nova AI
│       └── config/index.js
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- AWS account with Bedrock access (Nova model enabled) and DynamoDB
- Airtable account with a base set up (one table per club)
- Google Cloud project with OAuth 2.0 credentials

### 1. Clone & Install
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=3001
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# AWS (Bedrock + DynamoDB)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
NOVA_MODEL_ID=amazon.nova-lite-v1:0

# Airtable
AIRTABLE_API_TOKEN=your_airtable_pat
AIRTABLE_BASE_ID=your_base_id

# File uploads
UPLOAD_DIR=./uploads

# Admins — comma-separated Google emails that receive the admin role
ADMIN_EMAILS=officer@example.com,another@example.com

# DynamoDB table name (auto-created on startup)
DYNAMODB_TABLE=formerly-users
```

### 3. Airtable Setup
1. Create an Airtable base
2. Create one table per club (names must match the `tableName` values in `server/src/config/index.js`)
3. Each table needs columns: `Timestamp`, `SubmittedBy`, `Part`, `Merchant`, `Date`, `Total`, `Tax`, `Currency`, `PaymentMethod`, `ReceiptID`, `Notes`, `Status`
4. Generate a Personal Access Token with `data.records:read` and `data.records:write` scopes
5. Add the token and base ID to `server/.env`

### 4. AWS Setup
1. **Bedrock** — enable `amazon.nova-lite-v1:0` in AWS Console → Bedrock → Model access
2. **DynamoDB** — the `formerly-users` table is created automatically on first server startup (requires `AmazonDynamoDBFullAccess` on your IAM user)
3. **Google OAuth** — create an OAuth 2.0 client in Google Cloud Console, add your domain to authorized origins

### 5. Run
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001

## User Roles

| Role | How assigned | Experience |
|------|-------------|------------|
| **Admin** | Email listed in `ADMIN_EMAILS` env var | Lands on Admin Dashboard — spreadsheet view of all submitted receipts per club, with delete and submit-own-receipt capabilities |
| **Member** | Everyone else | Existing receipt upload flow — pick club, photograph receipt, AI extracts data, review and submit |

Roles are checked on every sign-in so you can promote/demote users by updating `ADMIN_EMAILS` and restarting the server.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/google-auth` | Verify Google JWT, find/create user |
| GET | `/api/users/:id` | Get user profile + role |
| PUT | `/api/users/:id/parts` | Update club memberships |
| POST | `/api/receipts` | Upload receipt image |
| POST | `/api/receipts/:id/extract` | Run Nova AI extraction |
| GET | `/api/receipts/:id` | Get receipt status/data |
| POST | `/api/receipts/:id/submit` | Submit to Airtable |
| GET | `/api/admin/clubs/:clubId/receipts` | *(admin)* List all receipts for a club |
| DELETE | `/api/admin/clubs/:clubId/receipts/:recordId` | *(admin)* Delete an Airtable record |

Admin endpoints require an `x-user-id` header containing the authenticated user's ID. The server verifies the user has `role: "admin"` and that the club is in their `adminClubs` list.

## User Flow

### Club Member
1. Sign in with Google
2. Select the clubs you belong to (first sign-in only)
3. Pick which club this receipt is for
4. Upload receipt photo
5. Nova AI extracts merchant, date, total, tax, currency, payment method
6. Review and edit extracted data
7. Confirm — row appended to Airtable

### Admin
1. Sign in with Google (email must be in `ADMIN_EMAILS`)
2. Land on Admin Dashboard automatically
3. Switch between club tabs to view their submitted receipts
4. Delete records directly from the dashboard
5. Optionally click "Submit a Receipt" to use the member upload flow
6. After submission, "Back to Dashboard" returns to the spreadsheet view
