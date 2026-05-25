# WhizPOS Architecture & Logic Refactor

This document outlines the decentralized, offline-first multi-outlet architecture.

## 1. Server: Central Management (The Hub)
The Server is the single "Source of Truth" for Intelligence, Management, and Reporting.
- **No Selling Interface:** The Server instance does NOT have the POS interface. When logged in, Admin and Manager roles are routed directly to the `Server Hub` for managing outlets, configuring the Master Catalog, viewing Aggregated Reports, and adjusting stock.
- **Master Data:** Users, Products, Categories, and Policies are exclusively created and updated here.
- **Login Restrictions:** Only `admin` and `manager` roles can log in to a Server instance. Cashiers will be rejected.
- **Health Monitoring:** The Server Hub displays active outlets, connection statuses, shift IDs, and pending offline sales counts in real-time.

## 2. Outlet: Dedicated Operations (The Spokes)
Outlets act as remote terminals optimized strictly for high-speed sales.
- **Setup Handshake (The Gatekeeper):** New Outlets must register via mDNS zero-config discovery. They remain locked on a "Waiting for Approval" screen until an Admin approves them on the Server Hub. This waiting state persists across reboots.
- **Zero Local Configuration:** Upon approval, the Outlet automatically pulls the global user list, PINs, and inventory from the Server. Local PIN creation is skipped entirely.
- **Offline Resilience:** Outlets function completely offline, storing sales in a local ledger marked as `synced: false`. A background queue pushes these updates sequentially back to the Server when the connection is restored.
- **Restricted Access:** Outlets cannot alter user profiles, pricing, or system configurations.

## 3. Inventory & Auditing
- **Master Store Intelligence:** Any stock adjustments, transfers, or write-offs reflect everywhere instantly.
- **Conflict Management:** Sales processed offline with outdated pricing logic push to the server and trigger discrepancies logging.
- **Automated Backups:** The Server operates an automated daemon pulling database replicas from all authorized outlets for local document storage.

