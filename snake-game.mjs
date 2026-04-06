import {
    GRID_SIZE,
    createInitialState,
    getDirectionForKey,
    setDirection,
    stepState
} from "./snake-logic.mjs";

const TICK_MS = 150;

const boardElement = document.getElementById("snake-board");
const scoreElement = document.getElementById("score");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart-button");
const pauseButton = document.getElementById("pause-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();
let isPaused = false;
let tickHandle = null;

renderBoard();
renderState();
startLoop();

window.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restartGame);
pauseButton.addEventListener("click", togglePause);

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
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
    statusElement.textContent = getStatusMessage();
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

    return "Collect food, avoid the walls, and do not run into yourself.";
}
