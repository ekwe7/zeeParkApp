# ZeePark App — React Native Frontend

A React Native (Expo) mobile app for the ZeePark smart parking management system. Customers can register vehicles, find available spots, start/end parking sessions, and pay — all from their phone.

---

## Tech Stack

- **React Native** (Expo)
- **React Navigation** — stack + bottom tabs
- **Axios** — HTTP client
- **Expo SecureStore** — encrypted token storage
- **Expo Location** — GPS for map centering
- **React Native WebView** — payment checkout
- **Leaflet (via WebView)** — OpenStreetMap, no API key needed
- **@expo/vector-icons** — Ionicons

---

## Prerequisites

- Node.js 18+
- Expo Go app installed on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- ZeePark backend running and reachable on the same network

---

## Getting Started

### 1. Install dependencies

```bash
cd zeeParkApp
npm install
```

### 2. Configure the API URL

Create a `.env` file in the `zeeParkApp` folder:

```
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-ip>:8181
```

To find your computer's IP:
```bash
hostname -I
```

Use the first IP shown (e.g. `192.168.1.100`). Your phone and computer must be on the same WiFi network.

### 3. Start the app

```bash
npx expo start --offline --clear
```

Scan the QR code with Expo Go on your phone.

> **Note:** Use `--offline` if you don't have internet — it skips Expo's online version check.

---

## App Structure

```
zeeParkApp/
├── App.js                          # Entry point — all providers
├── .env                            # API URL (not committed)
├── .env.example                    # Template for .env
└── src/
    ├── api/
    │   └── client.js               # Axios instance with token interceptor
    ├── contexts/
    │   ├── AuthContext.js          # Auth state, login, logout, inactivity timer
    │   ├── ThemeContext.js         # Dark/light mode
    │   ├── NetworkContext.js       # Offline detection
    │   └── ParkingSessionContext.js # Active session timer and persistence
    ├── navigation/
    │   └── AppNavigator.js         # Role-based navigation (customer / admin)
    ├── screens/
    │   ├── auth/
    │   │   ├── LandingScreen.js    # Landing page (tap logo 7x for admin)
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   └── AdminLoginScreen.js # Hidden admin login
    │   ├── customer/
    │   │   ├── HomeScreen.js       # Map + stats + quick start
    │   │   ├── VehicleScreen.js    # Register and manage vehicles
    │   │   ├── ParkingScreen.js    # Start/end session, spot selection
    │   │   ├── PaymentScreen.js    # Payment method + WebView checkout
    │   │   ├── ProfileScreen.js    # User info + dark mode toggle + logout
    │   │   ├── TicketScreen.js     # Ticket display after session starts
    │   │   └── AllSpotsScreen.js   # Full list of available spots
    │   └── admin/
    │       ├── AdminDashboardScreen.js
    │       ├── AdminZonesScreen.js
    │       ├── AdminSpotsScreen.js
    │       └── AdminRevenueScreen.js
    ├── components/
    │   ├── MapView.js              # OpenStreetMap via Leaflet in WebView
    │   ├── SkeletonLoader.js       # Loading placeholder
    │   ├── OfflineBanner.js        # Shows when no internet
    │   └── SpotMarker.js           # Spot status indicator
    ├── theme/
    │   └── index.js                # Light and dark theme tokens
    └── utils/
        └── sessionStorage.js       # SecureStore helpers for parking session
```

---

## Features

### Customer
- Register and login with username/password
- Add and delete vehicles (CAR, SUV, EV, BICYCLE)
- View available parking spots on a live map
- Select a spot and start a parking session
- Live session timer with running cost display
- Session persists across logout — timer keeps running
- View and download parking ticket
- Pay via Flutterwave (card/bank transfer) or PayPal
- View payment history and recent activity
- Dark/light mode toggle

### Admin (hidden login)
- Create and delete parking zones
- Create spot categories (NORMAL, VIP, EV, STAFF, EXHIBITION)
- Create parking spots
- View revenue reports by date range

---

## Authentication

- Tokens stored in **Expo SecureStore** (encrypted, device-level)
- Auto logout after **2 minutes of inactivity**
- Auto logout when app is **minimized/backgrounded**
- Active parking session survives logout — resumes when user logs back in
- Different users on the same device see only their own data

---

## Navigation Structure

```
AuthStack (not logged in)
├── LandingScreen
├── LoginScreen
├── RegisterScreen
└── AdminLoginScreen (hidden)

CustomerStack (logged in as CUSTOMER)
├── Tabs
│   ├── Home
│   ├── Vehicles
│   ├── Tickets (Parking)
│   └── Profile
├── Payment (modal)
├── Ticket (modal)
└── AllSpots (modal)

AdminStack (logged in as ADMIN)
└── Tabs
    ├── Dashboard
    ├── Zones
    ├── Spots
    └── Revenue
```

---

## Payment Flow

1. User ends parking session
2. Selects payment method (Flutterwave or PayPal)
3. App calls backend → receives checkout URL
4. WebView opens Flutterwave's hosted payment page
5. User completes payment
6. Flutterwave redirects to `zeepark://payment/success?transaction_id=...`
7. App catches redirect, calls backend to verify
8. Payment confirmed — user returns to Home.