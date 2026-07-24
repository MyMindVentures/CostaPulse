const path = require("node:path");
const { spawn } = require("node:child_process");

function prepareStandaloneServerEnv(env) {
  return {
    ...env,
    HOSTNAME: "0.0.0.0"
  };
}

function startStandaloneServer() {
  const serverPath = path.join(
    __dirname,
    ".next-app",
    "standalone",
    "server.js"
  );
  const env = prepareStandaloneServerEnv(process.env);

  if (process.env.HOSTNAME && process.env.HOSTNAME !== env.HOSTNAME) {
    console.warn(
      `[startup] Overriding HOSTNAME=${process.env.HOSTNAME} with ${env.HOSTNAME} for Railway compatibility.`
    );
  }

  const child = spawn(process.execPath, [serverPath], {
    stdio: "inherit",
    env
  });

  child.on("error", (error) => {
    console.error("[startup] Failed to launch Next standalone server.", error);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

if (require.main === module) {
  startStandaloneServer();
}

module.exports = {
  prepareStandaloneServerEnv,
  startStandaloneServer
};
