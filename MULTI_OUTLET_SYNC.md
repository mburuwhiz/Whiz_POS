# Synchronization & Handshake Documentation

## Handshake Flow
1. **Outlet Discovery**: Uses `bonjour-service` to scan for `whizpos` type services on the network.
2. **Registration**: Outlet sends a POST to `/api/outlets/register` with `outletName` and a generated `deviceId`.
3. **Approval Gateway**: Server Hub stores this in `pending-outlets.json`. Administrator approves via UI.
4. **Activation**: Server moves record to `approved-outlets.json`. Outlet polls `/api/outlets/status/:deviceId` until it receives `approved`.
5. **Initial Sync**: Outlet performs a GET `/api/sync/full-state` to download all master data.

## Periodic Data Sync
- **Frequency**: Every 30 seconds.
- **Direction**: Bi-directional (Push sales, Pull updates).
- **Metadata**: Every sync includes Outlet metrics (Pending Sales, Shift ID).

## Backup Pulling
- **Frequency**: Every 2 hours.
- **Storage**: `Documents/WhizPOS/{OutletName}/backup_{timestamp}.wpos`.
