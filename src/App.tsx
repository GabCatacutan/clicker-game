import { useState, useEffect, useCallback } from "react";

function App() {
  const [score, setScore] = useState(0);
  const [timer, setTimerSeconds] = useState(60);
  const [gridSize, setGridSize] = useState(3);
  const [activeCells, setActiveCells] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [pastScores, setPastScores] = useState<number[]>([]);

  function addActiveCell() {
    const totalCells = gridSize * gridSize;

    setActiveCells((prevCells) => {
      let randIndex;

      // Keep generating a random index until it is unique
      do {
        randIndex = Math.floor(Math.random() * totalCells);
      } while (prevCells.includes(randIndex));

      // Add the unique randIndex to prevCells
      return [...prevCells, randIndex];
    });
  }

  function setInitialCells() {
    const totalCells = gridSize * gridSize;
    const initialCells: number[] = [];
    while (initialCells.length < 4) {
      const randIndex = Math.floor(Math.random() * totalCells);
      if (!initialCells.includes(randIndex)) {
        initialCells.push(randIndex);
      }
    }

    setActiveCells(initialCells);
  }

  // Timer
  useEffect(() => {
    if (timer === 0) {
      setPastScores((prevScores) => [...prevScores, score]);
    }

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setGameStarted(false);
          setActiveCells([]);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameStarted, timer]);

  const handleClick = useCallback(
    (index: number) => {
      if (activeCells.includes(index)) {
        setScore((prev) => prev + 1);
        setActiveCells((prevCells) =>
          prevCells.filter((cellIndex) => index !== cellIndex)
        );
      }
      addActiveCell();
    },
    [activeCells]
  );

  const grid = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => row * gridSize + col)
  );

  return (
    <div className="bg-gray-900 p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setScore(0);
            setTimerSeconds(60);
            setInitialCells();
            setGameStarted(true);
          }}
          disabled={gameStarted || gridSize <= 0}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          Start Game
        </button>

        <button
          onClick={() => {
            setGameStarted(false);
            setScore(0);
            setTimerSeconds(60);
            setActiveCells([]);
          }}
          className="px-4 py-2 bg-red-600  rounded hover:bg-red-700 transition"
        >
          Reset
        </button>

        <p className="text-lg">
          Timer: <span className="font-semibold">{timer}s</span>
        </p>
      </div>

      <p className="text-2xl font-bold">Score: {score}</p>

      <div className="flex justify-center">
        <table>
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cellIndex) => {
                  const isActive = activeCells.includes(cellIndex);
                  return (
                    <td key={cellIndex} className="p-1">
                      <button
                        onClick={() => handleClick(cellIndex)}
                        disabled={!isActive}
                        className={`w-12 h-12 rounded transition 
                          ${
                            isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-300"
                          }`}
                      ></button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl">Settings</h2>
      <div className="flex items-center gap-4">
        <label className="text-lg font-medium">Grid Size:</label>
        <input
          type="number"
          min="3"
          max="10"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-20 px-2 py-1 border rounded-md shadow-sm"
          disabled={gameStarted}
        />

        <label>Difficulty</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={gameStarted}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div>
        <p>Past Scores:</p>
        {pastScores ? pastScores.map((score) => <p>{score}</p>) : <></>}
      </div>
    </div>
  );
}

export default App;
