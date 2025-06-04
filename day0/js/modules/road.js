let carDistance = 0;
let curveOffset = 0;
let curveDirection = 0;
hillOffset = 0;
let hillDirection = 0;



// Function to draw the road with perspective and lane lines
function drawRoad(ctx, canvas, speed = 5) {
    if (!ctx || !canvas) {
        console.error('drawRoad: ctx or canvas is undefined', { ctx, canvas });
        return;
    }

    const segments = 100;
    const roadWidth = 320;
    const baseX = canvas.width / 2;
    const horizonYPos = canvas.height / 3;
    const leftEdge = [];
    const rightEdge = [];
    const laneLines = [[], []];
    const centerLine = [];
    const EPSILON = 0.5; // Tolerance for floating point comparison
    const dashPattern = [20, 20]; // Dash and gap length
    const dashCycle = dashPattern[0] + dashPattern[1];

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = canvas.height - t * (canvas.height - horizonYPos);
        const width = roadWidth * (1 - t);
        let xOffset = curveOffset * 0.01 * i;
        const maxOffset = (canvas.width - width) / 2;
        xOffset = Math.max(-maxOffset, Math.min(maxOffset, xOffset));
        const left = baseX - width / 2 + xOffset;
        const right = baseX + width / 2 + xOffset;
        const yFinal = (i === segments) ? horizonYPos : y;
        const leftFinal = (i === segments) ? baseX : left;
        const rightFinal = (i === segments) ? baseX : right;
        leftEdge.push([leftFinal, yFinal]);
        rightEdge.push([rightFinal, yFinal]);
        for (let lane = 1; lane < 3; lane++) {
            const laneX = (i === segments)
                ? baseX
                : left + (lane * (right - left) / 3);
            laneLines[lane - 1].push([laneX, yFinal]);
        }
        const centerX = (leftFinal + rightFinal) / 2;
        centerLine.push([centerX, yFinal]);
    }

    // Draw road as a single polygon
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftEdge[0][0], leftEdge[0][1]);
    for (let i = 1; i < leftEdge.length; i++) {
        ctx.lineTo(leftEdge[i][0], leftEdge[i][1]);
    }
    for (let i = rightEdge.length - 1; i >= 0; i--) {
        ctx.lineTo(rightEdge[i][0], rightEdge[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.restore();

    // Helper to check if a point is at the vanishing point (with tolerance)
    function atVanishing(p) {
        return Math.abs(p[0] - baseX) < EPSILON && Math.abs(p[1] - horizonYPos) < EPSILON;
    }

    // Draw lane lines as polylines, skipping any segment where either endpoint is at the vanishing point
    ctx.save();
    ctx.strokeStyle = '#FFF';
    ctx.setLineDash(dashPattern);
    ctx.lineDashOffset = distance % dashCycle;
    ctx.lineWidth = 2;
    for (let l = 0; l < laneLines.length; l++) {
        ctx.beginPath();
        ctx.moveTo(laneLines[l][0][0], laneLines[l][0][1]);
        for (let i = 1; i < laneLines[l].length; i++) {
            if (!(atVanishing(laneLines[l][i - 1]) || atVanishing(laneLines[l][i]))) {
                ctx.lineTo(laneLines[l][i][0], laneLines[l][i][1]);
            } else {
                ctx.moveTo(laneLines[l][i][0], laneLines[l][i][1]);
            }
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.restore();

    // Draw center line as polyline
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.setLineDash(dashPattern);
    ctx.lineDashOffset = distance % dashCycle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerLine[0][0], centerLine[0][1]);
    for (let i = 1; i < centerLine.length; i++) {
        if (!(atVanishing(centerLine[i - 1]) || atVanishing(centerLine[i]))) {
            ctx.lineTo(centerLine[i][0], centerLine[i][1]);
        } else {
            ctx.moveTo(centerLine[i][0], centerLine[i][1]);
        }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.restore();

    // Draw side lines as polylines, skipping any segment where either endpoint is at the vanishing point
    ctx.save();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftEdge[0][0], leftEdge[0][1]);
    for (let i = 1; i < leftEdge.length; i++) {
        if (!(atVanishing(leftEdge[i - 1]) || atVanishing(leftEdge[i]))) {
            ctx.lineTo(leftEdge[i][0], leftEdge[i][1]);
        } else {
            ctx.moveTo(leftEdge[i][0], leftEdge[i][1]);
        }
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightEdge[0][0], rightEdge[0][1]);
    for (let i = 1; i < rightEdge.length; i++) {
        if (!(atVanishing(rightEdge[i - 1]) || atVanishing(rightEdge[i]))) {
            ctx.lineTo(rightEdge[i][0], rightEdge[i][1]);
        } else {
            ctx.moveTo(rightEdge[i][0], rightEdge[i][1]);
        }
    }
    ctx.stroke();
    ctx.restore();

    // Update car distance
    carDistance += speed;
    if (carDistance >= 200) {
        if (Math.random() < 0.05) {
            curveDirection = (Math.random() - 0.5) * 1.5;
            hillDirection = (Math.random() - 0.5) * 2.5;
        }
        curveOffset += curveDirection;
        hillOffset += hillDirection;
    }
}
// Utility: Get lane boundaries for 3 lanes (call this from your vehicle/obstacle logic)
function getLaneBounds(laneIndex, canvas, roadWidth, baseX, xOffset) {
    // laneIndex: 0 (left), 1 (center), 2 (right)
    const left = baseX - roadWidth / 2 + xOffset;
    const right = baseX + roadWidth / 2 + xOffset;
    const laneWidth = (right - left) / 3;
    const laneLeft = left + laneIndex * laneWidth;
    const laneRight = laneLeft + laneWidth;
    return { laneLeft, laneRight };
}

