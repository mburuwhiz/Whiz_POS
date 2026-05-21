# Whiz Point POS - Multi-Outlet Edition

A decentralized, offline-first point-of-sale network designed for scalability and resilience.

## Features
- **Zero-Config Networking**: Automatic discovery of Server Hubs using mDNS.
- **Server Hub (Management)**: Centralized inventory, staff, analytics, and backup orchestration.
- **Outlet Terminal (Sales)**: High-performance sales terminal with local ledger and background sync.
- **Offline Resilience**: Full POS functionality without a persistent network connection.
- **Automated Backups**: Centralized database archiving in standard `.wpos` format.

## Connectivity
- **Server Broadcast**: UDP 5353 (mDNS).
- **Handshake**: Registration request → Server Approval → Full Data Sync.
- **Background Sync**: Automatic push/pull every 30 seconds.

## Compliance & Support
- **Support Email**: support@whizpoint.app
- **Website**: https://pos.whizpoint.app
- **Made by**: Whiz Point
