// import drawRoad from './road.js';

let isAccelerating = false;
let isBraking = false;
let isMovingLeft = false;
let isMovingRight = false;

let countdown = 3;
let countdownInterval = null;

let advertisementBanners = [];
const advertisementMessages = [
    "Future Skills Ahead!", "Drive Safely!", "Enjoy the View!",
    "RTB Competition!", "Visit Rwanda!"
];

// Advertisement banner dimensions (accessible by both update and draw functions)
const advertisementBannerHeight = 20;
const advertisementBannerWidth = 320; // Make banner wider than road width

let buildingOffset = 0;

const buildingMargin = 60;
const numBuildings = 6;
const buildingBaseY = 100;
const buildingSpacing = 200;
let buildings = [];

const treeMargin = 80;
const numTrees = 20;
const treeBaseY = 120;
const treeSpacing = 80;
let trees = [];

const startY = canvas.height / 3;

const buildingNames = ['RP', 'TVET', 'Koica', 'JICA', 'AFD', 'LuxDev', 'Kepler College'];
const buildingColors = ['#4682B4', '#FF69B4', '#9370DB', '#00CED1', '#FFD700', '#8B4513', '#4A90E2'];

const universityNames = ['RP Tumba', 'RP Kigali', 'RP Gishari', 'RP Cyitabi', 'RP Musanze', 'RP Ngoma', 'RP Kigali'];
const universityColors = ['#2E8B57', '#1E90FF', '#8A2BE2', '#FF8C00', '#B22222', '#228B22', '#FFD700'];

function initBuildings() {
    buildings = [];
    for (let i = 0; i < numBuildings; i++) {
        const side = i % 2 === 0 ? 'left' : 'right';
        const width = 80 + Math.random() * 40;
        const height = 120 + Math.random() * 40;
        buildings.push({
            side,
            width,
            height,
            y: startY - i * buildingSpacing
        });
    }
}

function initTrees() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const roadLeft = baseX - roadWidth / 2;
    const roadRight = baseX + roadWidth / 2;
    trees = [];
    for (let i = 0; i < numTrees; i++) {
        const side = i % 2 === 0 ? 'left' : 'right';
        const size = 15 + Math.random() * 10;
        let x;
        if (side === 'left') {
            x = roadLeft - treeMargin - 30 - Math.random() * 120;
        } else {
            x = roadRight + treeMargin + 30 + Math.random() * 120;
        }
        trees.push({
            side,
            size,
            x,
            y: startY - i * treeSpacing
        });
    }
}

function handleInput(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX !== undefined ? event.clientX - rect.left : event.touches[0].clientX - rect.left;
    const y = event.clientY !== undefined ? event.clientY - rect.top + 200 : event.touches[0].clientY - rect.top + 200;

    if (gameState === 'menu') {
        // Start countdown on any click/touch in the menu state
        if (countdownInterval === null) {
            gameState = 'countdown';
            countdown = 3;
            countdownInterval = setInterval(() => {
                countdown--;
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    startGame(); // Transition to playing after countdown
                }
            }, 1000);
        }
        return; // Prevent other actions while in menu
    }

    if (gameState === 'gameover' || gameState === 'victory') {
        // Transition to menu on any click/touch in gameover or victory state
        gameState = 'menu';
        resetGame();
        return; // Prevent other actions after transitioning
    }

    // Only process driving input if in playing state
    if (gameState === 'playing') {
        isMovingLeft = x < canvas.width / 2;
        isMovingRight = x >= canvas.width / 2;
        isAccelerating = y < canvas.height / 2;
        isBraking = y >= canvas.height / 2;
    }
}

function resetInput() {
    isAccelerating = false;
    isBraking = false;
    isMovingLeft = false;
    isMovingRight = false;
}

function startGame() {
    gameState = 'playing';
    resetGame(); // Reset game state when starting
}

function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.speed = 0;
    player.lane = 1;
    level = 1;
    distance = 0;
    score = 0;
    gameTime = 0;
    hillOffset = 0;
    curveOffset = 0; // Reset curve offset as well
    curveDirection = 0;
    hillDirection = 0;
    aiCars = [];
    obstacles = [];
    particles = [];
    advertisementBanners = []; // Clear advertisement banners
    lastBannerDistance = -1; // Reset lastBannerDistance to ensure first banner spawns correctly
    // Signposts are re-initialized in initGame, so no need to clear here
    initBuildings();
    initTrees();
}

function drawCountdown() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw animating circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80; // Radius of the circle
    const lineWidth = 10; // Thickness of the circle line
    const animationSpeed = 0.1; // Speed of the animation

    ctx.save(); // Save context state before animation

    // Animate scale based on countdown value
    const scale = 1 + (3 - countdown) * 0.1; // Scale up as countdown decreases
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Draw the circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // White with some transparency
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    // Animate the circle arc (optional, but adds more animation)
    const endAngle = (countdown % 1) * Math.PI * 2; // Animate based on fractional part of countdown
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); // Full circle for now
    ctx.stroke();

    ctx.restore(); // Restore context state

    if (countdown > 0) {
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    } else {
        ctx.fillText('GO!', canvas.width / 2, canvas.height / 2);
    }
}

function drawAdvertisementBanners() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    const poleTopWidth = 10;
    const poleBottomWidth = 80;

    // Save context state for banner drawing
    ctx.save();

    // Set global composite operation to ensure banners are drawn on top
    ctx.globalCompositeOperation = 'source-over';

    advertisementBanners.forEach(banner => {
        // Calculate perspective scaling factor
        const scaleFactor = (banner.y + 100) / (canvas.height + 100);
        const effectiveScaleFactor = Math.max(0.4, scaleFactor);

        // Calculate road center and edges at banner's y position
        const i = (canvas.height - banner.y) / segmentHeight;
        const roadXOffsetAtBannerY = curveOffset * 0.01 * i;
        const roadCenterAtBannerY = baseX + roadXOffsetAtBannerY * effectiveScaleFactor;
        const roadLeftAtBannerY = roadCenterAtBannerY - (roadWidth / 2) * effectiveScaleFactor;
        const roadRightAtBannerY = roadCenterAtBannerY + (roadWidth / 2) * effectiveScaleFactor;

        // Calculate banner perspective width using constant width
        const bannerPerspectiveWidth = advertisementBannerWidth;
        const bannerPerspectiveHeight = advertisementBannerHeight;

        // Position banner centered on the road with perspective
        const bannerPerspectiveX = roadCenterAtBannerY - bannerPerspectiveWidth / 2;

        const bannerBottomY = banner.y + bannerPerspectiveHeight;

        // Draw banner rectangle with slight transparency
        ctx.fillStyle = 'rgba(255, 255, 0, 0.95)';
        ctx.fillRect(bannerPerspectiveX, banner.y, bannerPerspectiveWidth, bannerPerspectiveHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3 * effectiveScaleFactor;
        ctx.strokeRect(bannerPerspectiveX, banner.y, bannerPerspectiveWidth, bannerPerspectiveHeight);

        // Draw advertisement text
        ctx.fillStyle = '#000';
        ctx.font = `bold ${20 * effectiveScaleFactor}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(banner.message, roadCenterAtBannerY, banner.y + bannerPerspectiveHeight / 2);

        // Draw yellow pivots above the banner
        ctx.fillStyle = '#FFFF00';
        const pivotWidth = 90;
        const pivotHeight = 45;

        // Left pivot above banner
        const leftUpperPivotX = bannerPerspectiveX + bannerPerspectiveWidth * 0.25 - pivotWidth / 2;
        const leftUpperPivotY = banner.y - pivotHeight;
        ctx.fillRect(leftUpperPivotX, leftUpperPivotY, pivotWidth, pivotHeight);

        // Right pivot above banner
        const rightUpperPivotX = bannerPerspectiveX + bannerPerspectiveWidth * 0.75 - pivotWidth / 2;
        const rightUpperPivotY = banner.y - pivotHeight;
        ctx.fillRect(rightUpperPivotX, rightUpperPivotY, pivotWidth, pivotHeight);
    });

    // Restore context
    ctx.restore();
}

let lastBannerDistance = -1; // To track when to spawn the next banner - initialized to -1

let currentBannerIndex = 0;
let bannerSpawnCooldown = 120; // frames between banners (adjust as needed)
let bannerSpawnTimer = 0;

function updateGame() {
    if (gameState !== 'playing') return;

    // Handle player input for moving to left
    if (keys['ArrowLeft'] || keys['KeyA'] || isMovingLeft) {
        if (player.lane > 0) {
            const targetX = lanePositions[player.lane - 1];
            player.x = Math.max(lanePositions[0] + player.width / 2, player.x - 4);
            if (player.x <= targetX + 10) {
                player.lane--;
            }
        }
    }

    // Handle player input for moving to right
    if (keys['ArrowRight'] || keys['KeyD'] || isMovingRight) {
        if (player.lane < 2) {
            const targetX = lanePositions[player.lane + 1];
            player.x = Math.min(lanePositions[2] - player.width / 2, player.x + 4);
            if (player.x >= targetX - 10) {
                player.lane++;
            }
        }
    }

    // Handle player input for moving up
    if (keys['ArrowUp'] || keys['KeyW'] || isAccelerating) {
        player.speed = Math.min(player.maxSpeed, player.speed + player.acceleration);
        if (soundEnabled && Math.random() < 0.1) sounds.engine();
    }

    // Handle player input for braking and decelerating
    if (keys['ArrowDown'] || keys['KeyS'] || keys['Space'] || isBraking) {
        player.speed = Math.max(0, player.speed - player.acceleration * 1.5);
        if (soundEnabled && Math.random() < 0.05) sounds.brake();
    }

    // Apply friction
    player.speed *= player.friction;

    // Update distance and score according to speed
    distance += player.speed * 0.5;
    score += Math.floor(player.speed * 0.2);

    //increase score based on speed

    if (player.speed > 6) {
        score += 2;
    }
    //increase score based on distance

    if (Math.floor(distance) % 50 === 0 && Math.floor(distance) > 0) {
        score += 25;
    }

    if (Math.floor(distance) % 100 === 0 && Math.floor(distance) > 0) {
        score += 50;
    }

    //victory condition            
    if (distance >= 1500 && !freeRideMode) {
        gameState = 'victory';
        sounds.victory();
        saveHighScore();
        return;
    }

    // Update and filter advertisement banners
    advertisementBanners = advertisementBanners.filter(banner => {
        banner.y += player.speed; // Move banner down based on player speed
        return banner.y < canvas.height + 50;
    });

    // Banner spawning logic: spawn a new banner every cooldown interval
    if (bannerSpawnTimer <= 0) {
        advertisementBanners.push({
            y: 0,
            message: advertisementMessages[currentBannerIndex]
        });
        currentBannerIndex++;
        if (currentBannerIndex >= advertisementMessages.length) {
            currentBannerIndex = 0; // Loop banners if desired
        }
        bannerSpawnTimer = bannerSpawnCooldown;
    } else {
        bannerSpawnTimer--;
    }

    //obstacles and  AI cars spawning logic
    if (Math.random() < 0.02 + level * 0.01) {
        spawnAICar();
    }


    if (Math.random() < 0.005 + level * 0.002) {
        spawnObstacle();
    }


    updateAICars();


    updateObstacles();


    updateSignposts();

    // Check for collisions with AI cars
    aiCars.forEach((car, index) => {
        if (Math.abs(player.x - car.x) < 25 && Math.abs(player.y - car.y) < 50) {
            sounds.collision();
            createParticles(player.x, player.y, '#FF4500', 15); //color hex from google color picker
            if (!freeRideMode) {
                gameState = 'gameover'; // Set game state to game over
                saveHighScore();
            }
        }
    });

    // Check for collisions with obstacles
    obstacles.forEach((obs, index) => {
        if (Math.abs(player.x - obs.x) < 20 && Math.abs(player.y - obs.y) < 30) {
            sounds.collision();
            createParticles(obs.x, obs.y, '#8B4513', 10);
            if (!freeRideMode) {
                player.speed *= 0.5; // Reduce speed only if not in free ride mode
                score = Math.max(0, score - 50); // Reduce score only if not in free ride mode
            }
            obstacles.splice(index, 1);
        }
    });

    updateParticles();
    gameTime++;

    // Clamp player.x to road boundaries
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    // Calculate the segment index for the player's y position
    const i = (canvas.height - player.y) / segmentHeight;
    const perspectiveFactor = 0.8;
    const perspectiveScale = 1 - (i / segments) * perspectiveFactor;
    const currentRoadWidth = roadWidth * perspectiveScale;
    const roadXOffset = curveOffset * 0.01 * i;
    const roadLeft = baseX - currentRoadWidth / 2 + roadXOffset;
    const roadRight = baseX + currentRoadWidth / 2 + roadXOffset;
    // Clamp player's x so the car stays fully on the road
    player.x = Math.max(roadLeft + player.width / 2, Math.min(roadRight - player.width / 2, player.x));
}

function getVanishingPoint() {
    // Use the same logic as the top of the road in drawRoad
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const t = 1; // top segment
    // Calculate offsets for the top segment
    let xOffset = curveOffset * 0.01 * segments;
    const width = roadWidth * (1 - t);
    const maxOffset = (canvas.width - width) / 2;
    xOffset = Math.max(-maxOffset, Math.min(maxOffset, xOffset));
    const vanishingX = baseX + xOffset;
    const vanishingY = canvas.height / 3;
    return { x: vanishingX, y: vanishingY };
}

function spawnAICar() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const laneWidth = roadWidth / 3;
    const lanes = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];

    // Get current vanishing point
    const vanishing = getVanishingPoint();

    // Spawn car at the current vanishing point
    aiCars.push({
        x: vanishing.x,
        y: vanishing.y,
        width: 30,
        height: 60,
        speed: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        plateNumber: `AI-${Math.floor(Math.random() * 900) + 100}`,
        lane: lane,
        targetLane: lane
    });
}

function spawnObstacle() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const laneWidth = roadWidth / 3;
    const types = ['cone', 'pothole', 'barrier'];
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);

    // Calculate lane boundaries at the horizon
    const laneLeft = baseX - roadWidth / 2 + (lane * laneWidth);
    const laneCenter = laneLeft + (laneWidth / 2);

    // Spawn obstacle at the horizon point
    obstacles.push({
        x: laneCenter,
        initialX: laneCenter,
        y: canvas.height / 3, // Spawn at horizon
        type: type,
        width: type === 'barrier' ? 60 : 20,
        height: type === 'pothole' ? 10 : 20,
        lane: lane
    });
}

function updateAICars() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const roadBottomY = canvas.height;
    const roadTopY = canvas.height / 3;

    aiCars = aiCars.filter(car => {
        // Move car down
        car.y += car.speed + player.speed;

        // Get current vanishing point for this frame
        const vanishing = getVanishingPoint();

        // Calculate t: 0 at vanishing point, 1 at bottom
        const t = (car.y - vanishing.y) / (roadBottomY - vanishing.y);
        const tClamped = Math.max(0, Math.min(1, t));

        // Calculate lane center at current y
        const widthNow = roadWidth * (1 - tClamped);
        let xOffset = curveOffset * 0.01 * (segments * (1 - tClamped));
        const maxOffset = (canvas.width - widthNow) / 2;
        xOffset = Math.max(-maxOffset, Math.min(maxOffset, xOffset));
        const laneWidthNow = roadWidth / 3 * (1 - tClamped) + roadWidth / 3 * tClamped;
        const laneLeft = baseX - widthNow / 2 + xOffset;
        const laneCenter = laneLeft + (car.lane + 0.5) * laneWidthNow;

        // Interpolate x from current vanishing point to lane center
        car.x = vanishing.x * (1 - tClamped) + laneCenter * tClamped;

        // Clamp car.x so the car stays fully on the road
        const tEdge = (car.y - roadTopY) / (roadBottomY - roadTopY);
        const widthEdge = roadWidth * (1 - tEdge);
        let xOffsetEdge = curveOffset * 0.01 * (segments * (1 - tEdge));
        const maxOffsetEdge = (canvas.width - widthEdge) / 2;
        xOffsetEdge = Math.max(-maxOffsetEdge, Math.min(maxOffsetEdge, xOffsetEdge));
        const roadLeft = baseX - widthEdge / 2 + xOffsetEdge;
        const roadRight = baseX + widthEdge / 2 + xOffsetEdge;
        car.x = Math.max(roadLeft + car.width / 2, Math.min(roadRight - car.width / 2, car.x));

        // Only keep cars that are below the horizon and within road boundaries
        return car.y < canvas.height + 50 && car.y > roadTopY;
    });
}

function updateObstacles() {
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const roadBottomY = canvas.height;
    const roadTopY = canvas.height / 3;

    obstacles = obstacles.filter(obs => {
        // Move obstacle down
        obs.y += player.speed;

        // Get current vanishing point for this frame
        const vanishing = getVanishingPoint();

        // Calculate t: 0 at vanishing point, 1 at bottom
        const t = (obs.y - vanishing.y) / (roadBottomY - vanishing.y);
        const tClamped = Math.max(0, Math.min(1, t));

        // Calculate lane center at current y
        const widthNow = roadWidth * (1 - tClamped);
        let xOffset = curveOffset * 0.01 * (segments * (1 - tClamped));
        const maxOffset = (canvas.width - widthNow) / 2;
        xOffset = Math.max(-maxOffset, Math.min(maxOffset, xOffset));
        const laneWidthNow = roadWidth / 3 * (1 - tClamped) + roadWidth / 3 * tClamped;
        const laneLeft = baseX - widthNow / 2 + xOffset;
        const laneCenter = laneLeft + (obs.lane + 0.5) * laneWidthNow;

        // Interpolate x from current vanishing point to lane center
        obs.x = vanishing.x * (1 - tClamped) + laneCenter * tClamped;

        // Clamp obs.x so the obstacle stays fully on the road
        const tEdge = (obs.y - roadTopY) / (roadBottomY - roadTopY);
        const widthEdge = roadWidth * (1 - tEdge);
        let xOffsetEdge = curveOffset * 0.01 * (segments * (1 - tEdge));
        const maxOffsetEdge = (canvas.width - widthEdge) / 2;
        xOffsetEdge = Math.max(-maxOffsetEdge, Math.min(maxOffsetEdge, xOffsetEdge));
        const roadLeft = baseX - widthEdge / 2 + xOffsetEdge;
        const roadRight = baseX + widthEdge / 2 + xOffsetEdge;
        obs.x = Math.max(roadLeft + obs.width / 2, Math.min(roadRight - obs.width / 2, obs.x));

        // Only keep obstacles that are below the horizon and within road boundaries
        return obs.y < canvas.height + 50 && obs.y > roadTopY;
    });
}

function updateSignposts() { // Update signposts' positions and reset them when they go off-screen
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const roadLeft = baseX - roadWidth / 2;
    const roadRight = baseX + roadWidth / 2;
    const margin = 50; // Margin from road edge

    signposts.forEach(sign => {
        sign.y += player.speed * 0.8; // Move signposts down the screen
        sign.y = (sign.y < canvas.height / 3) ? canvas.height / 3 : sign.y;
        sign.animation += 0.02;

        if (sign.y > canvas.height + 100) { // Reset signpost position
            sign.y = -200; // Reset to top
            const side = Math.random() > 0.5 ? 'left' : 'right';
            let x;

            if (side === 'left') {
                // Place on left side of road
                x = roadLeft - margin - Math.random() * 100;
            } else {
                // Place on right side of road
                x = roadRight + margin + Math.random() * 100;
            }

            sign.x = x;
            sign.side = side;
        }
    });
}


function drawEnvironment() {
    // Calculate the horizon position
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    let roadTopY = canvas.height - segments * segmentHeight;
    roadTopY += player.speed * 10; // Adjust road top position based on player speed
    
    const horizonY = Math.max(0, roadTopY - 30);
    const maxHorizonY = canvas.height / 3;
    let horizonYPos = Math.min(maxHorizonY, horizonY);

    // Draw sky gradient
    let skyColor1, skyColor2;
    if (level >= 4) {
        skyColor1 = '#FF69B4';
        skyColor2 = '#9370DB';
    } else if (level >= 3) {
        skyColor1 = '#FF6B35';
        skyColor2 = '#F7931E';
    } else if (level >= 2) {
        skyColor1 = '#4A90E2';
        skyColor2 = '#87CEEB';
    } else {
        skyColor1 = '#87CEEB';
        skyColor2 = '#98FB98';
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, skyColor1);
    gradient.addColorStop(1, skyColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw moving clouds above horizon
    function drawCloud(x, y, scale = 1) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(x, y, 30 * scale, 18 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 25 * scale, y + 5 * scale, 22 * scale, 14 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 20 * scale, y + 8 * scale, 18 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // Update cloud positions based on time
    const cloudSpeed = 0.2; // Slower cloud movement
    const cloudOffset = (gameTime * cloudSpeed) % canvas.width;
    
    // Draw multiple clouds with different positions and sizes
    drawCloud((cloudOffset) % canvas.width, 50, 1);
    drawCloud((cloudOffset + 200) % canvas.width, 80, 0.8);
    drawCloud((cloudOffset + 400) % canvas.width, 40, 1.2);
    drawCloud((cloudOffset + 600) % canvas.width, 60, 0.9);
    drawCloud((cloudOffset + 800) % canvas.width, 70, 1.1);

    // Save context state for perspective transformations
    ctx.save();

    // Calculate road boundaries for environment placement
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const roadLeft = baseX - roadWidth / 2;
    const roadRight = baseX + roadWidth / 2;

    // Draw base landscape with perspective
    ctx.fillStyle = level >= 4 ? '#90EE90' : '#90EE90';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/3);
    horizonYPos=canvas.height/3;

    // Calculate perspective factors
    const perspectiveFactor = 1 - (horizonYPos / canvas.height);

    for (let x = 0; x <= canvas.width; x += 10) {
        // Apply perspective to x position
        const perspectiveX = baseX + (x - baseX) * perspectiveFactor;
        let hillHeight =Math.min(canvas.height/3, horizonYPos + Math.sin((x + hillOffset) * 0.01) * 30 + Math.sin((x + hillOffset) * 0.005) * 50);
        ctx.lineTo(canvas.width, hillHeight);
        
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Draw moving buildings with perspective
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        building.y += player.speed * 0.5;
        building.y = (building.y < canvas.height / 3) ? canvas.height / 3 : building.y;
        const perspective = 1 - (building.y / canvas.height) * 0.5;
        const drawWidth = building.width * perspective;
        const drawHeight = building.height * perspective;
        let x;
        if (building.side === 'left') {
            x = roadLeft - buildingMargin - drawWidth;
        } else {
            x = roadRight + buildingMargin;
        }
        if (drawHeight > 0 && building.y < canvas.height) {
            if (building.isCampus && universityNames.includes(building.name)) {
                // Draw a campus of 5-7 buildings
                const numCampusBuildings = 5 + Math.floor(Math.random() * 3); // 5 to 7
                const campusWidth = drawWidth * 2.2;
                const campusHeight = drawHeight * 1.1;
                const gap = 6 * perspective;
                const buildingW = (campusWidth - (numCampusBuildings - 1) * gap) / numCampusBuildings;
                const colorIdx = universityNames.indexOf(building.name) % universityColors.length;
                const uniColor = universityColors[colorIdx];
                for (let j = 0; j < numCampusBuildings; j++) {
                    const bx = x + j * (buildingW + gap);
                    const bHeight = campusHeight * (0.8 + Math.random() * 0.4); // Vary height
                    ctx.save();
                    ctx.fillStyle = uniColor;
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 4;
                    ctx.fillRect(bx, building.y + (campusHeight - bHeight), buildingW, bHeight);
                    ctx.strokeRect(bx, building.y + (campusHeight - bHeight), buildingW, bHeight);
                    // Windows
                    ctx.fillStyle = '#FFF';
                    for (let row = 1; row < 4; row++) {
                        for (let col = 1; col < 3; col++) {
                            ctx.fillRect(bx + col * (buildingW / 4), building.y + (campusHeight - bHeight) + row * (bHeight / 5), 8 * perspective, 8 * perspective);
                        }
                    }
                    ctx.restore();
                }
                // Draw university name above the group
                ctx.save();
                ctx.font = `bold ${Math.max(20, campusHeight * 0.22)}px Arial`;
                ctx.textAlign = 'center';
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#000';
                ctx.strokeText(building.name, x + campusWidth / 2, building.y - 10 * perspective);
                ctx.fillStyle = '#FFF';
                ctx.fillText(building.name, x + campusWidth / 2, building.y - 10 * perspective);
                ctx.restore();
                // Skip the next N-1 buildings to avoid overlap
                i += (numCampusBuildings - 1);
                continue;
            } else {
                // Non-university building as before
                if (!building.color) {
                    building.color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
                }
                // Draw main building
                ctx.fillStyle = building.color;
                ctx.fillRect(x, building.y, drawWidth, drawHeight);
                // Draw windows
                ctx.fillStyle = '#FFD700';
                const windowRows = Math.floor(drawHeight / 18);
                const windowCols = Math.floor(drawWidth / 18);
                for (let row = 1; row < windowRows; row++) {
                    for (let col = 1; col < windowCols; col++) {
                        ctx.fillRect(x + col * (drawWidth / (windowCols + 1)), building.y + row * (drawHeight / (windowRows + 1)), 8, 8);
                    }
                }
                // Draw roof
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x - 5, building.y - 12, drawWidth + 10, 12);
                // Draw head word
                ctx.save();
                ctx.font = `bold ${Math.max(18, drawHeight * 0.22)}px Arial`;
                ctx.textAlign = 'center';
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#000';
                ctx.strokeText(building.name, x + drawWidth / 2, building.y - 2);
                ctx.fillStyle = '#FFF';
                ctx.fillText(building.name, x + drawWidth / 2, building.y - 2);
                ctx.restore();
            }
        }
        if (building.y > canvas.height + 50) {
            building.y = startY - buildingSpacing;
            // Only assign a university name if the previous building was not a campus
            let assignCampus = false;
            if (Math.random() < 0.25) { // 25% chance to be a campus
                // Check previous building (or wrap around)
                const prevIdx = (i - 1 + buildings.length) % buildings.length;
                if (!buildings[prevIdx].isCampus) {
                    assignCampus = true;
                }
            }
            if (assignCampus) {
                building.name = universityNames[Math.floor(Math.random() * universityNames.length)];
                building.isCampus = true;
            } else {
                // Assign a non-university name
                let nonUniNames = buildingNames.filter(n => !universityNames.includes(n));
                building.name = nonUniNames[Math.floor(Math.random() * nonUniNames.length)];
                building.isCampus = false;
            }
            building.color = undefined;
        }
    }

    // Draw moving trees with perspective
    trees.forEach(tree => {
        tree.y += player.speed * 0.5;
        tree.y = (tree.y < canvas.height / 3) ? canvas.height / 3 : tree.y;
        const perspective = 1 - (tree.y / canvas.height) * 0.5;
        const drawSize = tree.size * perspective;
        // x is fixed per tree, not recalculated each frame
        if (drawSize > 0 && tree.y < canvas.height) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tree.x - 2, tree.y, 4, drawSize);
            ctx.fillStyle = level >= 4 ? '#FF69B4' : '#228B22';
            ctx.beginPath();
            ctx.arc(tree.x, tree.y - drawSize / 2, drawSize, 0, Math.PI * 2);
            ctx.fill();
        }
        if (tree.y > canvas.height + 30) {
            tree.y = treeBaseY - treeSpacing;
            // Optionally randomize x again for more variety
            if (tree.side === 'left') {
                tree.x = roadLeft - treeMargin - 30 - Math.random() * 120;
            } else {
                tree.x = roadRight + treeMargin + 30 + Math.random() * 120;
            }
        }
    });

    // Draw Magic Garden decorations with perspective
    if (level >= 4) {
        for (let i = 0; i < 10; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const distanceFromRoad = 80 + Math.random() * 100;
            let x = (side === -1 ? roadLeft : roadRight) + (side * distanceFromRoad);
            let y = horizonYPos + 30 + Math.sin(i * 0.7) * 30;
            const perspectiveX = baseX + (x - baseX) * (1 - (y / canvas.height));
            const perspectiveSize = 5 * (1 - (y / canvas.height));
            const moveY = y + player.speed * 2; // Add downward movement

            ctx.fillStyle = ['#FF69B4', '#9370DB', '#00CED1', '#FFD700'][i % 4];
            ctx.beginPath();
            ctx.arc(perspectiveX, moveY, perspectiveSize, 0, Math.PI * 2);
            ctx.fill();

            for (let j = 0; j < 5; j++) {
                let angle = (j * Math.PI * 2) / 5;
                let petalX = perspectiveX + Math.cos(angle) * (8 * (1 - (y / canvas.height)));
                let petalY = moveY + Math.sin(angle) * (8 * (1 - (y / canvas.height)));
                ctx.beginPath();
                ctx.arc(petalX, petalY, perspectiveSize * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Restore context
    ctx.restore();

    // Update hill offset based on player speed
    hillOffset += player.speed * 0.5;
    buildingOffset += player.speed * 0.5;
}


function drawPlayer() {

    ctx.fillStyle = '#0066CC';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);


    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(player.x - player.width / 2 + 5, player.y - player.height / 2 + 10, player.width - 10, 15);


    ctx.fillStyle = '#000';
    ctx.fillRect(player.x - player.width / 2 - 3, player.y - player.height / 2 + 5, 6, 10);
    ctx.fillRect(player.x + player.width / 2 - 3, player.y - player.height / 2 + 5, 6, 10);
    ctx.fillRect(player.x - player.width / 2 - 3, player.y + player.height / 2 - 15, 6, 10);
    ctx.fillRect(player.x + player.width / 2 - 3, player.y + player.height / 2 - 15, 6, 10);


    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x - 20, player.y + player.height / 2 - 8, 40, 12);
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.plateNumber, player.x, player.y + player.height / 2 - 1);
}

function drawAICars() {
    // Calculate the horizon position
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    const roadTopY = canvas.height - segments * segmentHeight;
    const horizonY = Math.max(0, roadTopY - 30);
    const maxHorizonY = canvas.height / 3;
    let horizonYPos = Math.min(maxHorizonY, horizonY);

    // Save context state
    ctx.save();

    // Create clipping region for everything below the horizon
    ctx.beginPath();
    ctx.rect(0, horizonYPos, canvas.width, canvas.height - horizonYPos);
    ctx.clip();

    aiCars.forEach(car => {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x - car.width / 2, car.y - car.height / 2, car.width, car.height);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(car.x - car.width / 2 + 3, car.y - car.height / 2 + 8, car.width - 6, 12);

        ctx.fillStyle = '#000';
        ctx.fillRect(car.x - car.width / 2 - 2, car.y - car.height / 2 + 3, 4, 8);
        ctx.fillRect(car.x + car.width / 2 - 2, car.y - car.height / 2 + 3, 4, 8);
        ctx.fillRect(car.x - car.width / 2 - 2, car.y + car.height / 2 - 11, 4, 8);
        ctx.fillRect(car.x + car.width / 2 - 2, car.y + car.height / 2 - 11, 4, 8);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(car.x - 15, car.y + car.height / 2 - 6, 30, 8);
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(car.plateNumber, car.x, car.y + car.height / 2 - 1);
    });

    // Restore context to remove clipping
    ctx.restore();
}

function drawObstacles() {
    // Calculate the horizon position
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    const roadTopY = canvas.height - segments * segmentHeight;
    const horizonY = Math.max(0, roadTopY - 30);
    const maxHorizonY = canvas.height / 3;
    let horizonYPos = Math.min(maxHorizonY, horizonY);

    // Save context state
    ctx.save();

    // Create clipping region for everything below the horizon
    ctx.beginPath();
    ctx.rect(0, horizonYPos, canvas.width, canvas.height - horizonYPos);
    ctx.clip();

    obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 'cone' ? '#FF6600' : obs.type === 'pothole' ? '#333' : '#8B4513';

        if (obs.type === 'cone') {
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.height);
            ctx.lineTo(obs.x - obs.width / 2, obs.y);
            ctx.lineTo(obs.x + obs.width / 2, obs.y);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.fillRect(obs.x - obs.width / 3, obs.y + obs.height / 2, obs.width * 2 / 3, 3);
        } else if (obs.type === 'pothole') {
            ctx.beginPath();
            ctx.ellipse(obs.x, obs.y, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(obs.x - obs.width / 2, obs.y, obs.width, obs.height);
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(obs.x - obs.width / 2 + i * 20, obs.y + 5, 15, 3);
            }
        }
    });

    // Restore context to remove clipping
    ctx.restore();
}

//draw signposts   
function drawSignposts() {
    signposts.forEach(sign => {

        sign.animation += 0.02;
        let animOffset = Math.sin(sign.animation) * 2;


        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sign.x - 2, sign.y + animOffset, 4, 40);


        ctx.fillStyle = '#228B22';
        ctx.fillRect(sign.x - 50, sign.y - 15 + animOffset, 100, 25);


        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(sign.x - 50, sign.y - 15 + animOffset, 100, 25);


        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sign.message, sign.x, sign.y + 2 + animOffset);
    });
}

//function to draw hud 
function drawHUD() {

    const hudPulse = Math.sin(gameTime * 0.1) * 0.1 + 1;


  ctx.save();
ctx.scale(hudPulse, hudPulse);

// Draw translucent card background
const cardX = 30 / hudPulse;
const cardY = 20 / hudPulse;
const cardWidth = 280;
const cardHeight = 150;
const radius = 15;

ctx.beginPath();
ctx.moveTo(cardX + radius, cardY);
ctx.lineTo(cardX + cardWidth - radius, cardY);
ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
ctx.lineTo(cardX + radius, cardY + cardHeight);
ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
ctx.lineTo(cardX, cardY + radius);
ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
ctx.closePath();

ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Transparent black
ctx.fill();

// Text content
ctx.fillStyle = '#FFFFFF'; // White text
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'left';
ctx.fillText(`Speed: ${Math.round(player.speed * 20)} km/h`, 50 / hudPulse, 50 / hudPulse);
ctx.fillStyle = '#00FF7F'; // Professional green
ctx.fillText(`Distance: ${Math.round(distance)}m`, 50 / hudPulse, 80 / hudPulse);
ctx.fillText(`Score: ${score}`, 50 / hudPulse, 110 / hudPulse);
ctx.fillText(`Level: ${level}${level === 4 ? ' - MAGIC GARDEN!' : ''}`, 50 / hudPulse, 140 / hudPulse);

ctx.restore();

ctx.save();



    if (level < 4 && !freeRideMode) {
        const nextLevelDistance = level * 500;
        const progress = (distance % 500) / 500;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(200, 130, 200, 10);
        ctx.fillStyle = level >= 4 ? '#FF69B4' : '#00FF00';
        ctx.fillRect(200, 130, progress * 200, 10);
        ctx.strokeStyle = '#FFF';
        ctx.strokeRect(200, 130, 200, 10);
    }


    if (freeRideMode) {
        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('FREE RIDE MODE', canvas.width - 200, 30);
    }

    if (showMiniMap) {
        drawMiniMap();
    }


    ctx.fillStyle = musicEnabled ? '#00FF00' : '#FF0000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Music: ${musicEnabled ? 'ON' : 'OFF'}`, canvas.width - 10, canvas.height - 20);
}

//function to draw the mini-map
function drawMiniMap() {  // Draw a mini-map in the top right corner
    const mapSize = 120;
    const mapX = canvas.width - mapSize - 20;
    const mapY = 50;
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const roadSegments = 100;
    const segmentHeight = canvas.height / roadSegments;

    // Draw map background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    // Calculate road dimensions for mini-map
    const mapRoadWidth = mapSize - 40;
    const mapRoadHeight = mapSize - 20;
    const mapRoadX = mapX + 20;
    const mapRoadY = mapY + 10;

    // Draw road base
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(mapRoadX, mapRoadY + mapRoadHeight);

    // Draw road based on actual curve and hill
    const curveFactor = curveOffset * 0.5;
    const hillFactor = hillOffset * 0.3;
    const mapSegments = 20;

    // Draw road path
    for (let i = 0; i <= mapSegments; i++) {
        const t = i / mapSegments;
        const x = mapRoadX + (mapRoadWidth * t);
        const y = mapRoadY + mapRoadHeight * (1 - t) +
            Math.sin(t * Math.PI * 2 + curveFactor) * 10 +
            Math.sin(t * Math.PI + hillFactor) * 5;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(mapRoadX + mapRoadWidth, mapRoadY + mapRoadHeight);
    ctx.closePath();
    ctx.fill();

    // Draw road edges
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mapRoadX, mapRoadY + mapRoadHeight);

    for (let i = 0; i <= mapSegments; i++) {
        const t = i / mapSegments;
        const x = mapRoadX + (mapRoadWidth * t);
        const y = mapRoadY + mapRoadHeight * (1 - t) +
            Math.sin(t * Math.PI * 2 + curveFactor) * 10 +
            Math.sin(t * Math.PI + hillFactor) * 5;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw player position
    const playerMapX = mapRoadX + (player.x - (baseX - roadWidth / 2)) / roadWidth * mapRoadWidth;
    const playerMapY = mapRoadY + mapRoadHeight * (1 - (player.y / canvas.height));
    ctx.fillStyle = '#0066CC';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw AI cars
    ctx.fillStyle = '#FF0000';
    aiCars.forEach(car => {
        if (car.y > 0 && car.y < canvas.height) {
            const carMapX = mapRoadX + (car.x - (baseX - roadWidth / 2)) / roadWidth * mapRoadWidth;
            const carMapY = mapRoadY + mapRoadHeight * (1 - (car.y / canvas.height));
            ctx.beginPath();
            ctx.arc(carMapX, carMapY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw obstacles
    ctx.fillStyle = '#FFA500';
    obstacles.forEach(obs => {
        if (obs.y > 0 && obs.y < canvas.height) {
            const obsMapX = mapRoadX + (obs.x - (baseX - roadWidth / 2)) / roadWidth * mapRoadWidth;
            const obsMapY = mapRoadY + mapRoadHeight * (1 - (obs.y / canvas.height));
            ctx.beginPath();
            ctx.arc(obsMapX, obsMapY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw distance markers
    ctx.fillStyle = '#FFF';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 3; i++) {
        const t = i / 3;
        const x = mapRoadX + (mapRoadWidth * t);
        const y = mapRoadY + mapRoadHeight * (1 - t) +
            Math.sin(t * Math.PI * 2 + curveFactor) * 10 +
            Math.sin(t * Math.PI + hillFactor) * 5;
        ctx.fillText(`${i * 500}m`, x, y - 5);
    }

    // Draw current distance
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(distance)}m`, mapX + 5, mapY + 15);
}

//function to draw the menu screen
function drawMenuScreen() { //draw menu screen

    drawEnvironment();
    drawRoad(ctx, canvas);


    if (!aiCars.length) {
        for (let i = 0; i < 3; i++) {
            spawnAICar();
        }
    }
    updateAICars();
    drawAICars();

    menuAnimation += 0.02;


    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    const titlePulse = Math.sin(menuAnimation * 2) * 0.2 + 1;
    ctx.save();
    ctx.scale(titlePulse, titlePulse);


    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FUTURESKILLSDRIVE', canvas.width / (2 * titlePulse), 150 / titlePulse);


    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('RFSF Racing Championship', canvas.width / (2 * titlePulse), 190 / titlePulse);
    ctx.restore();


    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(0, 220, canvas.width, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RTB COMPETITION FUTURE SKILLS', canvas.width / 2, 245);


    const optionPulse = Math.sin(menuAnimation * 3) * 0.1 + 1;
    ctx.save();
    ctx.scale(optionPulse, optionPulse);

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('CLICK TO START RACING!', canvas.width / (2 * optionPulse), 320 / optionPulse);

    ctx.fillStyle = '#87CEEB';
    ctx.font = '16px Arial';
    ctx.fillText('Race through 3 levels to reach the Magic Garden', canvas.width / (2 * optionPulse), 360 / optionPulse);
    ctx.restore();


    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const instructions = [
        'Controls:',
        '↑↓←→ or WASD - Drive',
        'SPACE - Brake',
        'ESC - Pause',
        'R - Toggle Music',
        'M - Toggle Mini-map',
        'F - Free Ride Mode',
        
    ];

    instructions.forEach((text, i) => {
        ctx.fillText(text, 50, 420 + i * 20);
    });


    const highScore = localStorage.getItem('futureSkillsHighScore') || 0;
    const bestDistance = localStorage.getItem('futureSkillsBestDistance') || 0;

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 50, 420);
    ctx.fillText(`Best Distance: ${bestDistance}m`, canvas.width - 50, 445);


    ctx.fillStyle = '#228B22';
    ctx.font = 'italic 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Skills for a better destiny', canvas.width / 2, canvas.height - 30);

    // Draw START banner
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const segments = 100;
    const segmentHeight = canvas.height / segments;
    const roadTopY = canvas.height / 3; // Using user's value for road top
    // const horizonY = Math.max(0, roadTopY - 30); // Not needed for banner position
    // const maxHorizonY = canvas.height / 3; // Not needed for banner position
    // let horizonYPos = Math.min(maxHorizonY, horizonY); // Not needed for banner position

    const bannerHeight = 80; // Revert banner height for better visibility, can adjust later - keeping user's last change
    const bannerY = canvas.height / 1.5; // Position banner centered on horizonYPos - keeping user's last change
    const bannerWidth = roadWidth * 1.1; // Make banner significantly wider than the road - keeping user's last change
    const bannerX = baseX - bannerWidth / 2; // Center the banner
    const bannerBottomY = bannerY + bannerHeight; // Calculate banner bottom Y

    // Calculate road edges at banner's y position for pole connection
    const i = (canvas.height - bannerBottomY) / segmentHeight; // Approximate segment index for banner bottom
    const roadXOffsetAtBannerBottom = curveOffset * 0.01 * i;
    const roadLeftAtBannerBottom = baseX - roadWidth / 2 + roadXOffsetAtBannerBottom; // Road left edge at banner bottom Y
    const roadRightAtBannerBottom = baseX + roadWidth / 2 + roadXOffsetAtBannerBottom; // Road right edge at banner bottom Y

    // Draw banner supports (poles) with perspective - Reverting to simpler poles
    const poleWidth = 20; // Base width of the simpler poles
    ctx.fillStyle = '#8B4513'; // Brown color for poles

    // Left pole
    ctx.fillRect(roadLeftAtBannerBottom - poleWidth / 2, bannerBottomY, poleWidth, canvas.height - bannerBottomY); // Draw rectangle from banner bottom to canvas bottom

    // Right pole
    ctx.fillRect(roadRightAtBannerBottom - poleWidth / 2, bannerBottomY, poleWidth, canvas.height - bannerBottomY); // Draw rectangle from banner bottom to canvas bottom

    // Draw banner rectangle
    ctx.fillStyle = '#FFF';
    ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);

    // Draw START text
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', baseX, bannerY + bannerHeight / 2);
}

//function to draw pause screen
function drawPauseScreen() { //draw pause screen

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 20);


    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Distance: ${Math.round(distance)}m`, canvas.width / 2, canvas.height / 2 + 70);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 95);
    ctx.fillText(`Level: ${level}`, canvas.width / 2, canvas.height / 2 + 120);
}

//function to draw game over screen
function drawGameOverScreen() { //draw game over screen

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 80);


    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`Final Distance: ${Math.round(distance)}m`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 40);


    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('Click or Press SPACE to Return to Menu', canvas.width / 2, canvas.height / 2 + 100);


    const currentHigh = localStorage.getItem('futureSkillsHighScore') || 0;
    if (score > currentHigh) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('🎉 NEW HIGH SCORE! 🎉', canvas.width / 2, canvas.height / 2 + 140);
    }
}

//draw victory screen

function drawVictoryScreen() { //draw victory screen

    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
    gradient.addColorStop(0, '#FF69B4');
    gradient.addColorStop(0.5, '#9370DB');
    gradient.addColorStop(1, '#4B0082');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    createParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 5);


    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎊 VICTORY! 🎊', canvas.width / 2, canvas.height / 2 - 120);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('You\'ve Reached the', canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText('MAGIC GARDEN!', canvas.width / 2, canvas.height / 2 - 45);


    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🏆 Distance Completed: ${Math.round(distance)}m`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`🏆 Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText(`🏆 Time: ${Math.round(gameTime / 60)} seconds`, canvas.width / 2, canvas.height / 2 + 80);


    ctx.fillStyle = '#FF69B4';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🌟 MAGIC GARDEN CHAMPION 🌟', canvas.width / 2, canvas.height / 2 + 120);


    ctx.fillStyle = '#FFF';
    ctx.font = '18px Arial';
    ctx.fillText('Click or Press SPACE to Return to Menu', canvas.width / 2, canvas.height / 2 + 160);
}

//save the high score and best distance/time
function saveHighScore() { //save high score and best distance/time
    const currentHigh = localStorage.getItem('futureSkillsHighScore') || 0;
    const currentBestDistance = localStorage.getItem('futureSkillsBestDistance') || 0;
    const currentBestTime = localStorage.getItem('futureSkillsBestTime') || 999999;

    if (score > currentHigh) {
        localStorage.setItem('futureSkillsHighScore', score);
    }

    if (distance > currentBestDistance) {
        localStorage.setItem('futureSkillsBestDistance', Math.round(distance));
    }

    if (gameTime < currentBestTime && gameState === 'victory') {
        localStorage.setItem('futureSkillsBestTime', gameTime);
    }
}


// Main game loop function to enable looping
function gameLoop() {   // Main game loop
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (gameState) {
        case 'menu':
            drawEnvironment();
            drawRoad(ctx, canvas);
            if (!aiCars.length) {
                for (let i = 0; i < 3; i++) {
                    spawnAICar();
                }
            }
            updateAICars();
            drawAICars();
            drawMenuScreen();
            break;

        case 'playing':
            updateGame();
            drawEnvironment();
            drawRoad(ctx, canvas, player.speed);

            // Save context state before drawing objects
            ctx.save();

            // Calculate horizon position (needed for clipping)
            const segments = 100;
            const segmentHeight = canvas.height / segments;
            const roadTopY = canvas.height / 3;
            const horizonY = Math.max(0, roadTopY - 30);
            const maxHorizonY = canvas.height / 3;
            let horizonYPos = Math.min(maxHorizonY, horizonY);

            // Create a clipping path that is the inverse of the banner shapes
            ctx.beginPath();
            // Add a large rectangle covering the entire canvas to the path (below the horizon line)
            // This ensures we only clip within the game world area where objects are drawn
            ctx.rect(0, horizonYPos, canvas.width, canvas.height - horizonYPos);

            // For each active banner, add its rectangle to the same path
            advertisementBanners.forEach(banner => {
                const roadWidth = 320;
                const baseX = canvas.width / 2;
                // Calculate the perspective properties of the banner at its current y position
                const i = (canvas.height - banner.y) / segmentHeight; // Approximate segment index

                // Use the same perspective scaling logic as used in drawAdvertisementBanners
                const scaleFactor = (banner.y + 100) / (canvas.height + 100);
                const effectiveScaleFactor = Math.max(0.4, scaleFactor);

                // Calculate road center at banner's y position (road curve offset without perspective scaling)
                const roadXOffsetAtBannerY = curveOffset * 0.01 * i;
                const roadCenterAtBannerY = baseX + roadXOffsetAtBannerY;

                // Calculate banner dimensions and position with perspective scaling
                const bannerPerspectiveWidth = advertisementBannerWidth * effectiveScaleFactor;
                const bannerPerspectiveHeight = advertisementBannerHeight * effectiveScaleFactor;
                const bannerPerspectiveX = roadCenterAtBannerY - bannerPerspectiveWidth / 2; // Center on road center line (unscaled for perspective)

                // Add banner rectangle to the clipping path.
                ctx.rect(
                    bannerPerspectiveX,
                    banner.y,
                    bannerPerspectiveWidth,
                    bannerPerspectiveHeight
                );
            });

            // Apply clipping using the even-odd fill rule
            // This will clip to the area outside the banner rectangles but inside the initial large rectangle
            ctx.clip('evenodd');

            // Draw objects that should be hidden behind banners (drawn *after* clipping)
            // These will only appear in the areas not covered by the clipping path (i.e., not behind banners)
            drawSignposts();
            drawObstacles();
            drawAICars();
            drawPlayer();
            drawParticles();

            // Restore context to remove clipping
            ctx.restore();

            // Draw banners last so they appear on top (drawn *after* restoring context)
            if (typeof updateAndDrawBanners === 'function') {
                // Use the same parameters as before, using player and road state
                const roadWidth = 320;
                const baseX = canvas.width / 2;
                const segments = 100;
                const segmentHeight = canvas.height / segments;
                const roadTopY = canvas.height - segments * segmentHeight;
                const horizonY = Math.max(0, roadTopY - 30);
                const maxHorizonY = canvas.height / 3;
                let horizonYPos = Math.min(maxHorizonY, horizonY);
                updateAndDrawBanners(ctx, canvas, player.speed, distance, baseX, roadWidth, horizonYPos, curveOffset, segmentHeight);
            }
            drawHUD();
            break;

        case 'paused':
            drawEnvironment();
            drawRoad(ctx, canvas);
            drawSignposts();
            drawObstacles();
            drawAICars();
            drawPlayer();
            drawParticles();
            drawHUD();
            drawPauseScreen();
            break;

        case 'gameover':
            drawGameOverScreen();
            break;

        case 'victory':
            drawVictoryScreen();
            drawParticles();
            break;

        case 'countdown':
            drawEnvironment();
            drawRoad(ctx, canvas);
            drawSignposts();
            drawAICars();
            drawPlayer();
            drawCountdown();
            break;
    }

    requestAnimationFrame(gameLoop);
}

// Initialize the game

function initGame() {
    initSignposts();

    // Add mouse and touch event listeners
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('mouseup', resetInput);
    canvas.addEventListener('mousemove', (event) => {
        if (event.buttons === 1) { // Check if left mouse button is pressed
            handleInput(event);
        }
    });

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling on touch
        handleInput(event);
    });
    canvas.addEventListener('touchend', resetInput);
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Prevent scrolling on touch
        handleInput(event);
    });

    for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnAICar(), i * 1000);
    }

    gameLoop();
}
function readTextAloud(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}


window.addEventListener('load', initGame);


window.addEventListener('focus', () => {
    if (musicContext && musicContext.state === 'suspended') {
        musicContext.resume();
    }
});

//initialize music context 
function initMusic() {
    try {
        if (!musicContext) {
            musicContext = new (window.AudioContext || window.webkitAudioContext)();
            musicGain = musicContext.createGain();
            musicGain.gain.value = 0.1;
            musicGain.connect(musicContext.destination);
        }
    } catch (error) {
        console.warn('Music initialization failed:', error);
        musicEnabled = false; // Disable music if initialization fails
        // Optionally show a message to the user
        if (typeof showAudioErrorMessage === 'function') {
            showAudioErrorMessage('Audio could not be started. Please check your device or browser settings.');
        }
    }
}

// Function to play background music
function playBackgroundMusic() {
    try {
        if (!musicContext || !musicEnabled) return;

        if (musicOscillator) {
            musicOscillator.stop();
        }

        musicOscillator = musicContext.createOscillator();
        musicOscillator.frequency.setValueAtTime(220, musicContext.currentTime);
        musicOscillator.type = 'sine';
        musicOscillator.connect(musicGain);
        musicOscillator.start();
    } catch (error) {
        console.warn('Background music playback failed:', error);
        musicEnabled = false; // Disable music if playback fails
        if (typeof showAudioErrorMessage === 'function') {
            showAudioErrorMessage('Audio could not be started. Please check your device or browser settings.');
        }
    }
}

//function  for displaying error message 

// Example function to show an audio error message (implement as needed)
function showAudioErrorMessage(msg) {
    // You can display this in your UI as a toast, alert, or custom banner
    alert(msg); // Replace with a non-blocking UI message in production
}

// Only start music after user interaction
window.addEventListener('click', () => {
    if (musicEnabled && musicContext && musicContext.state === 'suspended') {
        musicContext.resume().catch(err => {
            console.warn('AudioContext resume failed:', err);
            musicEnabled = false;
            showAudioErrorMessage('Audio could not be started. Please check your device or browser settings.');
        });
    }
});
