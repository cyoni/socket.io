"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { getSocket } from "../../lib/socket";
import { GET_USERS_IN_LOBBY } from "../../constants/general";
import Game from "../../components/game/Game";
import "./styles.css";

function LobbyPage() {
  const socket = useMemo(() => getSocket(), []);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const router = useRouter();
  const { session } = useContext(UserContext);
  const [usersInLobby, setUsersInLobby] = useState([]);
  const [canSign, setCanSign] = useState(true);
  const [gameOnGoing, setGameOnGoing] = useState(false);

  // useEffect(() => {
  //   console.log("session", session);
  //   if (!session) {
  //     router.push("/");
  //   }
  // }, [session]);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (!socket) {
      return;
    }
    onConnect();

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

    socket.on(GET_USERS_IN_LOBBY, (msg) => {
      console.log(GET_USERS_IN_LOBBY, msg);
      setUsersInLobby(msg);
    });

    socket.on("can_sign_to_room", (msg) => {
      console.log("can_sign_to_room:", msg);
      setCanSign(false);
    });

    // socket.on("welcome", (msg, callback) => {
    //   // console.log("welcome:", msg);
    //   // console.log("usersInLobby!", usersInLobby, "msg", msg);
    //   // if (usersInLobby.find((u) => u.id === msg.id)) {
    //   //   return;
    //   // }
    //   // setUsersInLobby((prev) => [...prev, msg]);

    //   console.log("got msg!! " ,msg)
    //  console.log("callback?!?!", callback)

    //  // msg("Client has received the data");
    // });

    socket.on("play_request_handshake", (...args) => {
      console.log("got args", args);
      /// console.log("got play_request_handshake data", args[0])

      args[1]({ test: "test!!@" });
    });

    socket.on("start_game", (msg) => {
      console.log("GAME_START", msg);
      setGameOnGoing(true);
    });

    socket.on("welcome", (data, callback) => {
      console.log("got data", data);

      callback({ test: "test@" });
    });

    socket.on("leave", (msg) => {
      console.log("leave:", msg);
      setUsersInLobby((prev) => [...prev].filter((user) => user.id !== msg.id));
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      // socket.off("accept_request");
      // socket.off("decline_request");
      // socket.off("play_request");
      // socket.off("can_sign_to_room");
      // socket.off("welcome");
      // socket.off("connect", onConnect);
      // socket.off("disconnect", onDisconnect);
      socket.removeAllListeners();
      socket.off(GET_USERS_IN_LOBBY);
    };
  }, [usersInLobby, socket]);

  if (gameOnGoing) {
    return <Game />;
  }

  if (!canSign) {
    return (
      <div className="grid place-items-center  min-h-screen ">
        <main className="text-center">
          <h1 className="translate-y-[-50%] text-3xl">
            Cannot have two active connections.
          </h1>
          <a
            href="/"
            className="underline hover:text-gray-200"
            onClick={() => {
              sessionStorage.clear();
            }}
          >
            Disconnect
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="grid place-items-center min-h-screen">
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      {/* <div>
        users in lobby:{" "}
        <div className="space-x-1">
          {usersInLobby?.map((user, i) => (
            <span
              key={i}
              className="underline cursor-pointer "
              onClick={() => sendPlayRequest(user.id)}
            >
              {user.name}
            </span>
          ))}
        </div>
      </div> */}
      {/* {!canSign && <div>Cannot join room!</div>}
      <div>
        connected: {isConnected ? "yes" : "no"}. username:{" "}
        {session?.decoded?.name}
      </div> */}
      {/* <div>
        <div className="font-bold">invitations</div>
        <div>
          {invitations.map((invite, i) => (
            <div key={i}>
              <span className="text-gray-700 font-bold">{invite.name}</span>{" "}
              wants to challenge you.{" "}
              <span
                className="font-bold underline cursor-pointer"
                onClick={() => acceptInvitation(invite.id)}
              >
                Accept
              </span>{" "}
              |{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => declineInvitation(invite.id)}
              >
                Decline
              </span>
            </div>
          ))}
        </div>
      </div> */}
      <div className="text-3xl text-center translate-y-[-50%]">
        <p>Looking for available user...</p>

        <div>
          <a
            className="text-gray-100 underline text-sm cursor-pointer hover:text-gray-300"
            href={"/"}
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;
