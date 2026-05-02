# Payr — Backend API

A RESTful backend for the Payr money transfer app. Built with **Bun**, **Express 5**, **MongoDB** (Mongoose), and **TypeScript**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Language | TypeScript |

---

## Project Structure

```
src/
├── index.ts          # Server entry point, middleware setup
├── config.ts         # Environment variable config
├── db.ts             # MongoDB connection + all Mongoose schemas
├── middleware.ts     # JWT auth middleware
└── routes/
    ├── index.ts      # Route aggregator (/api/v1)
    ├── user.ts       # User auth + profile routes
    └── account.ts    # Balance, transfer, history routes
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- MongoDB instance (local or Atlas)

### Setup

```bash
# Install dependencies
bun install

# Create environment file
cp .env.example .env
# Edit .env with your values

# Start dev server (hot reload)
bun run dev

# Start production server
bun run start
```

---

## Environment Variables

Create a `.env` file in the root:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/payr_db
JWT_SECRET=your_super_secret_jwt_key
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Server port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | No | `your_super_secret_jwt_key_change_in_production` | JWT signing secret |

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Health Check

```
GET /health
```
Returns `{ status: "ok", timestamp }`.

---

### User Routes

#### Sign Up
```
POST /user/signup
```
**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Response:** `201`
```json
{
  "message": "User created successfully",
  "token": "<jwt>",
  "user": { "_id", "username", "email", "firstName", "lastName" }
}
```
> Creates an account with a random starting balance between 1,000–10,000.

---

#### Sign In
```
POST /user/signin
```
**Body:**
```json
{
  "username": "johndoe",
  "password": "secret123"
}
```
**Response:** `200`
```json
{
  "message": "Signin successful",
  "token": "<jwt>",
  "user": { "_id", "username", "email", "firstName", "lastName" }
}
```

---

#### Update Profile `Protected`
```
PUT /user/
```
**Headers:** `Authorization: Bearer <token>`

**Body** (all fields optional):
```json
{
  "email": "newemail@example.com",
  "password": "newpassword",
  "firstName": "Jane",
  "lastName": "Doe"
}
```
**Response:** `200`
```json
{
  "message": "User updated successfully",
  "user": { "_id", "username", "email", "firstName", "lastName" }
}
```

---

#### Search Users
```
GET /user/bulk?filter=<string>
```
**Query Params:** `filter` — searches firstName, lastName, username (case-insensitive)

**Response:** `200`
```json
{
  "users": [
    { "_id", "username", "firstName", "lastName", "email" }
  ]
}
```
> Returns up to 20 results.

---

### Account Routes

#### Get Balance `Protected`
```
GET /account/balance
```
**Headers:** `Authorization: Bearer <token>`

**Response:** `200`
```json
{ "balance": 5400 }
```

---

#### Transfer Money `Protected`
```
POST /account/transfer
```
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "to": "<recipientUserId>",
  "amount": 500,
  "note": "Dinner split"
}
```
**Response:** `200`
```json
{
  "message": "Transfer successful",
  "newBalance": 4900,
  "transferredTo": "janedoe",
  "amount": 500,
  "transactionId": "<id>"
}
```
> Transfer is atomic — uses a MongoDB session to update both accounts simultaneously. Fails entirely if either update fails.

**Validation rules:**
- Cannot transfer to yourself
- Amount must be positive
- Sender must have sufficient balance
- Recipient must exist and have an account

---

#### Transaction History `Protected`
```
GET /account/history?page=1&limit=10&type=all
```
**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param | Default | Options |
|---|---|---|
| `page` | `1` | Any positive integer |
| `limit` | `10` | Max `50` |
| `type` | `all` | `sent`, `received`, `all` |

**Response:** `200`
```json
{
  "transactions": [
    {
      "id": "<id>",
      "type": "sent",
      "amount": 500,
      "note": "Dinner split",
      "status": "success",
      "createdAt": "2025-01-01T12:00:00Z",
      "counterparty": { "firstName": "Jane", "lastName": "Doe", "username": "janedoe" }
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Authentication

All protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on signup/signin and expire after **7 days**.

---

## Error Responses

All errors follow a consistent shape:

```json
{ "message": "Human-readable description" }
```

Validation errors include an `errors` array:

```json
{
  "message": "Validation failed",
  "errors": [{ "path": ["field"], "message": "issue" }]
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error / business rule violation |
| `401` | Missing or invalid token |
| `404` | Resource not found |
| `409` | Conflict (duplicate username/email) |
| `500` | Internal server error |

---

## Database Models

### User
| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique, lowercase |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed |
| `firstName` | String | — |
| `lastName` | String | — |

### Account
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User, unique |
| `balance` | Number | Default: 0 |

### Transaction
| Field | Type | Notes |
|---|---|---|
| `senderId` | ObjectId | Ref: User |
| `receiverId` | ObjectId | Ref: User |
| `amount` | Number | — |
| `note` | String | Default: "" |
| `status` | String | `"success"` or `"failed"` |
