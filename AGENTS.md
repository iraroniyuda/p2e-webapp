# AGENTS.md

## Project Context

P2E WebApp is a full-stack Play-to-Earn Web3 gaming platform with user dashboard, admin dashboard, token economy, referral system, airdrop, staking, mining, KYC verification, payment/top-up, withdrawal, CMS, race-game reward modules, inventory, and championship flow.

Treat this project as a portfolio-grade full-stack system, but keep the code production-minded: clear structure, safe auth handling, secure environment variables, predictable API behavior, and maintainable UI modules.

## Repository Structure

Root structure:

```txt
p2e-webapp/
├── backend/
│   ├── src/
│   │   ├── abi/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   ├── package.json
│   └── pm2-backend.config.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── styles/
│   ├── next.config.js
│   ├── package.json
│   └── pm2-frontend.config.js
│
└── README.md
```

## Tech Stack

Frontend:
- Next.js
- React
- JavaScript
- Axios
- Bootstrap / React Bootstrap
- Tailwind CSS
- Chart.js
- ethers.js
- thirdweb React SDK

Backend:
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Multer file upload
- Nodemailer
- Tesseract.js OCR
- ethers.js
- thirdweb SDK
- Express Validator
- Express Rate Limit

## Development Commands

Backend:

```bash
cd backend
npm install
npm start
```

Backend runs on:

```txt
http://localhost:3000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend development server runs on:

```txt
http://localhost:3001
```

Production-style frontend check:

```bash
cd frontend
npm run build
npm start
```

Lint frontend when changing frontend code:

```bash
cd frontend
npm run lint
```

## Environment Rules

Backend should use `.env.local` or local environment configuration for sensitive values.

Expected backend variables may include:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2e_webapp
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
```

Frontend should use public environment variables only when the value is safe to expose in the browser.

Expected frontend variables may include:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=P2E WebApp
```

Never commit secrets, private keys, database credentials, JWT secrets, SMTP credentials, wallet keys, payment credentials, or production API keys.

## Backend Coding Guidelines

Follow the existing modular backend structure.

Use this responsibility split:

- `routes/`: define endpoint paths and attach middleware.
- `controllers/`: handle request/response flow.
- `services/`: put reusable business logic, blockchain calls, mail logic, OCR logic, reward logic, or payment logic.
- `models/`: Sequelize models and associations.
- `middlewares/`: authentication, authorization, validation, upload handling, rate limiting.
- `utils/`: shared helpers.

When adding or editing backend logic:

- Keep controllers thin.
- Validate request input before processing.
- Use existing auth and role-based middleware patterns.
- Keep admin-only logic protected.
- Use Sequelize transactions for balance, reward, staking, withdrawal, claim, token, and payment-sensitive flows.
- Use `decimal.js` or safe numeric handling for token, balance, price, and reward calculations.
- Never use floating-point math directly for token economy logic.
- Avoid logging sensitive user data, KYC images, tokens, passwords, private keys, or payment data.
- Return consistent JSON responses.
- Handle errors with clear status codes and safe error messages.
- Do not expose internal stack traces to users.

## Frontend Coding Guidelines

Follow the existing Next.js app structure.

Use this responsibility split:

- `src/app/`: route pages and layout-level code.
- `src/components/`: reusable UI sections and dashboard modules.
- `src/contexts/`: authentication, wallet, user, or shared state context.
- `src/services/`: API client and request helpers.
- `src/styles/`: global or shared styling.

When adding or editing frontend logic:

- Use existing component style and naming patterns.
- Keep API calls inside service files when possible.
- Keep page components readable and avoid overloading them with business logic.
- Use `use client` only when the component needs hooks, browser APIs, wallet connection, local state, or event handlers.
- Preserve existing Bootstrap, React Bootstrap, Tailwind, and custom style conventions.
- Keep dashboard UI clear for both user and admin modules.
- Show loading, empty, error, and success states where relevant.
- Do not expose private backend secrets in frontend code.
- Do not hardcode production API URLs unless already established by the project.

## Web3 and Token Economy Rules

Be extra careful when editing:

- Token balance logic
- SBP / TBP / RACE flows
- Staking
- Mining rewards
- Airdrop distribution
- Referral bonuses
- Race rewards
- Championship rewards
- Withdrawals
- Claims
- Top-up and payment callbacks
- Smart contract interaction
- Wallet-related code

Rules:

- Never change reward formulas casually.
- Do not rename token fields without checking all related modules.
- Do not change balance mutation logic without checking transaction history logic.
- Do not bypass admin approval flows.
- Do not expose private wallet keys or contract signer credentials.
- Keep on-chain and off-chain state naming clear.
- Add comments when business rules are complex.

## KYC and Upload Rules

KYC and OCR flows involve sensitive user data.

When editing KYC-related code:

- Do not log uploaded document contents.
- Do not expose file paths unnecessarily.
- Validate file type and upload size.
- Keep admin approval/rejection flow explicit.
- Keep user-facing KYC status clear.
- Do not weaken authentication or admin authorization.

## API Integration Rules

When adding frontend API calls:

- Add or reuse functions in `frontend/src/services`.
- Keep endpoint naming consistent with backend route naming.
- Handle token expiration or unauthorized responses consistently.
- Avoid duplicating raw `axios` calls across many components if a shared service already exists.

When adding backend routes:

- Register routes clearly.
- Protect private routes with auth middleware.
- Protect admin routes with admin authorization.
- Validate request body, params, and query.
- Keep response shape predictable.

## Database Rules

When changing Sequelize models or migrations:

- Check existing associations before adding new relations.
- Avoid destructive migration changes unless explicitly requested.
- Keep field names consistent with existing API responses.
- Use transactions for financial or token-related writes.
- Do not silently change enum/status values that are used by frontend conditions.

Common status-driven modules include:

- KYC
- Withdrawal
- Top-up
- Airdrop
- Staking
- Mining
- Championship
- Claim
- Payment callback

## Testing and Validation

There is no meaningful backend test command yet because backend `npm test` currently exits with an error placeholder.

For now, validate changes manually by running:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

For frontend production validation, run:

```bash
cd frontend
npm run build
```

If adding tests later:

- Put backend tests near related controllers/services or in a clear test folder.
- Prioritize tests for auth, balance mutation, withdrawal, staking, airdrop, token conversion, and payment callback logic.
- Mock external blockchain, OCR, email, and payment services.

## Deployment Notes

This project includes PM2 configuration for backend and frontend.

Backend production-style flow:

```bash
cd backend
npm install
pm2 start pm2-backend.config.js
```

Frontend production-style flow:

```bash
cd frontend
npm install
npm run build
pm2 start pm2-frontend.config.js
```

Do not modify PM2 configs unless the change is directly related to deployment behavior.

## Security Rules

Always preserve or improve:

- JWT authentication
- Role-based admin authorization
- bcrypt password hashing
- Request validation
- Rate limiting
- Environment-based configuration
- File upload safety
- KYC data protection

Never commit or generate:

- Real database passwords
- Real JWT secrets
- Private wallet keys
- Real SMTP credentials
- Payment credentials
- Production API keys
- User KYC documents
- Uploaded private files
- Hardcoded admin credentials

## Change Discipline

Before editing:

1. Identify whether the change affects frontend, backend, database, Web3, payment, or admin flow.
2. Check related files before making assumptions.
3. Prefer minimal, focused changes.
4. Preserve existing naming unless there is a clear reason to rename.
5. Avoid broad refactors unless explicitly requested.
6. Keep portfolio readability high: clear names, clear flow, no messy shortcuts.

After editing:

1. Run the relevant command.
2. Check for obvious runtime errors.
3. Mention any untested area clearly.
4. Summarize changed files and reason for the change.

## Agent Behavior

When working on this repository:

- Do not invent missing APIs.
- Do not assume database columns exist without checking models/migrations.
- Do not change business rules silently.
- Do not remove security middleware.
- Do not convert the project to TypeScript unless explicitly requested.
- Do not replace the existing UI framework choices.
- Do not introduce new large dependencies unless necessary.
- Do not rewrite large modules when a small patch is enough.
- Keep comments useful, not noisy.
- If something is ambiguous, inspect nearby code and follow the dominant local pattern.

## Preferred Output Style for Code Changes

When reporting changes, use:

```txt
Changed:
- file/path.js — what changed and why

Validation:
- command run
- result

Notes:
- risk, limitation, or follow-up if any
```
