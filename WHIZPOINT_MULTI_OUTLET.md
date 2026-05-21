# Whiz Point POS Multi-Outlet Implementation

## Core Deliverables Met:
1. **Network Discovery**: Server Hub broadcasts on 0.0.0.0, Outlet Terminal scans and discovers.
2. **Zero-Config Handshake**: Registration Request -> Server Approval -> Full Sync.
3. **Management Control**: Server Hub has exclusive rights to Inventory and Staff management.
4. **Resilient Sales**: Outlet Terminal is offline-first with background sync every 30s.
5. **Centralized Backups**: Automated database collection from outlets to Server Documents.
6. **Branding**: support@whizpoint.app | https://pos.whizpoint.app

## Technical Specifications:
- **Server Port**: 3000
- **Outlet Port**: 3001
- **Sync Protocol**: RESTful API over LAN.
- **Discovery**: mDNS / Bonjour.
