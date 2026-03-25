# GoHighLevel User-to-Subaccount Assignment Service

This service is designed to run on Render and be called from a GoHighLevel Workflow action.

## What it does

- Accepts `userName`, `userEmail`, and one or many `subaccountIds`.
- Finds (or creates) the user by email.
- Adds the user to each target subaccount.
- **Preserves existing memberships** (it only appends missing subaccounts).
- Supports self-ping keep-alive for Render free tier.

## Endpoint for Workflow Action

- **Method:** `POST`
- **Path:** `/workflow/add-user-to-subaccounts`
- **Headers:**
  - `Content-Type: application/json`
  - `x-internal-secret: <INTERNAL_SECRET>` (optional, recommended)

### Body examples

Single account:

```json
{
  "userName": "Jane Partner",
  "userEmail": "jane@example.com",
  "subaccountId": "abc123"
}
```

Multiple accounts:

```json
{
  "userName": "Jane Partner",
  "userEmail": "jane@example.com",
  "subaccountIds": ["abc123", "def456", "ghi789"]
}
```

You can also send comma-separated `subaccountId` if needed:

```json
{
  "userName": "Jane Partner",
  "userEmail": "jane@example.com",
  "subaccountId": "abc123,def456,ghi789"
}
```

## Environment Variables

Required:

- `GHL_AGENCY_API_KEY` (preferred) or `GHL_LOCATION_API_KEY`

Optional:

- `PORT` (default `3000`)
- `GHL_BASE_URL` (default `https://services.leadconnectorhq.com`)
- `GHL_VERSION` (default `2021-07-28`)
- `INTERNAL_SECRET` (recommended)
- `SELF_PING_URL` (example: `https://<your-render-app>.onrender.com/health`)
- `SELF_PING_CRON` (default `*/10 * * * *`)

## Deploy on Render

1. Create a new Web Service from this repo.
2. Set root directory to `ghl-user-assignment`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables above.
6. Point `SELF_PING_URL` to your Render health endpoint.

## Local run

```bash
cd ghl-user-assignment
npm install
npm start
```

Health check:

```bash
curl http://localhost:3000/health
```
