"use client";
import { useEffect, useState } from "react";
import "./styles.css";
import { Socket } from "socket.io-client";

function Square({ value, onSquareClick, className }) {
  return (
    <button className={` text-8xl ${className}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({
  userId,
  roomId,
  currentPlayer,
  otherPlayer,
  xIsNext,
  squares,
  socket,
  calculateWinner,
  turnUserId,
  setStartNewGame,
  startNewGame,
  isGameOver,
  userLeftGame,
}) {
  const gameStatus = calculateWinner(squares);
  let status;

  if (gameStatus === "USER_LEFT_GAME") {
    status = "Game over - User left the game";
  } else if (gameStatus === "DRAW") {
    status = "Draw - game over";
  } else if (gameStatus) {
    status = "Winner: " + gameStatus;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const handleClick = (square) => {
    console.log("turnUserId.id", currentPlayer, "turnUserId", turnUserId);
    if (squares[square] !== null) {
      return;
    }
    if (turnUserId === currentPlayer.id) {
      socket.emit("game_move", { square, roomId });
    } else {
      console.log("its not your turn");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center px-4">
        <div className="status  my-5 font-semibold flex items-center justify-between w-full">
          <span className="text-3xl"> {status} </span>

          {startNewGame ? (
            <div>Waiting for player...</div>
          ) : isGameOver ? (
            <button
              onClick={() => {
                socket.emit("start_new_game", { roomId });
                setStartNewGame(true);
              }}
              className="shadow-md p-2 px-6 rounded-md bg-gradient-to-r from-violet-600 to-purple-600 transition ease-in-out active:scale-90"
            >
              New Game
            </button>
          ) : null}
        </div>
      </div>
      <div className="square-container">
        <Square
          value={squares[0]}
          onSquareClick={() => handleClick(0)}
          className="border-b-2 border-r-2"
        />
        <Square
          value={squares[1]}
          onSquareClick={() => handleClick(1)}
          className="border-b-2 border-r-2"
        />
        <Square
          value={squares[2]}
          onSquareClick={() => handleClick(2)}
          className="border-b-2"
        />

        <Square
          value={squares[3]}
          onSquareClick={() => handleClick(3)}
          className="border-b-2 border-r-2"
        />
        <Square
          value={squares[4]}
          onSquareClick={() => handleClick(4)}
          className="border-b-2 border-r-2"
        />
        <Square
          value={squares[5]}
          onSquareClick={() => handleClick(5)}
          className="border-b-2"
        />

        <Square
          value={squares[6]}
          onSquareClick={() => handleClick(6)}
          className="border-r-2"
        />
        <Square
          value={squares[7]}
          onSquareClick={() => handleClick(7)}
          className="border-r-2"
        />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

type PlayerType = {
  name: string;
  id: string;
  symbol: "X" | "O";
};
interface GameProps {
  turnUserId: string;
  userId: string;
  roomId: string;
  socket: Socket;
  player1: PlayerType;
  player2: PlayerType;
}

export default function Game({
  turnUserId,
  userId,
  roomId,
  socket,
  player1,
  player2,
  history,
  setHistory,
  handlePlay,
  currentMove,
  setCurrentMove,
  xIsNext,
  handleClick,
  squares,
  calculateWinner,
  setLeftGameRoom,
  setStartNewGame,
  startNewGame,
  otherUserWantsNewGame,
  setOtherUserWantsNewGame,
  isGameOver,
  userLeftGame,
}: GameProps) {
  console.log("userId?@@@", userId);

  const currentPlayer = player1.id === userId ? player1 : player2;
  const otherPlayer = currentPlayer.id === userId ? player2 : player1;

  return (
    <div className="bg-gradient-to-r from-purple-400 to-violet-600 min-h-screen">
      <div className="game grid place-items-center ">
        <div className="header shadow-md bg-purple-700 bg-opacity-80 py-6 w-full">
          <div></div>
          <div></div>
          <div className="players flex justify-evenly max-w-screen-sm px-10 w-full justify-self-center max-sm:px-0 max-sm:justify-start max-sm:gap-5">
            <div
              className={`flex items-center gap-2 ${
                player1.id === turnUserId ? "text-teal-300" : ""
              }`}
            >
              <div>{player1.symbol}</div>
              <div className="text-xl font-bold">
                {player1.name}
                {userId === player1.id && (
                  <span className="ml-2 text-sm">(me)</span>
                )}
              </div>
              <div className="rounded-full bg-sky-600 w-10 h-10 grid place-items-center  font-bold">
                {player1.name.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <div
              className={`flex items-center gap-2 ${
                player2.id === turnUserId ? "text-teal-300" : ""
              }`}
            >
              <div className="text-xl font-bold">
                {player2.name}
                {userId === player2.id && (
                  <span className="ml-2 text-sm">(me)</span>
                )}
              </div>
              <div className="rounded-full bg-sky-600 w-10 h-10 grid place-items-center font-bold">
                {player2.name.slice(0, 1).toUpperCase()}
              </div>
              <div>{player2.symbol}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (userLeftGame) {
                window.location.reload();
                return;
              }
              socket.emit("leave_game_room", { roomId });
              setLeftGameRoom(true);
            }}
            className="leave-btn shadow-md p-2 px-6 rounded-md bg-gradient-to-r from-violet-600 to-purple-600 transition ease-in-out active:scale-90"
          >
            Leave
          </button>
        </div>

        <div className="game-board w-full lg:max-w-screen-sm">
          <Board
            userId={userId}
            setStartNewGame={setStartNewGame}
            startNewGame={startNewGame}
            turnUserId={turnUserId}
            roomId={roomId}
            currentPlayer={currentPlayer}
            otherPlayer={otherPlayer}
            xIsNext={xIsNext}
            squares={squares}
            onPlay={handlePlay}
            socket={socket}
            calculateWinner={calculateWinner}
            isGameOver={isGameOver}
            otherUserWantsNewGame={otherUserWantsNewGame}
            setOtherUserWantsNewGame={setOtherUserWantsNewGame}
            userLeftGame={userLeftGame}
          />
        </div>
      </div>
    </div>
  );
}
