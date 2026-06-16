# P2E WebApp — Full-Stack Web3 Gaming Platform

A full-stack Play-to-Earn web application that combines a Web3 gaming dashboard, token economy, referral system, airdrop management, staking, mining, KYC verification, payment/top-up flow, withdrawal flow, admin CMS, and race-game reward modules.

This repository demonstrates an end-to-end implementation of a blockchain-connected gaming platform with both user-facing and admin-facing features.

---

## Overview

P2E WebApp is built as a full-stack ecosystem for a Web3-based racing/game reward platform.

The project includes:

- User authentication and role-based access
- User dashboard and admin dashboard
- Token balance management
- TBP / SBP / RACE token-related flows
- Referral and signup bonus system
- Airdrop campaign management
- Staking and mining modules
- KYC submission and OCR-assisted verification
- Manual and package-based top-up flow
- Withdrawal and claim management
- Race game balance, inventory, reward, fee, and championship modules
- CMS-driven public landing page content

---

## Tech Stack

### Frontend

- Next.js
- React
- JavaScript
- Axios
- Bootstrap / React Bootstrap
- Tailwind CSS
- Chart.js
- thirdweb React SDK
- ethers.js

### Backend

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

---

## Main Features

### Authentication & User Management

- Register, login, logout
- JWT-based authentication
- Role-based access for user and admin
- User profile loading
- Suspended user blocking
- Forgot password and reset password flow

### User Dashboard

- User balance overview
- Referral tree
- Transaction summary
- Race participation stats
- KYC status
- Activation progress
- Token and wallet-related pages

### Admin Dashboard

- User management
- Token management
- SBP source rules
- Airdrop management
- Bonus configuration
- CMS content management
- Mining configuration
- Staking configuration
- Exchanger configuration
- Race reward and entry fee configuration
- Withdrawal management
- Championship management

### Token Economy

The platform includes multiple token-related modules, such as:

- TBP token flow
- SBP token flow
- RACE balance
- Token transfer
- Token burn
- SBP minting and distribution
- Conversion rate configuration
- Token staking history
- Token sale and claim history

### P2E Game / Race Modules

The race-game ecosystem includes:

- Race balance
- Race sessions
- Race transactions
- Race rewards
- Race inventory
- Car customization
- Race entry fee configuration
- Race referral bonus
- Circuit owner packages
- Championship enrollment and gameplay flow

### Airdrop, Mining & Staking

- Admin-created airdrop schedules
- User airdrop participation
- Airdrop approval and distribution
- Referral mining link
- Mining click log
- Mining reward configuration
- Staking configuration
- User staking history

### KYC & OCR

- KYC submission
- KYC status check
- OCR-assisted identity document processing
- File upload support

### Payment, Top-Up & Withdrawal

- Manual top-up
- Package-based top-up
- Payment callback handling
- Transaction history
- Withdrawal inquiry
- Withdrawal execution
- Withdrawal configuration
- Claim history management

### CMS

- Public homepage content
- Banner carousel
- Running media images
- Testimonials
- Admin-managed CMS content

---

## Project Structure

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
├── .gitignore
└── README.md
```

---

## Frontend Routes

The frontend contains both public and authenticated pages, including:

- Landing page
- About
- Contact
- Sign in
- Register
- Forgot password
- Reset password
- Email verification
- Terms, Privacy, and EULA pages
- User dashboard
- Admin dashboard
- Mining page

User dashboard modules include:

- Balance
- Wallet
- Tokens
- Referral
- Airdrop
- Mining
- Staking
- Finance
- Income
- KYC
- Transaction
- Withdraw
- Leaderboard
- Championship
- Circuit

Admin dashboard modules include:

- Users
- Transactions
- Token management
- SBP token
- TBP token
- Race token
- Bonus
- Airdrop
- Mining
- Staking
- Exchanger
- CMS
- Finance
- Game
- Championship
- Withdraw
- System configuration

---

## Backend API Modules

The backend is organized into modular route and controller groups, including:

- Auth
- Referral
- Admin
- Token
- Payment
- Callback
- SBP
- Race
- Top-up
- Bonus configuration
- User balance
- CMS
- Airdrop
- Exchanger
- Mining
- Daily airdrop
- Staking
- Conversion rate
- Game
- Inventory
- Championship
- KYC
- Withdrawal
- User token
- POL claim
- TBP exchange rate

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm or yarn
- PostgreSQL
- Git

---

## Backend Setup

```bash
cd backend
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Example environment variables:

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

Run the backend:

```bash
npm start
```

The backend will run on:

```txt
http://localhost:3000
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Example environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=P2E WebApp
```

Run the frontend:

```bash
npm run dev
```

The frontend will run on:

```txt
http://localhost:3001
```

---

## Deployment Notes

This project includes PM2 configuration files for both frontend and backend:

```txt
backend/pm2-backend.config.js
frontend/pm2-frontend.config.js
```

Typical production deployment flow:

```bash
# Backend
cd backend
npm install
pm2 start pm2-backend.config.js

# Frontend
cd frontend
npm install
npm run build
pm2 start pm2-frontend.config.js
```

---

## Security Notes

This project uses:

- JWT authentication
- Role-based admin authorization
- Password hashing with bcrypt
- Request validation
- Rate limiting
- Environment-based configuration
- File upload handling
- KYC verification flow

Sensitive values such as database credentials, JWT secrets, API keys, wallet keys, and payment credentials should never be committed to the repository.

---

## Current Status

This repository is a full-stack portfolio implementation of a Web3 Play-to-Earn platform.

Some production-level setup may require additional configuration, such as:

- `.env.example`
- Database configuration template
- Deployment-specific environment variables
- API documentation
- Screenshots or demo video
- Test coverage
- Seed data or migration guide

---

## Suggested Improvements

Planned or recommended improvements:

- Add screenshots for landing page, user dashboard, and admin dashboard
- Add API documentation
- Add `.env.example` for backend and frontend
- Add database migration and seeding instructions
- Add automated tests
- Add Docker setup
- Add demo deployment link
- Add architecture diagram
- Add smart contract addresses or ABI documentation if deployed

---

## Author

Developed by Ira Roni Yuda.

This project was built as a full-stack implementation of a Web3 gaming, token economy, and admin management platform.
