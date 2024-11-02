"use client";
import React, { use, useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { getSocket } from "../../lib/socket";
import { GET_USERS_IN_LOBBY } from "../../constants/general";
import Game from "../../components/game/Game";
import "./styles.css";
import { useGame } from "../../components/game/useGame";

function LobbyPage() {
  const socket = useMemo(() => getSocket(), []);

  const { session } = useContext(UserContext);
  const [usersInLobby, setUsersInLobby] = useState([]);
  const [canSign, setCanSign] = useState(true);
  const [leftGameRoom, setLeftGameRoom] = useState(false);
  const [otherUserWantsNewGame, setOtherUserWantsNewGame] = useState(false);

  const {
    history,
    setHistory,
    handlePlay,
    currentMove,
    setCurrentMove,
    xIsNext,
    handleClick,
    squares,
    calculateWinner,
    gameData,
    setGameData,
    resetGame,
    startNewGame,
    setStartNewGame,
    isGameOver,
    userLeftGame,
  } = useGame({ socket });

  useEffect(() => {
    console.log("session", session);
    if (!sessionStorage.getItem("session")) {
      window.location.href = "/";
    }
    console.log("session@@", session)
  }, []);

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

    socket.on("leave_game_room", () => {
      setGameData((prev) => ({ ...prev, userLeft: true }));
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

    socket.on("play_request_handshake", (data, callback) => {
      callback({ status: true });
    });

    socket.on("start_game", (data) => {
      console.log("GAME_START", data);
      setGameData(data);
    });

    socket.on("welcome", (data, callback) => {
      callback({ test: "test@" });
    });

    socket.on("leave", (msg) => {
      console.log("leave:", msg);
      setUsersInLobby((prev) => [...prev].filter((user) => user.id !== msg.id));
    });

    socket.on("game_move", (data) => {
      const { square, playerId } = data;
      console.log("got game_move", data);
      setGameData((prev) => ({ ...prev, turnUserId: data.turnUserId }));
      handleClick(square);
    });

    socket.on("start_new_game", (data) => {
      console.log("start_new_game  !", data);
      setOtherUserWantsNewGame(true);

      setGameData((prev) => ({ ...prev, turnUserId: data.turnUserId }));
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.removeAllListeners();
    };
  }, [usersInLobby, socket, history]);

  useEffect(() => {
    const handlePopState = () => {
      console.log("socket?", socket);
      if (socket) {
        socket.disconnect();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (otherUserWantsNewGame && startNewGame) {
      resetGame();
      setGameData((prev) => ({ ...prev, turnUserId: session.decoded.id }));
      setOtherUserWantsNewGame(false);
    }
  }, [otherUserWantsNewGame, startNewGame, session]);

  if (leftGameRoom) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="translate-y-[-50%] text-center">
          <h1 className="text-3xl">You left the game</h1>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-5 shadow-md p-2 px-6 rounded-md bg-blue-600 transition ease-in-out active:scale-90"
          >
            Join a Game
          </button>
        </div>
      </div>
    );
  }

  if (gameData) {
    const { roomId, players } = gameData;
    const [player1, player2] = players;
    return (
      <Game
        socket={socket}
        turnUserId={gameData.turnUserId}
        userId={session?.decoded?.id}
        roomId={roomId}
        player1={player1}
        player2={player2}
        history={history}
        setHistory={setHistory}
        handlePlay={handlePlay}
        currentMove={currentMove}
        setCurrentMove={setCurrentMove}
        xIsNext={xIsNext}
        handleClick={handleClick}
        squares={squares}
        calculateWinner={calculateWinner}
        setLeftGameRoom={setLeftGameRoom}
        setStartNewGame={setStartNewGame}
        startNewGame={startNewGame}
        otherUserWantsNewGame={otherUserWantsNewGame}
        setOtherUserWantsNewGame={setOtherUserWantsNewGame}
        isGameOver={isGameOver}
        userLeftGame={userLeftGame}
      />
    );
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
