import {
    DEFAULT_HIGH_SCORE,
    GRID_SIZE,
    createInitialState,
    getDirectionForKey,
    getNextHighScore,
    normalizeHighScore,
    setDirection,
    stepState
} from "./snake-logic.mjs";

const TICK_MS = 150;
const HIGH_SCORE_STORAGE_KEY = "secracy-snake-high-score";

const boardElement = document.getElementById("snake-board");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");
const pauseButton = document.getElementById("pause-button");
const controlButtons = document.querySelectorAll("[data-direction]");
const gameOverPopup = document.getElementById("game-over-popup");
const popupScoreElement = document.getElementById("popup-score");
const popupHighScoreElement = document.getElementById("popup-high-score");
const popupRestartButton = document.getElementById("popup-restart-button");

let state = createInitialState();
let isPaused = false;
let tickHandle = null;
let highScore = loadHighScore();

renderBoard();
renderState();
startLoop();

window.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restartGame);
pauseButton.addEventListener("click", togglePause);
popupRestartButton.addEventListener("click", restartGame);

controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const directionName = button.getAttribute("data-direction");
        applyDirection(directionName);
    });
});

function startLoop() {
    stopLoop();
    tickHandle = window.setInterval(runTick, TICK_MS);
}

function stopLoop() {
    if (tickHandle !== null) {
        window.clearInterval(tickHandle);
        tickHandle = null;
    }
}

function runTick() {
    if (isPaused || state.status !== "running") {
        return;
    }

    state = stepState(state);
    syncHighScore();
    renderState();
}

function handleKeydown(event) {
    if (event.key === " ") {
        event.preventDefault();
        togglePause();
        return;
    }

    if (event.key === "Enter" && state.status === "game-over") {
        restartGame();
        return;
    }

    const direction = getDirectionForKey(event.key);
    if (!direction) {
        return;
    }

    event.preventDefault();
    state = setDirection(state, direction);

    if (state.status === "ready") {
        state = {
            ...state,
            status: "running"
        };
    }
}

function applyDirection(directionName) {
    const directionMap = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };

    state = setDirection(state, directionMap[directionName]);

    if (state.status === "ready") {
        state = {
            ...state,
            status: "running"
        };
    }
}

function restartGame() {
    state = {
        ...createInitialState(),
        status: "running"
    };
    isPaused = false;
    renderState();
}

function togglePause() {
    if (state.status === "game-over") {
        return;
    }

    isPaused = !isPaused;
    renderState();
}

function renderBoard() {
    boardElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    boardElement.innerHTML = "";

    for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
        const cell = document.createElement("div");
        cell.className = "snake-cell";
        boardElement.appendChild(cell);
    }
}

function renderState() {
    const cells = boardElement.children;

    for (const cell of cells) {
        cell.className = "snake-cell";
    }

    state.snake.forEach((segment, index) => {
        const cell = getCell(segment.x, segment.y);
        if (cell) {
            cell.classList.add(index === 0 ? "snake-head" : "snake-body");
        }
    });

    if (state.food) {
        const foodCell = getCell(state.food.x, state.food.y);
        if (foodCell) {
            foodCell.classList.add("snake-food");
        }
    }

    scoreElement.textContent = String(state.score);
    highScoreElement.textContent = String(highScore);
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
    statusElement.textContent = getStatusMessage();
    popupScoreElement.textContent = String(state.score);
    popupHighScoreElement.textContent = String(highScore);
    gameOverPopup.hidden = state.status !== "game-over";
}

function getCell(x, y) {
    return boardElement.children[(y * GRID_SIZE) + x] ?? null;
}

function getStatusMessage() {
    if (state.status === "game-over") {
        return "Game over. Press restart or Enter to play again.";
    }

    if (isPaused) {
        return "Paused. Press space or Resume to continue.";
    }

    if (state.status === "ready") {
        return "Use arrow keys, WASD, or the buttons to start.";
    }

    return "Collect food, wrap around the edges, and do not run into yourself.";
}

function syncHighScore() {
    if (state.status !== "game-over") {
        return;
    }

    const nextHighScore = getNextHighScore(state.score, highScore);
    if (nextHighScore === highScore) {
        return;
    }

    highScore = nextHighScore;
    saveHighScore(highScore);
}

function loadHighScore() {
    try {
        const stored = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
        return normalizeHighScore(stored ?? DEFAULT_HIGH_SCORE);
    } catch {
        return DEFAULT_HIGH_SCORE;
    }
}

function saveHighScore(value) {
    try {
        window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(value));
    } catch {
        // Ignore storage failures and keep the in-memory score visible.
    }
}
