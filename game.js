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
let coinSpeed = 3; // Initial coin speed

// Boom
const booms = [];
const boomSize = 20;

// Blinking Coins
const blinkingCoins = [];
const blinkCoinSize = 25;
let blinkCoinSpeed = 2; // Speed of blinking coins

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
        speed: coinSpeed,
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

// Create a blinking coin
function createBlinkingCoin() {
    const blinkCoin = {
        x: Math.random() > 0.5 ? 0 : canvas.width, // Start from left or right corner
        y: 0,
        size: blinkCoinSize,
        color: "cyan",
        speed: blinkCoinSpeed,
        directionX: Math.random() > 0.5 ? 1 : -1, // Move left or right
        directionY: 1, // Move down
        blinkTimer: 0, // Timer for blinking effect
        visible: true, // Toggle visibility for blinking
    };
    blinkingCoins.push(blinkCoin);
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

// Draw the blinking coins
function drawBlinkingCoins() {
    for (let i = 0; i < blinkingCoins.length; i++) {
        if (blinkingCoins[i].visible) {
            ctx.fillStyle = blinkingCoins[i].color;
            ctx.beginPath();
            ctx.arc(blinkingCoins[i].x + blinkingCoins[i].size / 2, blinkingCoins[i].y + blinkingCoins[i].size / 2, blinkingCoins[i].size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Handle player movement with keyboard
function handleKeyboardInput(event) {
    if (gameOver) return; // Stop input if game is over

    if (event.key === "ArrowLeft") {
        player.velocityX = -player.speed; // Move left
    }
    if (event.key === "ArrowRight") {
        player.velocityX = player.speed; // Move right
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

// Handle player movement with touch
function handleTouchMovement(event) {
    if (gameOver) return; // Stop movement if game is over

    // Get touch X position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;

    // Update player position
    player.x = touchX - player.width / 2;

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

            // Increase coin speed 2x every 20 points
            if (score % 20 === 0) {
                coinSpeed *= 2; // Double the coin speed
                createBlinkingCoin(); // Create a blinking coin
            }
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

    // Check blinking coin collisions
    for (let i = 0; i < blinkingCoins.length; i++) {
        if (
            player.x < blinkingCoins[i].x + blinkingCoins[i].size &&
            player.x + player.width > blinkingCoins[i].x &&
            player.y < blinkingCoins[i].y + blinkingCoins[i].size &&
            player.y + player.height > blinkingCoins[i].y
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

    // Move blinking coins diagonally
    for (let i = 0; i < blinkingCoins.length; i++) {
        blinkingCoins[i].x += blinkingCoins[i].directionX * blinkCoinSpeed; // Move left or right
        blinkingCoins[i].y += blinkingCoins[i].directionY * blinkCoinSpeed; // Move down

        // Toggle visibility for blinking effect
        blinkingCoins[i].blinkTimer++;
        if (blinkingCoins[i].blinkTimer % 20 === 0) {
            blinkingCoins[i].visible = !blinkingCoins[i].visible;
        }

        // Remove blinking coins that go off the screen
        if (
            blinkingCoins[i].y > canvas.height ||
            blinkingCoins[i].x < 0 ||
            blinkingCoins[i].x > canvas.width
        ) {
            blinkingCoins.splice(i, 1);
        }
    }

    // Handle player movement
    if (!isTouchDevice()) {
        // Apply friction for keyboard movement
        player.velocityX *= 0.9;
        player.x += player.velocityX;
    }

    // Prevent the player from going out of bounds
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.velocityX = 0;
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

// Check if the device is a touch device
function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Game loop
function gameLoop() {
    clearCanvas();
    drawPlayer();
    drawCoins();
    drawBooms();
    drawBlinkingCoins();
    drawScore();

    if (gameOver) {
        showGameOverScreen();
    } else {
        update();
    }

    requestAnimationFrame(gameLoop);
}

// Event listeners for controls
if (isTouchDevice()) {
    // Touch controls for mobile devices
    canvas.addEventListener("touchmove", handleTouchMovement);
} else {
    // Keyboard and mouse controls for desktop
    document.addEventListener("keydown", handleKeyboardInput);
    canvas.addEventListener("mousemove", handleMouseMovement);
}

// Start creating coins and booms
coinInterval = setInterval(createCoin, 1000); // Store coin interval ID
boomInterval = setInterval(createBoom, 2000); // Store boom interval ID

// Start the game loop
gameLoop();
