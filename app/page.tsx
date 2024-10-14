"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("join-lobby", (value) => {
      console.log(`join lobby: ${value}`);
    //  router.replace("/lobby");
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("join-lobby");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const enterLobby = () => {
    socket.emit("join-lobby", name);
  };

  console.log("socket", socket);
  return (
    <div>
      <label>Enter your name:</label>
      <input
        className="text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={enterLobby}>Enter</button>
    </div>
  );
}
