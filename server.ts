import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { usersWaiting } from "./lib/store";
import { socketioMiddleware } from "./lib/socketio.middleware";
import { serverEvents } from "./lib/serverEvents";
import { UserMatcherService } from "./lib/findMatchService";

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

  const userMatcherService = new UserMatcherService(io);
  userMatcherService.startService();

  io.on("connection", (socket) => {
    console.log("connected@@");

    serverEvents(socket, io, userMatcherService);
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
