import { Server } from "socket.io";

export class UserMatcherService {
  private waitingUsersQueue: WaitingUser[] = [];
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.waitingUsersQueue = [];
  }

  addUser(socketId: string, userId: string) {
    const index = this.waitingUsersQueue.findIndex(
      (user) => user.socketId === socketId
    );

    if (index >= 0) {
      return false;
    }

    this.waitingUsersQueue.push({ socketId, userId });
    return true;
  }

  removeUser(socketId: string) {
    const index = this.waitingUsersQueue.findIndex(
      (user) => user.socketId === socketId
    );

    if (index >= 0) {
      this.waitingUsersQueue.splice(index, 1);
    }

    return index;
  }

  async findUserMatch() {
    console.log("looking for a match...", this.waitingUsersQueue.length);
    if (this.waitingUsersQueue.length >= 2) {
      let socketResult;

      const getUser = (socketId: string) =>
        this.io
          .timeout(4000)
          .to(socketId)
          .emitWithAck("play_request_handshake", (err, response) => {
            console.log("????????????", err, "res", res);
          });

      const user1 = this.waitingUsersQueue.shift();
      const user2 = this.waitingUsersQueue.shift();

      try {
        if (!user1 || !user2) {
          throw new Error("user1 or user2 is null");
        }
        socketResult = await Promise.all([
          getUser(user1.socketId),
          getUser(user2.socketId),
        ]);
      } catch (err) {
        console.log("got error", err);
      }

      if (socketResult?.[0] && socketResult?.[1]) {
        // join them to play
        console.log("lets play");
        const sockets = [
          this.io.sockets.sockets.get(user1!.socketId),
          this.io.sockets.sockets.get(user2!.socketId),
        ];
        if (sockets.every((socket) => !!socket)) {
          const roomId = `game_room_${user1!.userId}_${user2!.userId}`;
          sockets.forEach((socket) => {
            socket.join(roomId);
            socket.emit("start_game", {
              roomId,
              players: { [user1!.userId]: "X", [user2!.userId]: "O" },
            });
          });
        } else {
          console.log("error!!!");
        }
      } else if (!socketResult?.[0]) {
        console.log("user1 is unavailable");
        this.waitingUsersQueue.push(user2!);
      } else {
        console.log("user2 is unavailable");
        this.waitingUsersQueue.push(user1!);
      }
    }
  }

  startService() {
    setInterval(() => this.findUserMatch(), 5000);
  }
}