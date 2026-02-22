const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Lane positions
const laneWidth = canvas.width / 3;
const lanes = [
    laneWidth / 2,
    laneWidth * 1.5,
    laneWidth * 2.5
];
let currentLane = 1;

// Player car
const car = {
    width: 100,
    height: 110,
    y: 470
};

// Game state
let enemies = [];
let enemySpeed = 4;
let gameState = "menu"; 
// "menu" | "playing" | "gameover"
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
// Load Images
const playerImg = new Image();
playerImg.src = "Audi.png";

const enemyImages = [];
const img1 = new Image();
img1.src = "Ambulance.png";
const img2 = new Image();
img2.src = "Car1.png";
const img3 = new Image();
img3.src = "Police.png";

enemyImages.push(img1, img2, img3);

// Draw Road
function drawRoad() {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(133, 0);
    ctx.lineTo(133, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(266, 0);
    ctx.lineTo(266, 600);
    ctx.stroke();
}

// Draw Player
function drawCar() {
    ctx.drawImage(
        playerImg,
        lanes[currentLane] - car.width / 2,
        car.y,
        car.width,
        car.height
    );
}

// Draw Enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(
            enemy.img,
            lanes[enemy.lane] - enemy.width / 2,
            enemy.y,
            enemy.width,
            enemy.height
        );
    });
}

// Draw Score

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, 10, 55);
}

// Spawn first wave
//dlted

// Collision

function checkCollision() {

    const hitboxPaddingX = 25;
    const hitboxPaddingY = 15;

    const playerX = lanes[currentLane] - car.width / 2 + hitboxPaddingX;
    const playerWidth = car.width - hitboxPaddingX * 2;

    const playerY = car.y + hitboxPaddingY;
    const playerHeight = car.height - hitboxPaddingY * 2;

    for (let enemy of enemies) {

        const enemyX = lanes[enemy.lane] - enemy.width / 2 + hitboxPaddingX;
        const enemyWidth = enemy.width - hitboxPaddingX * 2;

        const enemyY = enemy.y + hitboxPaddingY;
        const enemyHeight = enemy.height - hitboxPaddingY * 2;

        if (
            playerX < enemyX + enemyWidth &&
            playerX + playerWidth > enemyX &&
            playerY < enemyY + enemyHeight &&
            playerY + playerHeight > enemyY
        ) {
            if (score>highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        gameState="gameover";
        }
    }
}


function spawnEnemy() {

    // Find currently occupied lanes near top area
    let blockedLanes = [];

    enemies.forEach(enemy => {
        if (enemy.y < 200) {   // only check enemies near spawn area
            blockedLanes.push(enemy.lane);
        }
    });

    // If already 2 lanes blocked, don't block the 3rd
    if (blockedLanes.length >= 2) return;

    let lane = Math.floor(Math.random() * 3);

    // If lane already blocked near top, skip
    if (blockedLanes.includes(lane)) return;

    enemies.push({
        width: 100,
        height: 110,
        lane: lane,
        y: -150,
        img: enemyImages[Math.floor(Math.random() * enemyImages.length)]
    });
}

function resetGame() {
    enemies = [];
    enemySpeed = 4;
    score = 0;
    currentLane = 1;
    spawnEnemy();
    gameState = "playing";
}

// Keyboard

document.addEventListener("keydown", function (e) {

    //Reset High Scoreee
    if (e.key.toLowerCase() === "h") {
        highScore=0;
        localStorage.removeItem("highScore");
    }

    if (gameState === "menu" && e.key === "Enter") {
        resetGame();
        return;
    }

    if (gameState === "gameover" && e.key.toLowerCase() === "r") {
        resetGame();
        return;
    }

    if (gameState === "playing") {
        if (e.key === "ArrowLeft" && currentLane > 0) {
            currentLane--;
        }
        if (e.key === "ArrowRight" && currentLane < 2) {
            currentLane++;
        }
    }
});

// Game Loop
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    // MENU SCREEN
    if (gameState === "menu") {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("2D CAR RACING", canvas.width / 2, 250);
        ctx.font = "20px Arial";
        ctx.fillText("Press ENTER to Start", canvas.width / 2, 300);
        ctx.textAlign = "left";
        requestAnimationFrame(gameLoop);
        return;
    }

    // PLAYING
    if (gameState === "playing") {

        // Random spawn
    if (Math.random() < 0.02) {
    spawnEnemy();
}

        drawCar();
        drawEnemies();
        drawScore();

        for (let i = enemies.length - 1; i >= 0; i--) {

    enemies[i].y += enemySpeed;

    if (enemies[i].y > canvas.height) {

        enemies.splice(i, 1);
        score += 5;

        if (enemySpeed < 12) {
            enemySpeed += 0.1;
        }
    }
}

        checkCollision();
    }

    // GAME OVER SCREEN
    if (gameState === "gameover") {
        //drawCar();
        //drawEnemies();

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 220);

        ctx.font = "22px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, 270);
        ctx.fillText("High Score: " + highScore, canvas.width / 2, 305);

        ctx.fillText("Press R to Retry", canvas.width / 2, 360);
        ctx.fillText("Press H to Reset High Score", canvas.width / 2, 395);
        ctx.textAlign = "left";
    }

    requestAnimationFrame(gameLoop);
}
// Start game
gameLoop();
