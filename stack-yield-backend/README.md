# Stack Yield Backend

Short overview
- Listens for deposits on an Ethereum Gateway contract and records deposits in a database (Prisma).
- Bridges funds to the Stacks network and triggers stacking operations.
- Exposes a small HTTP API to query deposits and request withdrawals.
- Contains background jobs for bridging and yield processing.

Prerequisites
- Node.js 18+ and npm
- A running database and `DATABASE_URL` set in `.env`
- Ethereum RPC node URL (`ETH_NODE_URL`) and `GATEWAY_CONTRACT_ADDRESS`
- Stacks RPC (`STACKS_RPC_URL`) and a private key for signing Stacks txs (if you run stacking/withdraw flows)

Install and run

```bash
cd stack-yield-backend
npm install
cp .env.example .env # set your env vars
npm run dev
```

What the API provides
- `GET /deposits/:ethAddress` — returns deposits for the Ethereum address
- `POST /withdrawals` — request a withdrawal for a deposit; JSON body `{ "depositId": "<id>" }`

Testing with Postman

1) Start the backend (see Install and run).
2) Create a new Postman request collection and add these requests:

- Get deposits by Ethereum address
  - Method: `GET`
  - URL: `http://localhost:3000/deposits/{ethAddress}`
  - Replace `{ethAddress}` with an address you expect deposits for.

- Request withdrawal
  - Method: `POST`
  - URL: `http://localhost:3000/withdrawals`
  - Body: `raw` → `JSON`
    ```json
    { "depositId": "<deposit-id>" }
    ```
  - Expected success response (200):
    ```json
    { "status": "success", "data": { "status": "withdrawal_requested" } }
    ```
  - Possible error (400): missing `depositId` or invalid deposit

Notes
- Default server port is taken from `PORT` env var (fallback 3000). Update Postman URLs accordingly.
- Background listeners (Ethereum gateway) and job workers must be running for deposits to appear and bridging/stacking to happen.
- For local testing without a live blockchain, you can seed the database with deposit records.
