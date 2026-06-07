# 🛺 TricyCall

Lokal na tricycle booking app para sa probinsya — panimulang UI sa React + TypeScript.

---

## 🚀 Paano I-setup (VS Code)

### 1. I-install ang dependencies
```bash
npm install
```

### 2. I-run ang development server
```bash
npm run dev
```

Buksan ang browser sa `http://localhost:5173`

---

## 📱 Mga Screen

| Screen | Paglalarawan |
|--------|-------------|
| `SplashScreen` | Loading screen na may animated logo |
| `LoginScreen` | Role selector (Pasahero / Driver) + form |
| `HomeScreen` | Main screen ng pasahero — mapa, search, recent places |
| `BookingScreen` | Piliin ang destinasyon, makita ang estimated fare |
| `DriverSearchScreen` | Naghahanap ng driver — pulse animation, tapos driver info |
| `DriverModeScreen` | Para sa tricycle driver — toggle online/offline, tanggapin ang biyahe |

---

## 🗂️ Project Structure

```
src/
├── App.tsx                  # Root — screen navigation at state
├── main.tsx                 # Entry point
├── index.css                # Global CSS variables at reset
└── pages/
    ├── SplashScreen.tsx/.css.module
    ├── LoginScreen.tsx/.css.module
    ├── HomeScreen.tsx/.css.module
    ├── BookingScreen.tsx/.css.module
    ├── DriverSearchScreen.tsx/.css.module
    └── DriverModeScreen.tsx/.css.module
```

---

## 🛠️ Mga Susunod na I-develop (TODO)

- [ ] Real map integration (Leaflet.js o Google Maps)
- [ ] Backend API (Node.js / Firebase)
- [ ] Totoong authentication (OTP via SMS)
- [ ] Real-time location tracking (WebSockets)
- [ ] Push notifications
- [ ] Payment integration (GCash, cash)
- [ ] Driver registration with verification
- [ ] Rating system
- [ ] Ride history

---

## 🎨 Design

- **Colors:** Golden amber (#F59E0B) + Deep teal (#0F766E)
- **Fonts:** Baloo 2 (display) + Nunito (body)
- **Vibe:** Mainit, masaya, lokal — para sa probinsya ng Pilipinas 🇵🇭
