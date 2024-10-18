"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { getSocket } from "../../lib/socket";
import { GET_USERS_IN_LOBBY } from "../../constants/general";

function LobbyPage() {
  const socket = useMemo(() => getSocket(), []);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const router = useRouter();
  const { session } = useContext(UserContext);
  const [usersInLobby, setUsersInLobby] = useState([]);
  const [canSign, setCanSign] = useState(true);

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

    socket.on("welcome", (msg) => {
      console.log("welcome:", msg);
      console.log("usersInLobby!", usersInLobby, "msg", msg);
      if (usersInLobby.find((u) => u.id === msg.id)) {
        return;
      }
      setUsersInLobby((prev) => [...prev, msg]);
    });

    socket.on("leave", (msg) => {
      console.log("leave:", msg);
      setUsersInLobby((prev) => [...prev].filter((user) => user.id !== msg.id));
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("play_request", (msg) => {
      console.log("you've received a play request", msg);
      setInvitations((prev) => [...prev, { id: msg.userId, name: msg.name }]);
    });

    socket.on("accept_request", (id: string) => {
      console.log("REQUEST ACCEPTED!", id);
    });

    socket.on("decline_request", (id: string) => {
      console.log("REQUEST DECLINED", id);
    });

    return () => {
      socket.off("accept_request");
      socket.off("decline_request");
      socket.off("play_request");
      socket.off("can_sign_to_room");
      socket.off("welcome");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(GET_USERS_IN_LOBBY);
    };
  }, [usersInLobby, socket]);

  const sendPlayRequest = (id: string) => {
    console.log("id", id);
    socket!.emit("play_request", id);
  };

  const acceptInvitation = (id: string) => {
    socket!.emit("accept_request", id);
  };

  const declineInvitation = (id: string) => {
    socket!.emit("decline_request", id);
  };

  return (
    <div>
      <div>
        <a
          className="text-red-500 underline"
          href={null}
          onClick={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
        >
          Log out
        </a>
      </div>
      <div>
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
      </div>
      {!canSign && <div>Cannot join room!</div>}
      <div>
        connected: {isConnected ? "yes" : "no"}. username:{" "}
        {session?.decoded?.name}
      </div>
      <div>
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
      </div>
      page lobby <div></div>
    </div>
  );
}

export default LobbyPage;
