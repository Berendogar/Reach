const test = require("node:test");
const assert = require("node:assert/strict");
const { start } = require("../server");

function listen() {
  return new Promise((resolve) => {
    const server = start(0);
    server.on("listening", () => resolve(server));
  });
}

function check(port, host) {
  return fetch(`http://127.0.0.1:${port}/`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ host })
  });
}

test("health check", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    assert.deepEqual(await response.json(), { ok: true });
  } finally {
    server.close();
  }
});

test("shell punctuation does not read the desk note", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const response = await check(port, "127.0.0.1; cat desk.txt");
    const body = await response.text();
    assert.equal(response.status, 400);
    assert.equal(body.includes("REACH-7741"), false);
    assert.match(body, /hostname or an IP address/);
  } finally {
    server.close();
  }
});

test("localhost ping still comes back up", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const response = await check(port, "127.0.0.1");
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, />up</);
    assert.match(body, /1 received/);
    assert.equal(body.includes("REACH-7741"), false);
  } finally {
    server.close();
  }
});

test("an IPv6 address is accepted", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const response = await check(port, "::1");
    assert.equal(response.status, 200);
  } finally {
    server.close();
  }
});

test("an unknown name comes back down", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const response = await check(port, "no-such-host.invalid");
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, />down</);
    assert.equal(body.includes("REACH-7741"), false);
  } finally {
    server.close();
  }
});

test("the home page does not show the desk note", async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const body = await (await fetch(`http://127.0.0.1:${port}/`)).text();
    assert.equal(body.includes("desk.txt"), false);
    assert.equal(body.includes("REACH-7741"), false);
    assert.match(body, /shop-printer\.club/);
  } finally {
    server.close();
  }
});
