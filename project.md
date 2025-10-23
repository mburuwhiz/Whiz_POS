
---

````markdown
# 🧠 WHIZ POS — Intelligent Point of Sale Ecosystem  
*Smart, Secure & Seamlessly Connected for Modern Businesses*

---

![Whiz POS Banner](docs/images/whizpos_banner.png)

<p align="center">
  <a href="https://github.com/whizpos/whizpos/actions/workflows/build.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/whizpos/whizpos/build.yml?style=for-the-badge&label=Build&logo=github" alt="Build Status"/>
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge&logo=semver" alt="Version"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
  </a>
</p>

---

## 📑 Table of Contents

1. [🚀 Overview](#-overview)  
2. [🧩 System Architecture](#-system-architecture)  
3. [🗂️ Repository Structure](#️-repository-structure)  
4. [⚙️ Technology Stack](#️-technology-stack)  
5. [🔐 Environment Variables](#-environment-variables)  
6. [🧠 Business Registration Flow](#-business-registration-flow-super-admin-controlled)  
7. [🔗 Device Linking](#-device-linking-qr-or-manual)  
8. [🧾 Core API Endpoints](#-core-api-endpoints)  
9. [🗃️ Database Schemas](#️-database-schemas)  
10. [🔄 Offline-First Sync Algorithm](#-offline-first-sync-algorithm)  
11. [🖨️ Printing Pipeline](#️-printing-pipeline)  
12. [💾 Backups & Recovery](#-backups--recovery)  
13. [🔧 CI/CD Pipeline](#-cicd-github-actions)  
14. [📊 Monitoring & Logging](#-monitoring--logging)  
15. [🛡️ Security Checklist](#️-security-checklist)  
16. [🧰 Developer Quickstart](#-developer-quickstart)  
17. [📚 Documentation Deliverables](#-documentation-deliverables)  
18. [🏁 Summary](#-summary)

---

## 🚀 Overview

**Whiz POS** is a next-generation Point of Sale ecosystem designed for cafés, shops, and service businesses.  
It offers a **fully modular architecture** that integrates cloud management, offline-first functionality, multi-device linking, and powerful analytics — all built with **TypeScript, SvelteKit, and NestJS** for performance and reliability.

---

## 🧩 System Architecture

### 🧱 Visual Overview

```mermaid
flowchart TD
    A[🌐 Super Admin Portal (SvelteKit)] -->|Registers Businesses + Issues API Keys| B[(☁️ Whiz Cloud Services)]
    B -->|Sync, Auth, Analytics| C[🏢 Business Local Server (NestJS)]
    C -->|Data Sync| B
    C --> D[💻 Desktop POS (Electron)]
    C --> E[📱 Mobile POS (Capacitor)]
    D -->|Prints & Sends Receipts| F[🖨️ Local Printer]
    E -->|Sync Transactions| C
````

---

## 🗂️ Repository Structure

```
whiz-pos/
│
├── admin-web/          # Super Admin Portal (SvelteKit)
├── portal/             # Cloud microservices (NestJS)
├── server/             # Local business server (NestJS)
├── desktop/            # Electron + Svelte POS app
├── mobile/             # Capacitor + Svelte POS app
├── shared/             # Shared TypeScript models and validators
├── infra/              # Docker, Kubernetes, Terraform
├── docs/               # Documentation (this README + diagrams)
└── README.md
```

---

## ⚙️ Technology Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Language       | TypeScript (Node.js v18+)     |
| Frontend       | SvelteKit                     |
| Backend        | NestJS                        |
| Database       | MongoDB (Local + Atlas)       |
| Cache          | Redis                         |
| Object Storage | MinIO / S3                    |
| Desktop        | Electron                      |
| Mobile         | Capacitor                     |
| Auth           | JWT + API Keys + Optional 2FA |
| Printing       | node-printer / escpos         |
| CI/CD          | GitHub Actions                |

---

## 🔐 Environment Variables

> URLs (like local host, production, and cloud) are dynamically read from the `.env` files.

Each platform uses its own `.env` file:

* `/admin-web/.env`
* `/portal/.env`
* `/server/.env`
* `/desktop/.env`
* `/mobile/.env`

📘 *See the full environment examples in* [`docs/env-samples.md`](docs/env-samples.md)

---

## 🧠 Business Registration Flow (Super Admin Controlled)

1. Super Admin creates a **Business record** in the Admin Portal.
2. Registers a **Business Admin** with their credentials.
3. System generates and stores an **inactive API key**.
4. API key is shared securely with the registered admin (email/dashboard).
5. The local server installation verifies the key and activates the business.
6. Once verified, devices can register and sync data.

✅ No unregistered business can operate without a valid Super Admin–issued API key.

---

## 🔗 Device Linking (QR or Manual)

| Method             | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| **QR**             | Scan code with `{apiKey, nonce, expiry}` for automatic linking. |
| **Manual**         | Admin manually inputs key.                                      |
| **Fingerprinting** | SHA-256 hardware+host hash for unique identification.           |
| **Device Token**   | Returned from cloud to authenticate further syncs.              |

---

## 🧾 Core API Endpoints

**Authentication**

```http
POST /auth/login
POST /auth/pin-login
```

**Business**

```http
POST /portal/business
POST /portal/business/:id/issue-api-key
```

**Device Linking**

```http
POST /device/link
```

**Transactions**

```http
POST /transactions
GET /transactions/:id
```

**Sync**

```http
POST /sync/push
GET /sync/pull
```

**Printing**

```http
POST /print/receipt
```

---

## 🗃️ Database Schemas

See [`docs/schema.md`](docs/schema.md) for full JSON structures.

Example (Business Schema):

```json
{
  "_id": "bzn_001",
  "name": "Sunrise Café",
  "apiKeys": [{ "key": "WHIZ-0045893176", "active": true }],
  "adminUserId": "user_admin_01",
  "config": { "currency": "KES", "taxRate": 16 }
}
```

---

## 🔄 Offline-First Sync Algorithm

1. Local server stores unsynced data.
2. Periodically pushes updates to the cloud portal.
3. Cloud validates, responds, and returns sync acknowledgements.
4. Failed batches retry automatically.
5. All syncs are **idempotent and conflict-safe**.

---

## 🖨️ Printing Pipeline

| Mode          | Description                |
| ------------- | -------------------------- |
| **USB**       | via `node-printer`         |
| **Network**   | IP-based direct connection |
| **Bluetooth** | via Capacitor or OS driver |

Printing Flow:

1. App sends `/print/receipt`.
2. Server fetches transaction & template.
3. Print driver executes job.
4. Logs success or fallback to PDF/email.

---

## 💾 Backups & Recovery

| Tier         | Frequency                 | Storage             |
| ------------ | ------------------------- | ------------------- |
| Local Server | Every 6 hours             | `/var/whiz/backups` |
| Cloud        | Weekly (30-day retention) | MongoDB Atlas       |
| Encryption   | AES-256                   | Enabled by default  |

Restore example:

```bash
openssl enc -aes-256-cbc -d -in backup.enc -out backup.tar.gz
mongorestore --archive=backup.tar.gz
```

---

## 🔧 CI/CD (GitHub Actions)

| Job                 | Description                        |
| ------------------- | ---------------------------------- |
| `build-server.yml`  | Builds and tests NestJS server     |
| `build-desktop.yml` | Builds Electron app (.exe)         |
| `build-mobile.yml`  | Builds Android APK                 |
| `deploy-portal.yml` | Deploys cloud portal to Render/AWS |

---

## 📊 Monitoring & Logging

* **Logger:** Winston / Pino
* **Crash Reports:** Sentry
* **Metrics:** Prometheus + Grafana
* **Alerts:** Email/Slack

---

## 🛡️ Security Checklist

* 🔒 Argon2/Bcrypt password hashing
* 🔑 Rotating API keys
* 🧱 HTTPS (TLS enforced)
* 🕵️‍♂️ Device fingerprint verification
* 🧮 Rate limits + lockout policies
* 🧰 AES-256 data encryption
* 🗃️ Audit logging

---

## 🧰 Developer Quickstart

```bash
# Clone the repo
git clone https://github.com/yourname/whiz-pos.git
cd whiz-pos

# Install dependencies
pnpm install

# Setup environment files
cp .env.example .env

# Run the local server
cd server
pnpm run start:dev
```

---

## 📚 Documentation Deliverables

| File                     | Description                 |
| ------------------------ | --------------------------- |
| `architecture.md`        | Full structure (this file)  |
| `api-spec.md`            | OpenAPI reference           |
| `setup-guide.md`         | Local setup & linking guide |
| `backup-restore.md`      | Backup/restore process      |
| `printer-integration.md` | Supported printers          |
| `security-runbook.md`    | Security response guide     |
| `ci-cd.md`               | Deployment pipelines        |

---

## 🏁 Summary

**Whiz POS** delivers an **offline-first**, **secure**, and **multi-device POS ecosystem**
built for scalability, reliability, and full business autonomy — powered by modern open-source technology.

💡 *Smart, Connected, and Built for Scale.*

---

> 🖼️ **Optional next step:**
> Add your actual architecture image under `docs/images/whizpos_banner.png`
> and the system diagram `docs/images/architecture.png` to replace the placeholder above.

```

---

THE END
```
