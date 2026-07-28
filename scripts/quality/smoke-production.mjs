import { spawn } from "node:child_process";
import path from "node:path";

const port = 3210;
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const readinessRoute = "/api/health";
const routes = ["/", "/?locale=nl"];
const startupTimeoutMs = 12_000;
const requestTimeoutMs = 3_000;
const totalTimeoutMs = 20_000;
const shutdownTimeoutMs = 1_500;
const serverPath = path.join(
  process.cwd(),
  ".next-app",
  "standalone",
  "server.js"
);

// Start the actual Next.js standalone server directly. Starting it through
// start-standalone.cjs creates a grandchild process that survives when the
// wrapper is killed, leaving GitHub Actions stuck on the smoke-test step.
const child = spawn(process.execPath, [serverPath], {
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

async function request(route) {
  return fetch(`${baseUrl}${route}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(requestTimeoutMs)
  });
}

async function waitUntilReady() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Production server exited early with code ${child.exitCode}.\n${output}`
      );
    }

    try {
      const response = await request(readinessRoute);
      if (response.status === 200) {
        console.log(
          `smoke-production: ready via ${readinessRoute} -> HTTP ${response.status}`
        );
        return;
      }
    } catch {
      // The server is still starting or the request timed out.
    }

    await delay(200);
  }

  throw new Error(
    `Production server was not ready within ${startupTimeoutMs}ms.\n${output}`
  );
}

async function assertRoute(route) {
  const response = await request(route);

  if (response.status >= 500) {
    throw new Error(
      `SSR smoke test failed for ${route}: HTTP ${response.status}.\n${output}`
    );
  }

  console.log(`smoke-production: ${route} -> HTTP ${response.status}`);
}

async function waitForExit(timeoutMs) {
  if (child.exitCode !== null) return true;

  return Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(timeoutMs).then(() => false)
  ]);
}

async function shutdown() {
  if (child.exitCode !== null) return;

  child.kill("SIGTERM");
  const exitedGracefully = await waitForExit(shutdownTimeoutMs);
  if (exitedGracefully) return;

  child.kill("SIGKILL");
  await waitForExit(shutdownTimeoutMs);
}

async function runSmokeTest() {
  await waitUntilReady();

  for (const route of routes) {
    await assertRoute(route);
  }

  if (output.includes("Cannot read properties of undefined (reading 'rest')")) {
    throw new Error("Known SSR crash was detected in production output.");
  }

  console.log("smoke-production: all routes passed");
}

let timeoutId;

try {
  await Promise.race([
    runSmokeTest(),
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Production smoke test exceeded the hard ${totalTimeoutMs}ms limit.\n${output}`
          )
        );
      }, totalTimeoutMs);
    })
  ]);
} finally {
  clearTimeout(timeoutId);
  await shutdown();
}
