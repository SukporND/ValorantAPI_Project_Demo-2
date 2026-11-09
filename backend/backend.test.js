const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const { createApp } = require("./backend");

async function startTestServer(app) {
  const server = app.listen(0);
  await once(server, "listening");
  return {
    server,
    baseUrl: `http://127.0.0.1:${server.address().port}`,
  };
}

test("API proxy validates resources and caches successful responses", async (context) => {
  let upstreamCalls = 0;
  const app = createApp({
    apiClient: {
      async get(url, options) {
        upstreamCalls += 1;
        assert.equal(url, "https://api.example.test/v1/agents");
        assert.deepEqual(options.params, { language: "en-US" });
        return { status: 200, data: { status: 200, data: [{ uuid: "agent-1" }] } };
      },
    },
    apiBase: "https://api.example.test/v1",
  });
  const { server, baseUrl } = await startTestServer(app);
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const firstResponse = await fetch(`${baseUrl}/api/agents`);
  assert.equal(firstResponse.status, 200);
  assert.equal(firstResponse.headers.get("x-cache"), "MISS");
  assert.deepEqual(await firstResponse.json(), { status: 200, data: [{ uuid: "agent-1" }] });

  const secondResponse = await fetch(`${baseUrl}/api/agents`);
  assert.equal(secondResponse.headers.get("x-cache"), "HIT");
  assert.equal(upstreamCalls, 1);

  const invalidResponse = await fetch(`${baseUrl}/api/not-a-resource`);
  assert.equal(invalidResponse.status, 404);
  assert.equal(upstreamCalls, 1);
});

test("API proxy reports invalid upstream payloads without caching them", async (context) => {
  let upstreamCalls = 0;
  const app = createApp({
    apiClient: {
      async get() {
        upstreamCalls += 1;
        return { status: 200, data: { status: 200, data: null } };
      },
    },
  });
  const { server, baseUrl } = await startTestServer(app);
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const firstResponse = await fetch(`${baseUrl}/api/maps`);
  const secondResponse = await fetch(`${baseUrl}/api/maps`);
  assert.equal(firstResponse.status, 502);
  assert.equal(secondResponse.status, 502);
  assert.equal(upstreamCalls, 2);
});

test("Vercel Express entry point exposes the health endpoint", async (context) => {
  const app = require("../index");
  const { server, baseUrl } = await startTestServer(app);
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const homeResponse = await fetch(baseUrl, { redirect: "manual" });
  assert.equal(homeResponse.status, 302);
  assert.equal(homeResponse.headers.get("location"), "/index.html");

  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});
