Nova Receipt Reimbursement App

AI-powered receipt scanning and reimbursement tracking for clubs/teams.
Upload a receipt photo → Nova AI extracts details → Review & submit → Appended to Airtable.

Architecture
receipt-app/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Express backend (Node.js)
│   ├── routes/      # API endpoints
│   ├── services/    # Nova AI, Airtable, Storage
│   └── config/      # Environment + constants
└── README.md
Quick Start
Prerequisites

Node.js 18+

AWS account with Bedrock access (Nova model enabled)

Airtable account + Base with API access

1. Clone & Install
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
2. Configure Environment
# Copy the example env file in /server
cp server/.env.example server/.env
# Fill in your credentials (see below)
3. Airtable Setup

Create an Airtable Base for reimbursements

Create tables (or a single table with a “Part” field): Build, Programming, Outreach

Add the fields you want to store (fixed columns), including SubmittedBy

Generate a Personal Access Token (PAT) with access to the Base

Copy your Base ID and each Table ID (or table names) and add to .env

4. AWS Bedrock Setup

Ensure your AWS account has access to Amazon Nova models in Bedrock

In AWS Console → Bedrock → Model access → Enable amazon.nova-lite-v1:0

Configure AWS credentials (~/.aws/credentials or env vars)

5. Run
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

Frontend: http://localhost:5173

Backend: http://localhost:3001

API Endpoints
Method	Endpoint	Description
POST	/api/users/signup	Create user with name + clubs
POST	/api/users/login	Log in by name
GET	/api/users/:id	Get user profile + clubs
PUT	/api/users/:id/parts	Update club memberships
POST	/api/receipts	Upload receipt image
POST	/api/receipts/:id/extract	Run Nova AI extraction
GET	/api/receipts/:id	Get receipt status/data
POST	/api/receipts/:id/submit	Submit to Airtable
User Flow

Sign Up → Enter name, select the clubs you belong to

Select Club → Pick which club this receipt is for (only shows your clubs)

Upload Receipt → Take a photo or upload an image

Nova AI Extracts → Scans receipt, returns structured data

Review + Airtable Preview → See editable fields + live Airtable record preview

Confirm & Submit → Record is created in the club’s Airtable table
