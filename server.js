const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Unhandled Rejection:", reason);
});

const dev = process.env.NODE_ENV === "development";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isReady = false;
const appReadyPromise = app.prepare().then(() => {
  isReady = true;
  console.log(`> Next.js engine ready on http://${hostname}:${port}`);
  // Background warm-up so the very first visitor gets instant response
  const http = require("http");
  setTimeout(() => {
    http.get(`http://127.0.0.1:${port}/`, (res) => {
      console.log(`> Warm-up completed (status: ${res.statusCode})`);
    }).on("error", () => {});
  }, 500);
}).catch((err) => {
  console.error("Next.js preparation error:", err);
});

const server = createServer(async (req, res) => {
  // Fast healthcheck for Render port scanner
  if (req.url === "/api/health" || req.url === "/healthz") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, ready: isReady }));
    return;
  }

  try {
    if (!isReady) {
      await appReadyPromise;
    }
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error handling request:", req.url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
});

server
  .once("error", (err) => {
    console.error("Server bind error:", err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Server listening on http://${hostname}:${port}`);
  });
