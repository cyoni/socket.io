import "socket.io";

declare module "socket.io" {
  interface Socket {
    userId: string;
    username: string;
  }
}
