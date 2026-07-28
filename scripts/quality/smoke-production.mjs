import { spawn } from "node:child_process";

const port = 3210;
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const routes = ["/", "/?locale=nl"];
const timeoutMs = 30_000;

const child = spawn(process.execPath, ["start-standalone.cjs"], {
  env: {
    ...process.env,
    HOSTNAME: host,
    PORT: String(port),
    NODE_ENV: "production"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});
child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  output += text;
  process.stderr.write(text);
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntilReady() {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Production server exited early with code ${child.exitCode}.`
      );
    }

    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status > 0) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(250);
  }

  throw new Error(`Production server was not ready within ${timeoutMs}ms.`);
}

async function assertRoute(route) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });

  if (response.status >= 500) {
    throw new Error(
      `SSR smoke test failed for ${route}: HTTP ${response.status}.`
    );
  }

  console.log(`smoke-production: ${route} -> HTTP ${response.status}`);
}

async function shutdown() {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      delay(5_000)
    ]);
  }

  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

try {
  await waitUntilReady();

  for (const route of routes) {
    await assertRoute(route);
  }

  if (output.includes("Cannot read properties of undefined (reading 'rest')")) {
    throw new Error("Known SSR crash was detected in production output.");
  }

  console.log("smoke-production: all routes passed");
} finally {
  await shutdown();
}
