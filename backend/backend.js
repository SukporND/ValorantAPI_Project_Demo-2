const path = require("path");
const express = require("express");
const axios = require("axios");

const PORT = Number(process.env.PORT) || 3000;
const VALORANT_API_BASE = "https://valorant-api.com/v1";
const CACHE_TTL_MS = 5 * 60 * 1000;
const ALLOWED_RESOURCES = new Set([
  "agents",
  "weapons",
  "maps",
  "contenttiers",
]);
const defaultFrontendDirectory = path.resolve(
  __dirname,
  "..",
  "public"
);

function createApiApp({
  apiClient = axios,
  apiBase = VALORANT_API_BASE,
} = {}) {
  const app = express();
  const resourceCache = new Map();

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/:resource", async (req, res) => {
    const { resource } = req.params;

    if (!ALLOWED_RESOURCES.has(resource)) {
      return res.status(404).json({ error: "Valorant resource not found." });
    }

    const cached = resourceCache.get(resource);
    if (cached && cached.expiresAt > Date.now()) {
      return res.set("X-Cache", "HIT").json(cached.data);
    }

    try {
      const response = await apiClient.get(`${apiBase}/${resource}`, {
        params: { language: "en-US" },
        timeout: 10000,
      });

      if (response.status !== 200 || !Array.isArray(response.data?.data)) {
        throw new Error("Valorant API returned an invalid response.");
      }

      resourceCache.set(resource, {
        data: response.data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return res.set("X-Cache", "MISS").json(response.data);
    } catch (error) {
      console.error(`Valorant API request failed for "${resource}":`, error.message);
      return res.status(502).json({
        error: `Could not load Valorant ${resource} data.`,
      });
    }
  });

  return app;
}

function createApp({
  apiClient = axios,
  apiBase = VALORANT_API_BASE,
  frontendDirectory = defaultFrontendDirectory,
} = {}) {
  const app = createApiApp({ apiClient, apiBase });
  app.use(express.static(frontendDirectory));

  app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
    res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
      if (error) next(error);
    });
  });
  return app;
}

const apiApp = createApiApp();
const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
module.exports.apiApp = apiApp;
module.exports.createApiApp = createApiApp;