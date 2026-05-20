# Whiz POS Multi-Outlet Architecture

This document explains the transition from a standalone POS application to a decentralized, multi-outlet network architecture.

## Overview

Whiz POS can now operate in two distinct modes: **Server Mode** and **Outlet Mode**.

1.  **Main Server (Hub):**
    *   Acts as the master database for the entire network.
    *   Manages the **Central Warehouse** inventory (items not yet dispatched to outlets).
    *   Approves or rejects incoming connection requests from new Outlets via the Device Approval Gateway.
    *   Provides global analytics comparing performance across all Outlets.
    *   Broadcasts its presence on the local network (LAN/Wi-Fi) using **mDNS (Zero-Config Networking)**.

2.  **Checkout Outlet (Terminal):**
    *   Acts as an autonomous POS terminal.
    *   Automatically discovers the Main Server on the network without requiring the user to type in an IP address.
    *   Downloads a synchronized copy of the necessary inventory and pricing.
    *   **Offline-First:** Can continue processing sales, printing receipts, and scanning barcodes even if the Main Server or Wi-Fi goes offline.
    *   Uses a **Background Sync Queue** to upload offline transactions to the Server once the network is restored.

## Setup Wizard Redesign

The initial `BusinessRegistration` setup wizard has been completely redesigned into an ultra-modern, responsive interface.
*   **Mode Selection:** The very first step asks the user to define the terminal's role (`SERVER` or `OUTLET`).
*   **Dynamic Flow:** Outlets skip business registration steps (like Owner Name, Address, Tax) and instead immediately jump to discovering and connecting to the Server.

## Development & Local Testing

To facilitate developing and testing both a Server and an Outlet on a single physical development machine without causing SQLite database locking or state collision, we have introduced instance isolation.

### How it works:
The `electron.cjs` backend now intercepts the `APP_INSTANCE` environment variable. If present, it creates a dedicated sub-folder within the `userData` directory (e.g., `.../whiz-pos/instance-server/data/whizpos.db`).

### Testing Commands:

Open two separate terminal windows and run:

**Terminal 1 (Start the Server):**
```bash
npm run dev:server
```

**Terminal 2 (Start the Outlet):**
```bash
npm run dev:outlet
```

This will launch two entirely independent Electron applications sharing the same codebase but reading from/writing to completely different local SQLite databases.