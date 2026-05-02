# Payr App

Payr is a mobile money transfer app that lets you send money to friends instantly, check your balance, and track your transaction history — all from your phone.

---

## Demo

<!-- Upload your demo video here -->

https://github.com/user-attachments/assets/your-video-id

---

## Features

- **Sign Up / Sign In** — Secure account creation and authentication
- **Dashboard** — View your current balance at a glance
- **Send Money** — Search users and transfer funds instantly
- **Transaction History** — Paginated log of sent and received transfers
- **Profile** — Update your account details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo (SDK 55) |
| Navigation | Expo Router |
| Language | TypeScript |
| State Management | Zustand + AsyncStorage |
| HTTP Client | Axios |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Expo Go app on your phone, or an iOS/Android simulator

### Setup

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

> Make sure your phone and computer are on the same Wi-Fi network.

### Connecting to the Backend

Update the API base URL in [lib/constants.ts](lib/constants.ts) to your machine's local IP:

```ts
export const BASE_URL = 'http://<your-local-ip>:4000/api/v1';
```

---

## Project Structure

```
app/
├── (auth)/
│   ├── sign-in.tsx       # Login screen
│   └── sign-up.tsx       # Registration screen
└── (tabs)/
    ├── index.tsx          # Home / balance dashboard
    ├── send.tsx           # Send money screen
    ├── history.tsx        # Transaction history
    └── profile.tsx        # User profile
store/
└── authStore.ts           # Auth state (Zustand + AsyncStorage)
lib/
├── api.ts                 # Axios instance + API calls
└── constants.ts           # Base URL and storage keys
types/                     # Shared TypeScript types
```
