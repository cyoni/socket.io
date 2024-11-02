import { Server, Socket } from "socket.io";
import { activeUsers, activeUsersSocketToUser, playRoom } from "./store";
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
        socket.disconnect()
        return;
      }
    }
  }
  
  userMatcherService.addUser(socket.id, socket.userId);

  activeUsersSocketToUser[socket.id] = socket.userId;

  socket.join("lobby");
  console.log(`${socket.username} joined lobby room`);

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.userId} disconnected:`, reason);

    userMatcherService.removeUser(socket.id);

    delete activeUsersSocketToUser[socket.id];

    const gameRoomId = activeUsers[socket.userId].gameRoomId;

    if (gameRoomId) {
      const room = io.sockets.adapter.rooms.get(gameRoomId);

      if (room) {
        io.to(gameRoomId).emit("leave_game_room");

        for (let socketId of room) {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket) {
            clientSocket.leave(gameRoomId);
          }
        }

        delete playRoom[gameRoomId];
      }
    }

    socket.to("lobby").emit("leave", {
      id: socket.userId,
      name: activeUsers[socket.userId].name,
    });
  });

  socket.on("game_move", (data) => {
    if (!data) {
      return;
    }

    const roomId = data.roomId;

    const playRoomState = playRoom[roomId];

    if (!playRoomState) {
      console.log("playRoomState is nulll");
      socket.disconnect();
      return;
    }

    const square = data.square;
    if (data.square == null || !(data.square >= 0 && data.square <= 9)) {
      console.log("unknown/invalid input ");
      socket.disconnect();
      return;
    }

    if (playRoomState.turnUserId !== socket.userId) {
      console.log("its not your turn");
      return;
    }

    const otherUserId =
      playRoomState.userId1 === socket.userId
        ? playRoomState.userId2
        : playRoomState.userId1;

    playRoomState.turnUserId = otherUserId;

    console.log("got game_move", data);

    io.to(roomId).emit("game_move", {
      square,
      player: socket.userId,
      turnUserId: playRoomState.turnUserId,
    });
  });

  socket.on("start_new_game", (data) => {
    const { roomId } = data;
    const playRoomState = playRoom[roomId];

    playRoomState.turnUserId = socket.userId;

    socket.to(roomId).emit("start_new_game", {
      turnUserId: socket.userId,
    });
  });

  socket.on("leave_game_room", () => {
    const roomId = activeUsers[socket.userId].gameRoomId;

    delete activeUsers[socket.userId].gameRoomId;

    if (!roomId) {
      return;
    }

    delete playRoom[roomId];

    io.to(roomId).emit("leave_game_room");

    const room = io.sockets.adapter.rooms.get(roomId);

    if (room) {
      // Disconnect all users in the room
      for (let socketId of room) {
        const clientSocket = io.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.leave(roomId); // Remove each user from the room
        }
      }
    }
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
