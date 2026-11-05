import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDB, connectDB } from "./config/db.js";

const app = createApp();

if (!process.env.VERCEL) {
  async function main() {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`StudioSpace API running on http://localhost:${env.port} (${env.nodeEnv})`);
    });

    const shutdown = async () => {
      server.close();
      await closeDB();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  main().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;
