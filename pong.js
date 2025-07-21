const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12, paddleHeight = 90;
const ballSize = 14;

const playerX = 20;
const aiX = canvas.width - paddleWidth - 20;

let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;

let ballX = canvas.width / 2 - ballSize / 2;
let ballY = canvas.height / 2 - ballSize / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() * 2 - 1);

const playerSpeed = 10;
const aiSpeed = 5;
let playerTargetY = playerY;

let playerScore = 0;
let aiScore = 0;

function resetBall() {
    ballX = canvas.width / 2 - ballSize / 2;
    ballY = canvas.height / 2 - ballSize / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    for (let y = 0; y < canvas.height; y += 40) {
        drawRect(canvas.width / 2 - 2, y, 4, 20, '#888');
    }
}

function drawScore() {
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
    ctx.fillText(aiScore, canvas.width / 2 + 35, 50);
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, '#111');
    drawNet();
    drawScore();
    drawRect(playerX, playerY, paddleWidth, paddleHeight, '#0f0');
    drawRect(aiX, aiY, paddleWidth, paddleHeight, '#f00');
    drawCircle(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2, '#fff');
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom
    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSize >= canvas.height) {
        ballY = canvas.height - ballSize;
        ballSpeedY = -ballSpeedY;
    }

    // Ball collision with player paddle
    if (
        ballX <= playerX + paddleWidth &&
        ballY + ballSize >= playerY &&
        ballY <= playerY + paddleHeight &&
        ballX >= playerX
    ) {
        ballX = playerX + paddleWidth;
        ballSpeedX = -ballSpeedX;
        // Add some "english" based on where it hit the paddle
        let collidePoint = (ballY + ballSize / 2) - (playerY + paddleHeight / 2);
        ballSpeedY = collidePoint * 0.21;
    }

    // Ball collision with AI paddle
    if (
        ballX + ballSize >= aiX &&
        ballY + ballSize >= aiY &&
        ballY <= aiY + paddleHeight &&
        ballX + ballSize <= aiX + paddleWidth + ballSize
    ) {
        ballX = aiX - ballSize;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY + ballSize / 2) - (aiY + paddleHeight / 2);
        ballSpeedY = collidePoint * 0.21;
    }

    // Score!
    if (ballX < 0) {
        aiScore += 1;
        resetBall();
    } else if (ballX + ballSize > canvas.width) {
        playerScore += 1;
        resetBall();
    }

    // AI movement (simple: follow ball with a little delay)
    let aiCenter = aiY + paddleHeight / 2;
    if (aiCenter < ballY + ballSize / 2 - 10) {
        aiY += aiSpeed;
    } else if (aiCenter > ballY + ballSize / 2 + 10) {
        aiY -= aiSpeed;
    }
    aiY = clamp(aiY, 0, canvas.height - paddleHeight);

    // Player paddle movement towards target
    if (Math.abs(playerY - playerTargetY) > playerSpeed) {
        playerY += playerY < playerTargetY ? playerSpeed : -playerSpeed;
    } else {
        playerY = playerTargetY;
    }
    playerY = clamp(playerY, 0, canvas.height - paddleHeight);
}

canvas.addEventListener('mousemove', function (e) {
    // Mouse Y relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerTargetY = clamp(mouseY - paddleHeight / 2, 0, canvas.height - paddleHeight);
});

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();