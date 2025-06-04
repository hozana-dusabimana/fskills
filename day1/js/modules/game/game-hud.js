// Manages the Heads-Up Display (HUD) elements
'use strict';

const showTitle = 1;

function drawHUD() {
    if (freeCamMode)
        return;

    if (enhancedMode && paused) {
        // paused
        drawHUDText('-PAUSE-', vec3(.5, .9), .08, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
    }

    if (titleScreenMode) {
        if (showTitle)
            for (let j = 2; j--;) {
                // draw logo
                const text = j ? 'RTB COMPETITION ON' : 'FUTURE SKILLS';
                const pos = vec3(.5, .3 - j * .15).multiply(mainCanvasSize);
                let size = mainCanvasSize.y / 9;
                const weight = 900;
                const style = 'italic';
                const font = 'arial';
                if (enhancedMode && getAspect() < .6)
                    size = mainCanvasSize.x / 5;

                const context = mainContext;
                context.strokeStyle = BLACK;
                context.textAlign = 'center';

                let totalWidth = 0;
                for (let k = 2; k--;)
                    for (let i = 0; i < text.length; i++) {
                        const p = Math.sin(i - time * 2 - j * 2);
                        let size2 = (size + p * mainCanvasSize.y / 20);
                        if (enhancedMode)
                            size2 *= lerp(time * 2 - 2 + j, 0, 1)
                        context.font = `${style} ${weight} ${size2}px ${font}`;
                        const c = text[i];
                        const w = context.measureText(c).width;
                        if (k) {
                            totalWidth += w;
                            continue;
                        }

                        const x = pos.x + w / 3 - totalWidth / 2;
                        for (let f = 2; f--;) {
                            const o = f * mainCanvasSize.y / 99;
                            context.fillStyle = hsl(.15 - p / 9, 1, f ? 0 : .75 - p * .25);
                            context.fillText(c, x + o, pos.y + o);
                        }
                        pos.x += w;
                    }
            }

        if (!enhancedMode || time > 5) {
            if (bestTime && (!enhancedMode || time % 20 < 10)) {
                const timeString = formatTimeString(bestTime);
                if (!RP31KBuildLevel2)
                    drawHUDText('BEST TIME', vec3(.5, .9), .07, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
                drawHUDText(timeString, vec3(.5, .97), .07, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
            }
            else if (enhancedMode && !isTouchDevice) {
                drawHUDText('CLICK TO PLAY', vec3(.5, .97), .07, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
            }
        }
        // --- Main Menu Card (drawn last, above everything else) ---
        
        
        startMenuY=mainCanvasSize.y+110;
        const menuCardWidth = mainCanvasSize.x * 0.5;
        const menuCardHeight = startMenuY * 0.50;
        const menuCardX = (mainCanvasSize.x - menuCardWidth) / 2;
        const menuCardY = ((startMenuY - menuCardHeight) / 2)+20;
        const menuCardRadius = 36;
        const menuBaseAlpha = 0.7;
        const menuPulse = 0.12 * Math.abs(Math.sin(time * 1.2));
        const menuCardAlpha = menuBaseAlpha + menuPulse;
        const ctx = mainContext;
        ctx.save();
        ctx.globalAlpha = menuCardAlpha;
        ctx.fillStyle = '#000';
        // Draw rounded rectangle for menu
        ctx.beginPath();
        ctx.moveTo(menuCardX + menuCardRadius, menuCardY);
        ctx.lineTo(menuCardX + menuCardWidth - menuCardRadius, menuCardY);
        ctx.quadraticCurveTo(menuCardX + menuCardWidth, menuCardY, menuCardX + menuCardWidth, menuCardY + menuCardRadius);
        ctx.lineTo(menuCardX + menuCardWidth, menuCardY + menuCardHeight - menuCardRadius);
        ctx.quadraticCurveTo(menuCardX + menuCardWidth, menuCardY + menuCardHeight, menuCardX + menuCardWidth - menuCardRadius, menuCardY + menuCardHeight);
        ctx.lineTo(menuCardX + menuCardRadius, menuCardY + menuCardHeight);
        ctx.quadraticCurveTo(menuCardX, menuCardY + menuCardHeight, menuCardX, menuCardY + menuCardHeight - menuCardRadius);
        ctx.lineTo(menuCardX, menuCardY + menuCardRadius);
        ctx.quadraticCurveTo(menuCardX, menuCardY, menuCardX + menuCardRadius, menuCardY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Menu Title
        drawHUDText('Main Menu', vec3(0.5, 0.50), 0.09, WHITE, 'arial', 'center', 900);
        // Menu Prompt
        drawHUDText('Press any space key to start', vec3(0.5, 0.56), 0.05, GREEN, 'arial', 'center', 700);
        // Additional controls instructions
        drawHUDText('Controls:', vec3(0.5, 0.62), 0.04, WHITE, 'arial', 'center', 700);
        drawHUDText('WASD or Arrow Keys: Drive', vec3(0.5, 0.67), 0.035, GREEN, 'arial', 'center', 600);
        drawHUDText('Mouse: Steer & Accelerate', vec3(0.5, 0.71), 0.035, GREEN, 'arial', 'center', 600);
        drawHUDText('R: Restart   F: Free Ride', vec3(0.5, 0.75), 0.035, GREEN, 'arial', 'center', 600);
        // Visual Start Button
        startMenuY=startMenuY+140;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#222';
        const btnW = mainCanvasSize.x * 0.18;
        const btnH = startMenuY * 0.07;
        const btnX = (mainCanvasSize.x - btnW) / 2;
        const btnY = startMenuY * 0.56;
        ctx.beginPath();
        ctx.moveTo(btnX + 18, btnY);
        ctx.lineTo(btnX + btnW - 18, btnY);
        ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + 18);
        ctx.lineTo(btnX + btnW, btnY + btnH - 18);
        ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - 18, btnY + btnH);
        ctx.lineTo(btnX + 18, btnY + btnH);
        ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - 18);
        ctx.lineTo(btnX, btnY + 18);
        ctx.quadraticCurveTo(btnX, btnY, btnX + 18, btnY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawHUDText('Click to Start', vec3(0.5, 0.82), 0.045, WHITE, 'arial', 'center', 900);
        // --- End Main Menu Card ---
    }
    else if (startCountdownTimer.active() || startCountdown) {
        // count down
        const a = 1 - time % 1;
        const t = !startCountdown && startCountdownTimer.active() ? 'GO!' : startCountdown | 0;
        const c = (startCountdown ? RED : GREEN).copy();
        c.a = a;
        drawHUDText(t, vec3(.5, .2), .25 - a * .1, c, undefined, undefined, 900, undefined, undefined, .03);
    }
    else {
        const wave1 = .04 * (1 - abs(Math.sin(time * 2)));
        if (gameOverTimer.isSet()) {
            // win screen
            const c = playerWin ? YELLOW : WHITE;
            const wave2 = .04 * (1 - abs(Math.sin(time * 2 + PI / 2)));
            drawHUDText(playerWin ? 'YOU ARE' : 'GAME', vec3(.5, .2), .1 + wave1, c, undefined, undefined, 900, 'italic', .5, undefined, 4);
            drawHUDText(playerWin ? 'WELCOME TO THE MAGIC GARDEN!' : 'MAGIC GARDEN!', vec3(.5, .3), .1 + wave2, c, undefined, undefined, 900, 'italic', .5, undefined, 4);

            if (playerNewRecord || playerNewDistanceRecord && !bestTime)
                drawHUDText('NEW RECORD', vec3(.5, .6), .08 + wave1 / 4, RED, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
        }
        else if (!startCountdownTimer.active() && !freeRide) {
            // big center checkpoint time
            const c = checkpointTimeLeft < 4 ? RED : checkpointTimeLeft < 11 ? YELLOW : WHITE;
            const t = checkpointTimeLeft | 0;

            let y = .13, s = .14;
            if (enhancedMode && getAspect() < .6)
                y = .14, s = .1;

            drawHUDText(t, vec3(.5, y), s, c, undefined, undefined, 900, undefined, undefined, .04);
        }

        if (!freeRide) {
            if (playerWin) {
                // current time
                const timeString = formatTimeString(raceTime);
                if (!RP31KBuildLevel2)
                    drawHUDText('TIME', vec3(.5, .43), .08, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
                drawHUDText(timeString, vec3(.5), .08, undefined, 'monospace', undefined, 900, undefined, undefined, undefined, 3);
            }
            else {
                // current time
                const timeString = formatTimeString(raceTime);
                drawHUDText(timeString, vec3(.01, .05), .05, undefined, 'monospace', 'left');

                // current stage
                const level = debug && testLevelInfo ? testLevelInfo.level + 1 : playerLevel + 1;
                drawHUDText('STAGE ' + level, vec3(.99, .05), .05, undefined, 'monospace', 'right');
                
            }
        }

        // --- HUD: Speed, Distance, Score, Level ---
        if (!titleScreenMode && !freeCamMode) {
            // --- Animated Card Background ---
            const cardX = 0;
            const cardY = 0;
            const cardWidth = mainCanvasSize.x * 0.38;
            const cardHeight = startMenuY * 0.4;
            const cardRadius = 28;
            // Animate opacity with a gentle pulse
            const baseAlpha = 0.55;
            const pulse = 0.08 * Math.abs(Math.sin(time * 1.5));
            const cardAlpha = baseAlpha + pulse;
            const ctx = mainContext;
            ctx.save();
            ctx.globalAlpha = cardAlpha;
            ctx.fillStyle = '#000';
            // Draw rounded rectangle
            ctx.beginPath();
            ctx.moveTo(cardX + cardRadius, cardY);
            ctx.lineTo(cardX + cardWidth - cardRadius, cardY);
            ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cardRadius);
            ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cardRadius);
            ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cardRadius, cardY + cardHeight);
            ctx.lineTo(cardX + cardRadius, cardY + cardHeight);
            ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cardRadius);
            ctx.lineTo(cardX, cardY + cardRadius);
            ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            // --- End Animated Card Background ---

            // Speed (km/h)
            const speed = Math.round(playerVehicle.velocity.z);
            drawHUDText('Speed: ' + speed + ' km/h', vec3(.01, .12), .05, WHITE, 'arial', 'left', 900);
            // Distance (km)
            const distanceKm = playerVehicle.pos.z / 1000;
            drawHUDText('Distance: ' + distanceKm.toFixed(2) + ' km', vec3(.01, .18), .05, GREEN, 'arial', 'left', 900);
            // Score
            if (typeof score === 'undefined') window.score = 0;
            drawHUDText('Score: ' + score, vec3(.01, .24), .05, GREEN, 'arial', 'left', 900);
            // High Score
            if (typeof highScore !== 'undefined')
                drawHUDText('High Score: ' + highScore, vec3(.01, .29), .05, GREEN, 'arial', 'left', 900);
            // Level
            drawHUDText('Level: ' + (playerLevel + 1), vec3(.01, .35), .05, GREEN, 'arial', 'left', 900);
            let moto;
            if(playerLevel===0){
                 moto = 'UBUMWE';
            drawHUDText('MOTO: ' +moto, vec3(.01, .42), .05, GREEN, 'arial', 'left', 900);

            }
            else if(playerLevel===1){
                 moto = 'UMURIMO';
            drawHUDText('MOTO: ' +moto, vec3(.01, .42), .05, GREEN, 'arial', 'left', 900);

            }
            else if(playerLevel===2 && playerLevel<4){
                 moto = 'GUKUNDA IGIHUGU';
            drawHUDText('MOTO: ' +moto, vec3(.01, .42), .05, GREEN, 'arial', 'left', 900);

            }
            else{
                 moto = 'Ubumwe-Umurimo-gukunda-igihugu';
            drawHUDText('MOTO: ',vec3(.01, .42), .05, GREEN, 'arial', 'left', 900);
            drawHUDText(moto, vec3(.01, .46), .05, GREEN, 'arial', 'left', 900);


            }
        }
        
        // --- END HUD ---
        // Show checkpoint sign only if showCheckPoint and playerLevel > 0
    
       
    }

    if (debugInfo && !titleScreenMode) // mph
    {
        const mph = playerVehicle.velocity.z | 0;
        const mphPos = vec3(.01, .95);
        drawHUDText(mph + ' MPH', mphPos, .08, undefined, undefined, 'left', 900, 'italic');
    }
}

///////////////////////////////////////////////////////////////////////////////

function drawHUDText(text, pos, size = .1, color = WHITE, font = 'arial', textAlign = 'center', weight = 400, style = '', width, shadowScale = .07, outline) {
    size *= mainCanvasSize.y;
    if (width)
        width *= mainCanvasSize.y;
    pos = pos.multiply(mainCanvasSize);

    const context = mainContext;
    context.lineCap = context.lineJoin = 'round';
    context.font = `${style} ${weight} ${size}px ${font}`;
    context.textAlign = textAlign;

    const shadowOffset = size * shadowScale;
    context.fillStyle = rgb(0, 0, 0, color.a);
    if (shadowOffset)
        context.fillText(text, pos.x + shadowOffset, pos.y + shadowOffset, width);

    context.lineWidth = outline;
    outline && context.strokeText(text, pos.x, pos.y, width);
    context.fillStyle = color;
    context.fillText(text, pos.x, pos.y, width);
}