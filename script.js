// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Player paddle (left side)
const paddle = {
    width: 10,
    height: 80,
    speed: 6,
    x: 20,
    y: CANVAS_HEIGHT / 2 - 40,
};

// Computer paddle (right side)
const computerPaddle = {
    width: 10,
    height: 80,
    speed: 4.5,
    x: CANVAS_WIDTH - 30,
    y: CANVAS_HEIGHT / 2 - 40,
};

// Ball object
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 8,
    speedX: 4,
    speedY: 4,
};

// Score
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};

// Mouse tracking for player paddle control
let mouseY = CANVAS_HEIGHT / 2;

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_HEIGHT / rect.height;
    mouseY = (e.clientY - rect.top) * scaleY;
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle (ball)
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw net (center line)
function drawNet() {
    for (let i = 0; i < CANVAS_HEIGHT; i += 15) {
        drawRect(CANVAS_WIDTH / 2 - 1, i, 2, 10, '#444');
    }
}

// Update player paddle position
function updatePlayerPaddle() {
    // Mouse control
    paddle.y = mouseY - paddle.height / 2;

    // Arrow keys control
    if (keys['ArrowUp'] || keys['w']) {
        paddle.y -= paddle.speed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        paddle.y += paddle.speed;
    }

    // Keep paddle in bounds
    if (paddle.y < 0) {
        paddle.y = 0;
    }
    if (paddle.y + paddle.height > CANVAS_HEIGHT) {
        paddle.y = CANVAS_HEIGHT - paddle.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;

    // Simple AI: follow the ball
    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Keep paddle in bounds
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > CANVAS_HEIGHT) {
        computerPaddle.y = CANVAS_HEIGHT - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
        ball.speedY = -ball.speedY;
        // Prevent ball from getting stuck
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
            ball.y = CANVAS_HEIGHT - ball.radius;
        }
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = paddle.x + paddle.width + ball.radius;
        // Add some spin based on where the ball hits the paddle
        const deltaY = ball.y - (paddle.y + paddle.height / 2);
        ball.speedY = (deltaY / (paddle.height / 2)) * 5;
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = computerPaddle.x - ball.radius;
        // Add some spin based on where the ball hits the paddle
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.speedY = (deltaY / (computerPaddle.height / 2)) * 5;
    }

    // Ball goes out of bounds (left side - player loses)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }

    // Ball goes out of bounds (right side - player wins)
    if (ball.x + ball.radius > CANVAS_WIDTH) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.speedY = (Math.random() - 0.5) * 4;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw everything
function draw() {
    // Clear canvas
    drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#1a1a2e');

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#00ff88');
    drawRect(
        computerPaddle.x,
        computerPaddle.y,
        computerPaddle.width,
        computerPaddle.height,
        '#ff0055'
    );

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();