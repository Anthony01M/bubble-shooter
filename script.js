const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

const bubbleRadius = 20;
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
let bubbles = [];
let shooterBubble = createBubble(canvas.width / 2, canvas.height - bubbleRadius, getRandomColor());
let shooterDirection = { x: 0, y: 0 };
let gameOver = false;
let gameWon = false;

function createBubble(x, y, color) {
    return { x, y, color };
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.closePath();
}

function drawBubbles() {
    bubbles.forEach(drawBubble);
    drawBubble(shooterBubble);
}

function moveShooterBubble() {
    shooterBubble.x += shooterDirection.x;
    shooterBubble.y += shooterDirection.y;

    if (shooterBubble.x < bubbleRadius || shooterBubble.x > canvas.width - bubbleRadius) {
        shooterDirection.x = -shooterDirection.x;
    }
    if (shooterBubble.y < bubbleRadius) {
        shooterDirection.y = -shooterDirection.y;
    }
}

function detectCollision() {
    for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        const dx = bubble.x - shooterBubble.x;
        const dy = bubble.y - shooterBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bubbleRadius * 2) {
            bubbles.push(shooterBubble);
            checkForMatches(shooterBubble);
            shooterBubble = createBubble(canvas.width / 2, canvas.height - bubbleRadius, getRandomColor());
            shooterDirection = { x: 0, y: 0 };
            break;
        }
    }
}

function checkForMatches(bubble) {
    const matches = [];
    const visited = new Set();
    function floodFill(bubble) {
        if (visited.has(bubble)) return;
        visited.add(bubble);
        matches.push(bubble);
        const neighbors = getNeighbors(bubble);
        for (const neighbor of neighbors) {
            if (neighbor.color === bubble.color) {
                floodFill(neighbor);
            }
        }
    }
    floodFill(bubble);
    if (matches.length >= 3) {
        removeMatches(matches);
    }
}

function getNeighbors(bubble) {
    const neighbors = [];
    for (const otherBubble of bubbles) {
        const dx = otherBubble.x - bubble.x;
        const dy = otherBubble.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bubbleRadius * 2.1) {
            neighbors.push(otherBubble);
        }
    }
    return neighbors;
}

function removeMatches(matches) {
    bubbles = bubbles.filter(bubble => !matches.includes(bubble));
}

function initializeBubbles() {
    bubbles = [];
    const rows = 5;
    const cols = Math.floor(canvas.width / (bubbleRadius * 2));
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * bubbleRadius * 2 + bubbleRadius;
            const y = row * bubbleRadius * 2 + bubbleRadius;
            const color = getRandomColor();
            bubbles.push(createBubble(x, y, color));
        }
    }
}

function checkGameOver() {
    for (let i = 0; i < bubbles.length; i++) {
        if (bubbles[i].y + bubbleRadius >= canvas.height) {
            gameOver = true;
            return true;
        }
    }
    return false;
}

function checkGameWon() {
    if (bubbles.length === 0) {
        gameWon = true;
        return true;
    }
    return false;
}

function displayGameOver() {
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block';
}

function displayGameWon() {
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block';
}

function gameLoop() {
    if (gameOver) {
        displayGameOver();
        return;
    }

    if (gameWon) {
        displayGameWon();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBubbles();
    moveShooterBubble();
    detectCollision();

    if (checkGameOver()) {
        displayGameOver();
        return;
    }

    if (checkGameWon()) {
        displayGameWon();
        return;
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (event) => {
    if (gameOver || gameWon) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - shooterBubble.x;
    const dy = mouseY - shooterBubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    shooterDirection = {
        x: (dx / distance) * 5,
        y: (dy / distance) * 5
    };
});

restartButton.addEventListener('click', () => {
    gameOver = false;
    gameWon = false;
    shooterBubble = createBubble(canvas.width / 2, canvas.height - bubbleRadius, getRandomColor());
    shooterDirection = { x: 0, y: 0 };
    initializeBubbles();
    restartButton.style.display = 'none';
    gameLoop();
});

initializeBubbles();
gameLoop();