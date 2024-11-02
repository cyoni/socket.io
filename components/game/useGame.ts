import { useState } from "react";

export function useGame({ socket }) {
  const [gameData, setGameData] = useState(null);
  const [startNewGame, setStartNewGame] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const userLeftGame = gameData?.userLeft === true;

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const squares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];

    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

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
    handlePlay(nextSquares);
  }

  function calculateWinner(squares) {
    if (userLeftGame) {
      return "USER_LEFT_GAME";
    }

    if (squares.every((x) => x !== null)) {
      setIsGameOver(true);
      return "DRAW";
    }
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
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        setIsGameOver(true);
        return squares[a];
      }
    }
    return null;
  }

  function resetGame() {
    setIsGameOver(false);
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setStartNewGame(false);
  }

  return {
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
  };
}
