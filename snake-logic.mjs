export const GRID_SIZE = 16;

const STARTING_SNAKE = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 }
];

const STARTING_DIRECTION = { x: 1, y: 0 };

export function createInitialState(random = Math.random) {
    const snake = cloneSnake(STARTING_SNAKE);

    return {
        gridSize: GRID_SIZE,
        snake,
        direction: { ...STARTING_DIRECTION },
        pendingDirection: { ...STARTING_DIRECTION },
        food: createFoodPosition(snake, GRID_SIZE, random),
        score: 0,
        status: "ready"
    };
}

export function setDirection(state, nextDirection) {
    if (!isAxisAligned(nextDirection)) {
        return state;
    }

    if (isOppositeDirection(state.direction, nextDirection)) {
        return state;
    }

    return {
        ...state,
        pendingDirection: { ...nextDirection }
    };
}

export function stepState(state, random = Math.random) {
    if (state.status !== "running") {
        return state;
    }

    const direction = { ...state.pendingDirection };
    const head = state.snake[0];
    const nextHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    const foundFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
    const occupiedSnake = foundFood ? state.snake : state.snake.slice(0, -1);

    if (isOutOfBounds(nextHead, state.gridSize) || hitsSnake(nextHead, occupiedSnake)) {
        return {
            ...state,
            direction,
            pendingDirection: direction,
            status: "game-over"
        };
    }

    const nextSnake = [nextHead, ...state.snake];

    if (!foundFood) {
        nextSnake.pop();
    }

    return {
        ...state,
        snake: nextSnake,
        direction,
        pendingDirection: direction,
        food: foundFood ? createFoodPosition(nextSnake, state.gridSize, random) : state.food,
        score: foundFood ? state.score + 1 : state.score,
        status: "running"
    };
}

export function createFoodPosition(snake, gridSize, random = Math.random) {
    const openCells = [];

    for (let y = 0; y < gridSize; y += 1) {
        for (let x = 0; x < gridSize; x += 1) {
            if (!snake.some((segment) => segment.x === x && segment.y === y)) {
                openCells.push({ x, y });
            }
        }
    }

    if (openCells.length === 0) {
        return null;
    }

    const index = Math.floor(random() * openCells.length);
    return openCells[index];
}

export function getDirectionForKey(key) {
    const normalized = key.toLowerCase();

    if (normalized === "arrowup" || normalized === "w") {
        return { x: 0, y: -1 };
    }

    if (normalized === "arrowdown" || normalized === "s") {
        return { x: 0, y: 1 };
    }

    if (normalized === "arrowleft" || normalized === "a") {
        return { x: -1, y: 0 };
    }

    if (normalized === "arrowright" || normalized === "d") {
        return { x: 1, y: 0 };
    }

    return null;
}

function cloneSnake(snake) {
    return snake.map((segment) => ({ ...segment }));
}

function isAxisAligned(direction) {
    const x = Math.abs(direction.x);
    const y = Math.abs(direction.y);

    return x + y === 1;
}

function isOppositeDirection(current, next) {
    return current.x + next.x === 0 && current.y + next.y === 0;
}

function isOutOfBounds(position, gridSize) {
    return (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= gridSize ||
        position.y >= gridSize
    );
}

function hitsSnake(position, snake) {
    return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
