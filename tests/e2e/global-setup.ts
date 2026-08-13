import { fork, spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const STARTUP_TIMEOUT_MS = 120_000;
const SHUTDOWN_TIMEOUT_MS = 30_000;
const require = createRequire(import.meta.url);

export default async function globalSetup() {
  await buildE2eApplication();

  const server = fork(resolve(process.cwd(), "tests/e2e/server.mjs"), {
    env: { ...process.env, NEXT_PUBLIC_E2E_MODE: "true", NEXT_PUBLIC_FAST_MODE: "true" },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  server.stdout?.pipe(process.stdout);
  server.stderr?.pipe(process.stderr);

  await waitForMessage(server, "ready", STARTUP_TIMEOUT_MS);

  return async () => {
    const stopped = waitForMessage(server, "stopped", SHUTDOWN_TIMEOUT_MS);
    server.send({ type: "shutdown" });
    await stopped;
    await waitForExit(server, SHUTDOWN_TIMEOUT_MS);
  };
}

function buildE2eApplication() {
  const nextCli = require.resolve("next/dist/bin/next");

  return new Promise<void>((resolveBuild, rejectBuild) => {
    const build = spawn(process.execPath, [nextCli, "build"], {
      env: { ...process.env, NEXT_PUBLIC_E2E_MODE: "true", NEXT_PUBLIC_FAST_MODE: "true" },
      stdio: "inherit",
    });
    build.once("error", rejectBuild);
    build.once("exit", (code, signal) => {
      if (code === 0) {
        resolveBuild();
      } else {
        rejectBuild(new Error(`E2E build failed: code=${code}, signal=${signal}`));
      }
    });
  });
}

function waitForMessage(server: ChildProcess, expectedType: string, timeoutMs: number) {
  return new Promise<void>((resolveMessage, rejectMessage) => {
    const timer = setTimeout(() => {
      cleanup();
      rejectMessage(new Error(`E2E server did not report ${expectedType} within ${timeoutMs}ms`));
    }, timeoutMs);
    const onMessage = (message: unknown) => {
      if (!isMessageType(message, expectedType)) return;
      cleanup();
      resolveMessage();
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      rejectMessage(new Error(`E2E server exited before ${expectedType}: code=${code}, signal=${signal}`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      server.off("message", onMessage);
      server.off("exit", onExit);
    };

    server.on("message", onMessage);
    server.once("exit", onExit);
  });
}

function waitForExit(server: ChildProcess, timeoutMs: number) {
  if (server.exitCode !== null || server.signalCode !== null) return Promise.resolve();

  return new Promise<void>((resolveExit, rejectExit) => {
    const timer = setTimeout(() => {
      cleanup();
      rejectExit(new Error(`E2E server did not exit within ${timeoutMs}ms after cleanup`));
    }, timeoutMs);
    const onExit = () => {
      cleanup();
      resolveExit();
    };
    const cleanup = () => {
      clearTimeout(timer);
      server.off("exit", onExit);
    };

    server.once("exit", onExit);
  });
}

function isMessageType(message: unknown, expectedType: string): message is { type: string } {
  return typeof message === "object"
    && message !== null
    && "type" in message
    && message.type === expectedType;
}
