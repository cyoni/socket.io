"use client";
import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";

function LobbyPage() {
  const socket = useSocket();

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (socket.connected) {
      console.log("connected");
      /// onConnect();
    }

    // function onConnect() {
    //   setIsConnected(true);
    //   setTransport(socket.io.engine.transport.name);

    //   socket.io.engine.on("upgrade", (transport) => {
    //     setTransport(transport.name);
    //   });
    // }

    function onDisconnect() {
      //   setIsConnected(false);
      //   setTransport("N/A");
    }

    socket.on("message", (value) => {
      console.log(`got message`, value);
    });

    //  socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("message");
      //   socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <div>
      page{" "}
      <input value={message} onChange={(e) => setMessage(e.target.value)} />{" "}
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default LobbyPage;
