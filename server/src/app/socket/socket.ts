import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { envVars } from "../config/env";
import { jwtUtils } from "../utils/jwt";

let io: SocketIOServer | null = null;

export const initSocketServer = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token as string | undefined;
    const bearerHeader = socket.handshake.headers.authorization;
    const bearerToken =
      typeof bearerHeader === "string" && bearerHeader.startsWith("Bearer ")
        ? bearerHeader.replace("Bearer ", "")
        : undefined;
    const token = authToken || bearerToken;

    if (!token) {
      return next(new Error("Unauthorized socket request"));
    }

    const decodedToken = jwtUtils.verifyToken(
      token,
      envVars.ACCESS_TOKEN_SECRET,
    ) as any;

    if (!decodedToken.success || !decodedToken.data?.userId) {
      return next(new Error("Invalid socket token"));
    }

    socket.data.userId = decodedToken.data.userId as string;
    return next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown,
) => {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
};
