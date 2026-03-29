# API Key Management Service

The **API Key Service** is responsible for the creation, lifecycle management, and validation of API keys across the AgenticAI platform. It ensures secure authentication and granular usage tracking for external access.

---

## 🚀 Key Features

- **Key Generation**: Create secure, high-entropy API keys (via `nanoid`).
- **Management**: Enable users to view, rename, and revoke active API keys.
- **Authentication**: Provide middleware for validating incoming requests against stored keys.
- **Usage Monitoring**: Track key usage to prevent abuse and provide detailed analytics.
- **Database Persistence**: Reliable storage of key metadata and association with platforms/users.

---

## 🛠 Technology Stack

- **Framework**: Express (v5)
- **Database**: PostgreSQL (`pg`)
- **Tracing & Logging**: Pino
- **Validation**: JSON Web Tokens (`jsonwebtoken`)
- **Language**: TypeScript

---

## 📥 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in a `.env` file (see `.env.example` if available).

### Development

Run the API server:
```bash
npm run dev
```

---

## 🏗 Architecture

- **`src/index.ts`**: Entry point for API requests.
- **`src/services/`**: Core logic for key management and validation.
- **`src/controllers/`**: API handlers.
- **`src/routes/`**: Route definitions.
- **`src/models/`**: PostgreSQL interaction layer.
- **`src/middlewares/`**: Authentication and validation middlewares.

---

## 🔗 Integration

This service coordinates closely with:
- **`auth-user-service`**: For managing user context and linking keys to accounts.
- **All platform services**: To provide authentication headers and usage data.
