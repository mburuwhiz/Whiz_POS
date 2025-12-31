---

<p align="center">
  <img src="./assets/logo.png" width="160" />
</p>

<h1 align="center">✨ WHIZ POS ✨</h1>

<p align="center">
  <strong>A modern, offline-first, full-feature Point of Sale ecosystem for cafés, restaurants & retail.</strong><br/>
  Desktop POS • Back Office Web Dashboard • Mobile Ordering App
</p>

<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-18%2B-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img alt="Electron" src="https://img.shields.io/badge/Electron-App-2C2E3B?style=for-the-badge&logo=electron&logoColor=white"/>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Database-4DB33D?style=for-the-badge&logo=mongodb&logoColor=white"/>
</p>

---

## 🌟 Overview

**WHIZ POS** is a complete POS ecosystem built for real-world business workflows.
It is **fast**, **offline-ready**, and designed for cafés, restaurants, and retail shops.

### Version 5.2.3 Updates
- **Receipt Formatting**: Fixed receipt width issues by enforcing stricter printer margins and removing max-width constraints, ensuring correct padding on 80mm paper.

### Version 5.2.2 Updates
- **Receipt Formatting**: Optimized for 80mm paper (margins 3mm/4mm), combined header info, and cleaner layout.
- **Reports**: Daily Sales Report now itemizes sales by product (Qty/Total) instead of detailed credit breakdowns.
- **Sync**: Enhanced Sync page with Server Connection details and Connected Devices tracking.
- **Backup**: Added full system Backup & Restore functionality in Developer Settings.
- **Fixes**: Resolved issue with automatic printing on startup.

### System Components

| Component           | Tech                              | Purpose                                        |
| ------------------- | --------------------------------- | ---------------------------------------------- |
| **Desktop POS**     | Electron + React + TypeScript     | Offline-first cashier system, receipt printing |
| **Back Office Web** | Node.js + Express + MongoDB + EJS | Inventory, analytics, expenses, admin          |
| **Mobile App**      | Android (APK)                     | Remote order taking & syncing                  |

---

## 🚀 Core Features

### 🛒 Point of Sale

* Fast checkout
* Cash / M-Pesa / Credit payments
* Receipt printing

### 📦 Inventory

* Live stock tracking
* Low-stock alerts
* Bulk product updates

### 💸 Expenses

* Category-based expenses
* Daily / Monthly summaries

### 👥 Customer Credit

* Credit limits
* Partial payments
* Transaction history

### 📊 Reports

* Daily sales
* Closing summaries
* Product performance

### 🔌 Offline-First

* Works fully offline
* Auto-sync when internet returns

### 📱 Mobile Integration

* Remote order sending
* Local printing support

---

## 🧱 Architecture

```
 ┌───────────────────────┐
 │    Mobile App         │
 └───────────┬───────────┘
             │
             ▼
 ┌───────────────────────┐
 │ Desktop POS (Electron)│
 │ - Offline queueing    │
 └───────────┬───────────┘
             │ Sync API
             ▼
 ┌────────────────────────┐
 │ Back Office (Node.js)  │
 │ - MongoDB              │
 │ - API & Dashboard     │
 └────────────────────────┘
```

---

## ⚙️ Installation & Setup

## 📌 Prerequisites

* Node.js **v18+**
* MongoDB (Local or Atlas)

---

## 🌐 Back Office Website Setup

### Installation

```bash
git clone <repo>
cd back-office
npm install
```

### Environment Variables

Create `.env` from `.env.example`:

```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/whizpos

# Security
JWT_SECRET=your_secure_random_secret_key

# Downloads
DOWNLOAD_LINK_WINDOWS=https://example.com/windows-installer.exe
NEXT_PUBLIC_DOWNLOAD_LINK_APK=https://example.com/mobile-app.apk

# Admin (auto-seeded)
ADMIN_EMAIL=admin@whizpos.com
ADMIN_NAME=System Admin
ADMIN_PASSWORD=secure_password
NEXT_PUBLIC_ADMIN_PHONE=0740841168
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

App runs at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🖥️ Desktop POS Setup

```bash
cd desktop-pos
npm install
npm run dev
```

Runs Electron + React locally.

---

## 🔗 Connect POS to Back Office

1. Open **Desktop POS**
2. Go to **Manage → Devices & Connections**
3. Enter:

   * Back Office URL
   * API Key
4. Save and **Sync Local Data**

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Frontend Web**: EJS, Tailwind CSS (CDN)
* **Desktop**: Electron, React, TypeScript
* **Database**: MongoDB, Mongoose
* **Auth**: JWT, bcryptjs

---

## 📄 License

**Proprietary Software — Whiz Tech**

📞 Phone: **0740-841-168**
📧 Email: **[whiz.techke@gmail.com](mailto:whiz.techke@gmail.com)**

---

<p align="center">
  Made with ❤️ by <strong>Whiz Tech</strong>
</p>