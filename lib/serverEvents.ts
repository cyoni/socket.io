import { Server, Socket } from "socket.io";
import { activeUsers, activeUsersSocketToUser } from "./store";
import { UserMatcherService } from "./findMatchService";

export function serverEvents(
  socket: Socket,
  io: Server,
  userMatcherService: typeof UserMatcherService.prototype
) {
  const usersInLobby = getUsersList(io);
  
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

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.userId} disconnected:`, reason);

    userMatcherService.removeUser(socket.id);

    delete activeUsersSocketToUser[socket.id];

    socket.to("lobby").emit("leave", {
      id: socket.userId,
      name: activeUsers[socket.userId].name,
    });
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
