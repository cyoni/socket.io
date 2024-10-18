"use server";
import jwt from "jsonwebtoken";
import generateId from "../lib/generateId";
//import { socket } from "../lib/socket";
//import { JOIN_REQUEST_LOBBY } from "../constants/general";
const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY", SECRET_KEY);

export async function joinLobby(name: string) {
  console.log("ok", name);

  try {
    const id = generateId(32);

    console.log("id", id, "generated");

    const session = { id, name };

    // generate JWT
    const token = jwt.sign(session, SECRET_KEY, {
      expiresIn: "24h", // Token expiration time
    });

    // send message to server to join
    /// socket.emit(JOIN_REQUEST_LOBBY, { name });
    // redirect to /home/

    // :client:
    // check if you have JWT
    // validate JWT
    // extract username from it
    // get list of connected users
    // start listening for events

    return { status: "success", token, name };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}
