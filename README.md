# One-Time Token Service

A single-use, expiring token service backed by Redis. Tokens are issued with a TTL and consumed atomically so concurrent requests cannot redeem the same token more than once.

## Setup

```bash
npm install
cp .env.example .env
# Ensure Redis is running and REDIS_URL in .env points to it
```

## Implementation

- `issueToken(payload, ttlSeconds)` generates a cryptographically random 32-character hexadecimal ID, serializes the payload as JSON, and stores it with Redis `SET ... EX ... NX`.
- `consumeToken(tokenId)` uses Redis `GETDEL` to atomically retrieve and delete the token. It returns the payload once, then reports an invalid token for subsequent attempts or expired tokens.
- `test.js` runs five concurrent consumers and asserts exactly one succeeds.

## Run

```bash
npm test
```

Expected result (with Redis running):

```
winners: 1
PASS: token was single-use.
```
