"use client";
import { useState } from "react";
import "./styles.css";

function Square({ value, onSquareClick, className }) {
  return (
    <button className={` text-8xl ${className}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="flex justify-between items-center px-4">
        <div className="status text-3xl my-5 font-semibold">{status}</div>
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

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  return (
    <div className="bg-gradient-to-r from-purple-400 to-violet-600 min-h-screen">
      <div className="game grid place-items-center ">
        <div className="header shadow-md bg-purple-700 bg-opacity-80 py-6 w-full ">
          <div></div>
          <div></div>
          <div className="flex gap-10 justify-self-center">
            <div className="flex items-center gap-2">
              <div>10</div>
              <div className="text-xl font-bold">Yoni</div>
              <div className="rounded-full bg-sky-600 w-10 h-10 grid place-items-center">
                I
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">Oren</div>
              <div className="rounded-full bg-sky-600 w-10 h-10 grid place-items-center">
                I
              </div>
              <div>10</div>
            </div>
          </div>

          <button className="shadow-md p-2 px-6 rounded-md bg-gradient-to-r from-violet-600 to-purple-600 transition ease-in-out active:scale-90">
            Leave
          </button>
        </div>

        <div className="game-board w-full lg:max-w-screen-sm">
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
          />
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
