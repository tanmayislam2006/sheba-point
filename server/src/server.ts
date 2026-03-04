import { Server } from "http";
import http from "http";
import app from "./app";
import { prisma } from "./app/libs/prisma";
import { initSocketServer } from "./app/socket/socket";

let server: Server;
const port = Number(process.env.PORT) || 5000;

const bootstrap = async () => {
  try {
    await prisma.$connect();
    console.log("Database Connected");

    server = http.createServer(app);
    initSocketServer(server);

    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle production stop signal and close server safely.
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received. Shutting down server...");

  await prisma.$disconnect();

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle terminal interrupt (Ctrl+C) and close server safely.
process.on("SIGINT", async () => {
  console.log("SIGINT signal received. Shutting down server...");

  await prisma.$disconnect();

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle unexpected sync errors that crash the app.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);

  await prisma.$disconnect();

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Handle rejected promises that were not caught.
process.on("unhandledRejection", async (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);

  await prisma.$disconnect();

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

bootstrap();
