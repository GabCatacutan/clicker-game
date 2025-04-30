import { useState, useEffect, useCallback } from "react";

type ActiveCell = { index: number; timestamp: number };

function App() {
  const [score, setScore] = useState(0);
  const [timer, setTimerSeconds] = useState(60);
  const [gridSize, setGridSize] = useState(3);
  const [activeCells, setActiveCells] = useState<ActiveCell[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");

  const getMaxActiveDuration = () => {
    switch (difficulty) {
      case "easy": return 3000;
      case "medium": return 2000;
      case "hard": return 1000;
      default: return 2000;
    }
  };

  // Timer
  useEffect(() => {
    if (!gameStarted || timer <= 0) return;

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setGameStarted(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameStarted, timer]);

  // Activate random cell and check for overstayed cells
  useEffect(() => {
    if (!gameStarted || gridSize <= 0) {
      setActiveCells([]);
      return;
    }

    const totalCells = gridSize * gridSize;
    let intervalDelay = 0;

    switch (difficulty) {
      case "easy":
        intervalDelay = 1000;
        break;
      case "medium":
        intervalDelay = 750;
        break;
      case "hard":
        intervalDelay = 250;
        break;
    }

    const cellInterval = setInterval(() => {
      const now = Date.now();
      const maxDuration = getMaxActiveDuration();

      setActiveCells((prevCells) => {
        // Remove old cells and end game if any overstayed
        const updated = prevCells.filter(({ index, timestamp }) => {
          const alive = now - timestamp < maxDuration;
          if (!alive) setGameStarted(false); // Game over due to timeout
          return alive;
        });

        // Add a new random cell if game still running
        if (updated.length === prevCells.length && gameStarted) {
          const randIndex = Math.floor(Math.random() * totalCells);
          if (!updated.some((cell) => cell.index === randIndex)) {
            updated.push({ index: randIndex, timestamp: now });
          }
        }

        return updated;
      });
    }, intervalDelay);

    return () => clearInterval(cellInterval);
  }, [gameStarted, gridSize, difficulty]);

  const handleClick = useCallback(
    (index: number) => {
      if (activeCells.some((cell) => cell.index === index)) {
        setScore((prev) => prev + 1);
        setActiveCells((prevCells) => prevCells.filter((cell) => cell.index !== index));
      }
    },
    [activeCells]
  );

  const grid = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => row * gridSize + col)
  );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setScore(0);
            setTimerSeconds(60);
            setGameStarted(true);
          }}
          disabled={gameStarted || gridSize <= 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
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
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
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
                  const isActive = activeCells.some((cell) => cell.index === cellIndex);
                  return (
                    <td key={cellIndex} className="p-1">
                      <button
                        onClick={() => handleClick(cellIndex)}
                        disabled={!isActive}
                        className={`w-12 h-12 rounded transition 
                          ${isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-300"}`}
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
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-20 px-2 py-1 border rounded-md shadow-sm"
          disabled={gameStarted}
        />

        <label>Difficulty</label>
        <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={gameStarted}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}

export default App;
