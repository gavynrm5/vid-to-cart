import axios from "axios";
import cron from "node-cron";
import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com";
const VERSION = process.env.GHL_VERSION || "2021-07-28";
const LOCATION_TOKEN = process.env.GHL_LOCATION_API_KEY;
const AGENCY_TOKEN = process.env.GHL_AGENCY_API_KEY;
const API_TOKEN = AGENCY_TOKEN || LOCATION_TOKEN;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;
const SELF_PING_URL = process.env.SELF_PING_URL;
const SELF_PING_CRON = process.env.SELF_PING_CRON || "*/10 * * * *";

if (!API_TOKEN) {
  console.warn("⚠️ Missing API token. Set GHL_AGENCY_API_KEY (preferred) or GHL_LOCATION_API_KEY.");
}

function buildHeaders() {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    Version: VERSION,
    "Content-Type": "application/json",
  };
}

function parseName(fullName = "") {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || "",
    lastName: rest.join(" ") || "",
  };
}

function dedupeLocationIds(locationIds = []) {
  return [...new Set(locationIds.map((id) => String(id || "").trim()).filter(Boolean))];
}

async function listUsersByEmail(email) {
  const response = await axios.get(`${BASE_URL}/users/search`, {
    headers: buildHeaders(),
    params: { email, limit: 100 },
  });
  return response.data?.users || [];
}

async function createUser({ email, firstName, lastName }) {
  const response = await axios.post(
    `${BASE_URL}/users/`,
    {
      email,
      firstName,
      lastName,
      type: "account",
      role: "user",
    },
    { headers: buildHeaders() },
  );

  return response.data?.user || response.data;
}

async function attachUserToLocation({ userId, locationId }) {
  await axios.post(
    `${BASE_URL}/users/${userId}/locations/${locationId}`,
    {},
    { headers: buildHeaders() },
  );
}

async function ensureUserOnLocations({ fullName, email, locationIds }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("email is required");
  }

  const requestedLocations = dedupeLocationIds(locationIds);
  if (requestedLocations.length === 0) {
    throw new Error("At least one subaccountId is required");
  }

  const { firstName, lastName } = parseName(fullName);
  const users = await listUsersByEmail(normalizedEmail);
  let user = users.find((u) => (u.email || "").toLowerCase() === normalizedEmail);

  if (!user) {
    user = await createUser({ email: normalizedEmail, firstName, lastName });
  }

  const existingLocationIds = new Set((user.locations || []).map((l) => String(l.id || l.locationId)));
  const results = [];

  for (const locationId of requestedLocations) {
    if (existingLocationIds.has(locationId)) {
      results.push({ locationId, status: "already_exists" });
      continue;
    }

    await attachUserToLocation({ userId: user.id, locationId });
    results.push({ locationId, status: "added" });
  }

  return {
    userId: user.id,
    email: normalizedEmail,
    requestedLocations,
    results,
  };
}

function verifySecret(req, res, next) {
  if (!INTERNAL_SECRET) return next();
  const incoming = req.header("x-internal-secret");
  if (incoming !== INTERNAL_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/workflow/add-user-to-subaccounts", verifySecret, async (req, res) => {
  const { userName, userEmail, subaccountId, subaccountIds } = req.body || {};

  const locationIds = Array.isArray(subaccountIds)
    ? subaccountIds
    : String(subaccountId || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

  try {
    const output = await ensureUserOnLocations({
      fullName: userName,
      email: userEmail,
      locationIds,
    });

    return res.json({ success: true, ...output });
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error("❌ Failed workflow action:", details);
    return res.status(400).json({ success: false, error: details });
  }
});

if (SELF_PING_URL) {
  cron.schedule(SELF_PING_CRON, async () => {
    try {
      await axios.get(SELF_PING_URL, { timeout: 10000 });
      console.log("💓 Keep-alive ping sent");
    } catch (error) {
      console.warn("⚠️ Keep-alive ping failed:", error.message);
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 GHL user assignment app listening on ${PORT}`);
});
