import { Server, Socket } from "socket.io";
import { activeUsers, activeUsersSocketToUser } from "./store";
import { GET_USERS_IN_LOBBY } from "../constants/general";

export function serverEvents(socket: Socket, io: Server) {
  const usersInLobby = getUsersList(io);

  console.log("got usersInLobby", usersInLobby);

  if (usersInLobby) {
    for (const user of usersInLobby) {
      if (user.id === socket.userId) {
        socket.emit("can_sign_to_room", false);
        return;
      }
    }
  }

  activeUsersSocketToUser[socket.id] = socket.userId;

  socket.join("lobby");

  console.log(`${socket.username} joined lobby room`);

  io.to("lobby").emit("welcome", {
    id: socket.userId,
    name: socket.username,
  });

  socket.on("message", (value) => {
    socket.emit("message", value);
  });

  const emitMessage = [
    ...(usersInLobby || []),
    { id: socket.userId, socket: socket.id, name: socket.username },
  ];

  console.log("msg to emit", emitMessage);
  socket.emit(GET_USERS_IN_LOBBY, emitMessage);

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.userId} disconnected:`, reason);

    delete activeUsersSocketToUser[socket.id];

    socket.to("lobby").emit("leave", {
      id: socket.userId,
      name: activeUsers[socket.userId].name,
    });
    /// delete activeUsers[socket.userId];
  });

  socket.on("play_request", (id: string) => {
    const socketId = activeUsers[id].socketId;
    io.to(socketId).emit("play_request", {
      userId: socket.userId,
      name: socket.username,
    });
  });

  socket.on("accept_request", (id: string) => {
    const socketId = activeUsers[id].socketId;
    io.to(socketId).emit("accept_request", id);
  });

  socket.on("decline_request", (id: string) => {
    const socketId = activeUsers[id].socketId;
    io.to(socketId).emit("decline_request", id);
  });
}

const getUsersList = (io: Server) => {
  const roomName = "lobby";
  const room = io.sockets.adapter.rooms.get(roomName);

  if (room) {
    const userIds = new Set([
      ...Array.from(room).map((u: string) => activeUsersSocketToUser[u]),
    ]);
    console.log("usersIds", userIds);
    const usersInRoom = Array.from(userIds).map((userId) => ({
      socketId: activeUsers[userId]["socketId"],
      id: activeUsers[userId].id,
      name: activeUsers[userId].name,
    }));

    return usersInRoom;
  }
};
