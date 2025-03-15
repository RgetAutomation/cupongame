const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    color: "blue",
    velocityX: 0,
};

// Coins
const coins = [];
const coinSize = 20;

// Boom
const booms = [];
const boomSize = 20;

let score = 0;
let gameOver = false;

// Store interval IDs
let coinInterval;
let boomInterval;

// Create a coin
function createCoin() {
    const coin = {
        x: Math.random() * (canvas.width - coinSize),
        y: 0,
        size: coinSize,
        color: "gold",
        speed: 3,
    };
    coins.push(coin);
}

// Create a boom
function createBoom() {
    const boom = {
        x: Math.random() * (canvas.width - boomSize),
        y: 0,
        size: boomSize,
        color: "red",
        speed: 3,
    };
    booms.push(boom);
}

// Draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw the coins
function drawCoins() {
    for (let i = 0; i < coins.length; i++) {
        ctx.fillStyle = coins[i].color;
        ctx.beginPath();
        ctx.arc(coins[i].x + coins[i].size / 2, coins[i].y + coins[i].size / 2, coins[i].size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw the booms
function drawBooms() {
    for (let i = 0; i < booms.length; i++) {
        ctx.fillStyle = booms[i].color;
        ctx.beginPath();
        ctx.arc(booms[i].x + booms[i].size / 2, booms[i].y + booms[i].size / 2, booms[i].size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Handle player movement with mouse
function handleMouseMovement(event) {
    if (gameOver) return; // Stop movement if game is over

    // Get mouse X position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    // Update player position
    player.x = mouseX - player.width / 2;

    // Prevent the player from going out of bounds
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Check for collisions
function checkCollisions() {
    // Check coin collisions
    for (let i = 0; i < coins.length; i++) {
        if (
            player.x < coins[i].x + coins[i].size &&
            player.x + player.width > coins[i].x &&
            player.y < coins[i].y + coins[i].size &&
            player.y + player.height > coins[i].y
        ) {
            coins.splice(i, 1); // Remove the coin
            score++; // Increase score
        }
    }

    // Check boom collisions
    for (let i = 0; i < booms.length; i++) {
        if (
            player.x < booms[i].x + booms[i].size &&
            player.x + player.width > booms[i].x &&
            player.y < booms[i].y + booms[i].size &&
            player.y + player.height > booms[i].y
        ) {
            gameOver = true; // End the game
            stopGame(); // Stop the game
            showGameOverScreen(); // Show game over screen
        }
    }
}

// Stop the game
function stopGame() {
    clearInterval(coinInterval); // Stop creating coins
    clearInterval(boomInterval); // Stop creating booms
}

// Update the game state
function update() {
    if (gameOver) return; // Stop updates if game is over

    // Move coins down
    for (let i = 0; i < coins.length; i++) {
        coins[i].y += coins[i].speed;
        // Remove coins that go off the screen
        if (coins[i].y > canvas.height) {
            coins.splice(i, 1);
        }
    }

    // Move booms down
    for (let i = 0; i < booms.length; i++) {
        booms[i].y += booms[i].speed;
        // Remove booms that go off the screen
        if (booms[i].y > canvas.height) {
            booms.splice(i, 1);
        }
    }

    // Check for collisions
    checkCollisions();
}

// Draw the score
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

// Show game over screen
function showGameOverScreen() {
    // Draw game over text
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = "24px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 40);

    // Calculate coupon value (20 points = $1)
    const couponValue = (score / 20).toFixed(2);
    ctx.fillText("Coupon Value: ₹" + couponValue, canvas.width / 2 - 100, canvas.height / 2 + 80);

    // Show claim coupon button
    const button = document.createElement("button");
    button.innerText = "Claim Coupon";
    button.style.position = "absolute";
    button.style.left = "50%";
    button.style.top = "70%";
    button.style.transform = "translate(-50%, -50%)";
    button.style.padding = "10px 20px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";
    button.addEventListener("click", () => claimCoupon(couponValue));
    document.body.appendChild(button);
}

// Claim coupon and send via WhatsApp
function claimCoupon(couponValue) {
    const phoneNumber = "919330733857"; // Include country code (e.g., 91 for India)
    const message = `I just scored ${score} points in the game! My coupon value is ₹${couponValue}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
    clearCanvas();
    drawPlayer();
    drawCoins();
    drawBooms();
    drawScore();

    if (gameOver) {
        showGameOverScreen();
    } else {
        update();
    }

    requestAnimationFrame(gameLoop);
}

// Event listener for mouse movement
canvas.addEventListener("mousemove", handleMouseMovement);

// Start creating coins and booms
coinInterval = setInterval(createCoin, 1000); // Store coin interval ID
boomInterval = setInterval(createBoom, 2000); // Store boom interval ID

// Start the game loop
gameLoop();
