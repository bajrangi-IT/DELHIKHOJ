// Render fallback: seamlessly forward to native Next.js start CLI
process.argv = [process.argv[0], "next", "start", "-H", "0.0.0.0"];
require("next/dist/bin/next");
