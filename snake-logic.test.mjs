import assert from "node:assert/strict";
import {
    GRID_SIZE,
    createFoodPosition,
    createInitialState,
    setDirection,
    stepState
} from "./snake-logic.mjs";

runTests();

function runTests() {
    testInitialState();
    testDirectionChangeRules();
    testMovement();
    testGrowthAndScoring();
    testEdgeWrap();
    testSelfCollision();
    testFoodPlacement();

    console.log("snake-logic tests passed");
}

function testInitialState() {
    const state = createInitialState(() => 0);

    assert.equal(state.gridSize, GRID_SIZE);
    assert.equal(state.status, "ready");
    assert.equal(state.score, 0);
    assert.equal(state.snake.length, 3);
    assert.deepEqual(state.snake[0], { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) });
    assert.deepEqual(state.food, { x: 0, y: 0 });
}

function testDirectionChangeRules() {
    const initial = createInitialState(() => 0);
    const turned = setDirection(initial, { x: 0, y: -1 });
    const blocked = setDirection(initial, { x: -1, y: 0 });

    assert.deepEqual(turned.pendingDirection, { x: 0, y: -1 });
    assert.deepEqual(blocked.pendingDirection, { x: 1, y: 0 });
}

function testMovement() {
    const initial = createInitialState(() => 0);
    const running = { ...initial, status: "running" };
    const next = stepState(running, () => 0);

    assert.deepEqual(next.snake[0], { x: 9, y: 8 });
    assert.equal(next.snake.length, 3);
    assert.equal(next.status, "running");
}

function testGrowthAndScoring() {
    const state = {
        gridSize: GRID_SIZE,
        snake: [
            { x: 2, y: 2 },
            { x: 1, y: 2 },
            { x: 0, y: 2 }
        ],
        direction: { x: 1, y: 0 },
        pendingDirection: { x: 1, y: 0 },
        food: { x: 3, y: 2 },
        score: 0,
        status: "running"
    };

    const next = stepState(state, () => 0);

    assert.equal(next.score, 1);
    assert.equal(next.snake.length, 4);
    assert.deepEqual(next.snake[0], { x: 3, y: 2 });
    assert.notDeepEqual(next.food, { x: 3, y: 2 });
}

function testEdgeWrap() {
    const state = {
        gridSize: GRID_SIZE,
        snake: [
            { x: GRID_SIZE - 1, y: 0 },
            { x: GRID_SIZE - 2, y: 0 },
            { x: GRID_SIZE - 3, y: 0 }
        ],
        direction: { x: 1, y: 0 },
        pendingDirection: { x: 1, y: 0 },
        food: { x: 0, y: 5 },
        score: 0,
        status: "running"
    };

    const next = stepState(state, () => 0);

    assert.equal(next.status, "running");
    assert.deepEqual(next.snake[0], { x: 0, y: 0 });
}

function testSelfCollision() {
    const state = {
        gridSize: GRID_SIZE,
        snake: [
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 2, y: 3 },
            { x: 1, y: 3 },
            { x: 1, y: 2 }
        ],
        direction: { x: 0, y: 1 },
        pendingDirection: { x: 0, y: 1 },
        food: { x: 10, y: 10 },
        score: 0,
        status: "running"
    };

    const next = stepState(state, () => 0);

    assert.equal(next.status, "game-over");
}

function testFoodPlacement() {
    const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
    ];

    const food = createFoodPosition(snake, 4, () => 0);

    assert.deepEqual(food, { x: 3, y: 0 });
}
