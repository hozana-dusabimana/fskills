// Banner-related variables
let activeBanners = [];
lastBannerDistance = 0; // Track when the last banner was created
let textNumber = 0; // Persistent index for banner messages

// Advertisement banner properties
const bannerHeight = 120; // Increased height for better visibility
const bannerSpacing = 300; // Space between banners in meters
const bannerColors = [
    '#FFFFFF' // White background
];
const bannerTexts = [
    'UBUMWE',
    'UMURIMO',
    'GUKUNDA',
    'IGIHUGU',
    
];
const bannerTextColor = '#FF0000'; // Red text color
const bannerBorderColor = '#000000'; // Black border color
const bannerBorderWidth = 4; // Thicker border
const postWidth = 15; // Width of support posts
const postColor = '#A0522D'; // Sienna/brown color for posts

/**
 * Updates and draws the banners along the road
 * @param {CanvasRenderingContext2D} ctx - The drawing context
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} speed - Car speed in meters/frame
 * @param {number} carDistance - Current distance traveled
 * @param {number} baseX - Base X position of the road
 * @param {number} roadWidth - Width of the road
 * @param {number} horizonYPos - Y position of the horizon
 * @param {number} curveOffset - Current curve offset
 * @param {number} segmentHeight - Height of each road segment
 */
function updateAndDrawBanners(ctx, canvas, speed, carDistance, baseX, roadWidth, horizonYPos, curveOffset, segmentHeight) {
    // Remove banners that are off-screen
    activeBanners = activeBanners.filter(banner => banner.y < canvas.height + 50);

    // Only spawn a new banner if there are none on screen
    if (activeBanners.length === 0 && bannerTexts.length > 0) {
        // Calculate initial banner position at the horizon
        const initialBannerWidth = roadWidth ; // Start smaller at horizon
        const bannerX = baseX - initialBannerWidth / 2;
        const bannerY = canvas.height/5; // Increased distance from horizon

        const bannerText = bannerTexts[textNumber];
        const bannerColor = bannerColors[0];

        activeBanners.push({
            x: bannerX,
            y: bannerY,
            initialWidth: initialBannerWidth,
            width: initialBannerWidth,
            height: bannerHeight,
            text: bannerText,
            color: bannerColor,
            initialX: bannerX
        });

        textNumber = (textNumber + 1) % bannerTexts.length;
        lastBannerDistance = carDistance;
    }

    // Update and draw active banners
    activeBanners = activeBanners.filter(banner => {
        // Update banner position based on speed
        banner.y += speed;

        // Calculate road's horizontal offset and width at banner's y position
        const i = (canvas.height - banner.y) / 100; // segments = 100
        const roadXOffset = curveOffset * 0.01 * i;

        // Calculate perspective scaling for this y position (same as road)
        const perspectiveFactor = 0.8; // same as road.js
        const perspectiveScale = 1 - (i / 100) * perspectiveFactor;
        const currentRoadWidth = roadWidth * perspectiveScale;

        // Set banner width to match the road's width at this position
        banner.width = currentRoadWidth;

        // Update banner's x position to follow road curve and maintain center alignment
        banner.x = baseX - banner.width / 2 + roadXOffset;

        // Only keep and draw banners that are still visible
        if (banner.y < canvas.height + banner.height) {
            // Save the current context state
            ctx.save();

            // Set global composite operation to ensure banner is drawn on top
            ctx.globalCompositeOperation = 'source-over';

            // Draw banner background with slight transparency
            ctx.fillStyle = banner.color;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(banner.x, banner.y, banner.width, banner.height);

            // Draw banner border
            ctx.strokeStyle = bannerBorderColor;
            ctx.lineWidth = bannerBorderWidth;
            ctx.strokeRect(banner.x, banner.y, banner.width, banner.height);

            // Draw banner text
            ctx.fillStyle = bannerTextColor;
            ctx.font = `bold ${banner.height * 0.5}px Arial`; // Increased text size
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(banner.text, banner.x + banner.width / 2, banner.y + banner.height / 2);

            // Draw support posts (always from banner corners, not road edges)
            ctx.fillStyle = postColor;
            const postHeight = banner.height + 40; // Increased post height
            // Left post
            ctx.fillRect(banner.x, banner.y + banner.height, postWidth, postHeight);
            // Right post
            ctx.fillRect(banner.x + banner.width - postWidth, banner.y + banner.height, postWidth, postHeight);

            ctx.restore();
            return true;
        }
        return false;
    });
} 