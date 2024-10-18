"use client";

import { io, Socket } from "socket.io-client";

// class SocketInstance {
//   static instance = null;

//   constructor() {
//     if (typeof window == "undefined") {
//       return;
//     }
//     if (SocketInstance.instance && this.token) {
//       return SocketInstance.instance; // Return the existing instance if it already exists
//     }
//     this.token = sessionStorage.getItem("session");

//     console.log("calling constructor", this.token);
//     // Create a new socket connection
//     this.socket = io("/", {
//       auth: {
//         token: this.token, // JWT token (if applicable)
//       },
//       transports: ["websocket"], // Ensure WebSocket transport
//     });

//     // Save this instance as a singleton
//     SocketInstance.instance = this;
//   }

//   // Method to get the socket instance
//   getSocket() {
//     console.log("this.token?", this.socket)
//     return this.socket;
//   }
// }

//export default SocketInstance;

// import { io } from "socket.io-client";

//import { io } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  // If socket instance already exists, return it
  if (typeof window === "undefined") {
    console.log("get socket is not available in server");
    return;
  }

  if (socket) {
    return socket;
  }

  console.log("creating socket instance", console.trace("tace"));

  // Otherwise, create a new socket instance
  socket = io("/", {
    auth: {
      token: sessionStorage.getItem("session"), // JWT token (if applicable)
    },
    transports: ["websocket"], // Ensure that WebSocket transport is used
  });

  return socket;
};

//export const socket = new SocketInstance().getSocket();
