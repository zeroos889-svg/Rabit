import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "../routers";

const PORT = process.env.PORT || 3000;

/**
 * Create and configure Express server
 */
export default async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // tRPC endpoint
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🚀 Rabit HR Backend Server         ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                        
║   Mode: ${process.env.NODE_ENV || 'development'}
║   API:  http://localhost:${PORT}/api/trpc
║   Health: http://localhost:${PORT}/health
╚═══════════════════════════════════════╝
    `);
  });

  return app;
}

// Start server if running directly
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
