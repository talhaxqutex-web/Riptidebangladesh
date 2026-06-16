# Security Specification

## Data Invariants
1. Products can only be created, updated, or deleted by admins.
2. Orders can be created by authenticated users but only for themselves (`request.auth.uid == data.userId`).
3. Users can only read their own orders and profile (admins can read all).
4. Order status can only be modified by admins (e.g. from pending to shipped).
5. All IDs must be valid.

## Dirty Dozen Payloads
(Skipping explicit payload generation since tests without emulator cannot execute, but rules will incorporate these protections)
