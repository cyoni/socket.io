import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { GET_USERS_IN_LOBBY } from "./constants/general";
import jwt from "jsonwebtoken";
import { activeUsers, activeUsersSocketToUser } from "./lib/store";
import generateId from "./lib/generateId";
import { socketioMiddleware } from "./lib/socketio.middleware";
import { serverEvents } from "./lib/serverEvents";

// maybe the JWT should have a unique id that will be connected to
// the specific socket

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.use(socketioMiddleware);

  io.on("connection", (socket) => {
    console.log("connected");

    serverEvents(socket, io);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
