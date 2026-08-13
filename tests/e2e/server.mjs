import { createServer } from "node:http";

const HOSTNAME = "127.0.0.1";
const PORT = 3100;
const { default: next } = await import("next");

const httpServer = createServer();
const app = next({
  dev: false,
  dir: process.cwd(),
  hostname: HOSTNAME,
  port: PORT,
  httpServer,
});
const handleRequest = app.getRequestHandler();
let shuttingDown = false;

httpServer.on("request", (request, response) => {
  void handleRequest(request, response).catch((error) => {
    console.error(error);
    if (!response.headersSent) response.statusCode = 500;
    response.end();
  });
});

process.on("message", (message) => {
  if (message?.type === "shutdown") void shutdown();
});
process.on("disconnect", () => void shutdown());

try {
  await app.prepare();
  await new Promise((resolveListen, rejectListen) => {
    const onError = (error) => rejectListen(error);
    httpServer.once("error", onError);
    httpServer.listen(PORT, HOSTNAME, () => {
      httpServer.off("error", onError);
      resolveListen();
    });
  });
  process.send?.({ type: "ready" });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
  await shutdown();
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  await app.close();
  if (httpServer.listening) {
    await new Promise((resolveClose, rejectClose) => {
      httpServer.close((error) => error ? rejectClose(error) : resolveClose());
    });
  }
  await new Promise((resolveSend, rejectSend) => {
    if (!process.send) {
      resolveSend();
      return;
    }
    process.send({ type: "stopped" }, (error) => error ? rejectSend(error) : resolveSend());
  });
  process.disconnect?.();
}
