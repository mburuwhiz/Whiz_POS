# Whiz Point POS Multi-Outlet Architecture

## Summary
The system has been re-architected into a decentralized, hub-and-spoke network to support multiple business outlets with centralized management.

## 1. Zero-Config Networking
- **Discovery**: Server broadcasts its presence on UDP 5353. Outlets automatically scan the network and display available servers.
- **Connectivity**: Binds to `0.0.0.0` to ensure cross-interface visibility (Wi-Fi/LAN).

## 2. Secure Handshake Lifecycle
1. **Outlet Registration**: Outlet sends a request with its name and a unique device ID.
2. **Waiting State**: Outlet provides clear UI feedback while waiting for authorization.
3. **Server Approval**: Admin reviews and approves terminals via the "Manage Outlets" gateway.
4. **Data Provisioning**: Upon approval, the Outlet automatically performs a full sync of Products, Users, and Policies.

## 3. Server Admin Hub (The Brain)
- **Centralized Inventory**: Exclusive control over product creation and pricing.
- **Staff Management**: Centralized user profiles and PIN security.
- **Outlet Monitoring**: Real-time dashboard showing:
    - Connection Status
    - Last Sync Timestamp
    - Pending Sales Queue Count
    - Active Shift ID
- **Orchestrated Backups**: Pulls local DBs from outlets every 2 hours into organized Documents folders.

## 4. Outlet Terminal (The Muscle)
- **Offline-First Sales**: Continuous operation without server connectivity.
- **Local Ledger**: Queues transactions for background synchronization.
- **Auto-Sync Engine**: Background service pushes sales every 30 seconds.
- **Fraud Prevention**: Management features (Inventory/Users) are strictly locked on the Outlet side.

## 5. Compliance & Branding
- **Identity**: Whiz Point
- **Support**: support@whizpoint.app
- **Website**: https://pos.whizpoint.app
