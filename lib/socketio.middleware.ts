import { activeUsers } from "./store";
import jwt from "jsonwebtoken";

export const socketioMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("token?", token)
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      socket.username = decoded.name;
      console.log("socket.username", socket.username);
      socket.userId = decoded.id;
      activeUsers[socket.userId] = {
        name: decoded.name,
        id: decoded.id,
        socketId: socket.id,
      };

      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
}
