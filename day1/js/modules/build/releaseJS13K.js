'use strict';

const debug = 0;
let debugInfo, debugMesh, debugTile, debugGenerativeCanvas, devMode, enhancedMode;
const RP31KBuildLevel2 = 1; // more space is needed for RP31K

// disable debug features
function ASSERT() {}
function debugInit() {}
function drawDebug() {}
function debugUpdate() {}
function debugSaveCanvas() {}
function debugSaveText() {}
function debugDraw() {}
function debugSaveDataURL() {}