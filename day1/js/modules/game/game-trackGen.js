'use strict';

// Generates procedural or random race tracks

const testTrackBillboards=0;

// build the road with procedural generation
function buildTrack()
{
    // set random seed & time
    random.setSeed(trackSeed);
    track = [];

    let sectionXEndDistance = 0;
    let sectionYEndDistance = 0;
    let sectionTurn = 0;
    let noisePos = random.int(1e5);
    let sectionBumpFrequency = 0;
    let sectionBumpScale = 1;
    let currentNoiseFrequency = 0;
    let currentNoiseScale = 1;
    
    let turn = 0;

    // generate the road
    const trackEnd = levelGoal*checkpointTrackSegments;
    const roadTransitionRange = testQuick?min(checkpointTrackSegments,500):500;
    for(let i=0; i < trackEnd + 5e4; ++i)
    {
        const levelFloat = i/checkpointTrackSegments;
        const level = levelFloat|0;
        const levelInfo = getLevelInfo(level);
        const levelInfoLast = getLevelInfo(levelFloat-1);
        const levelLerpPercent = percent(i%checkpointTrackSegments, 0, roadTransitionRange);

        const roadGenWidth = laneWidth/2*lerp(levelLerpPercent, levelInfoLast.laneCount, levelInfo.laneCount);

        let height = 0;
        let width = roadGenWidth;

        const startOfTrack = !level && i < 400;
        const checkpointSegment = i%checkpointTrackSegments;
        const levelBetweenRange = 100;
        let isBetweenLevels = checkpointSegment < levelBetweenRange || 
            checkpointSegment > checkpointTrackSegments - levelBetweenRange;
        isBetweenLevels |= startOfTrack; // start of track

        if (isBetweenLevels)
        {
            // transition at start or end of level
            sectionXEndDistance = sectionYEndDistance = sectionTurn = 0;
        }
        else
        {
            // turns
            const turnChance = levelInfo.turnChance; // chance of turn
            const turnMin = levelInfo.turnMin;     // min turn
            const turnMax = levelInfo.turnMax;     // max turn
            const sectionDistanceMin = 100;
            const sectionDistanceMax = 400;
            if (sectionXEndDistance-- < 0)
            {
                // pick random section distance
                sectionXEndDistance = random.int(sectionDistanceMin,sectionDistanceMax);
                sectionTurn = random.bool(turnChance) ? random.floatSign(turnMin,turnMax) : 0;
            }

            // bumps
            const bumpChance   = levelInfo.bumpChance;   // chance of bump
            const bumpFreqMin  = levelInfo.bumpFreqMin;  // no bumps
            const bumpFreqMax  = levelInfo.bumpFreqMax;  // raipd bumps
            const bumpScaleMin = levelInfo.bumpScaleMin; // small rapid bumps
            const bumpScaleMax = levelInfo.bumpScaleMax; // large hills
            if (sectionYEndDistance-- < 0)
            {
                // pick random section distance
                sectionYEndDistance = random.int(sectionDistanceMin,sectionDistanceMax);
                if (random.bool(bumpChance))
                {
                    sectionBumpFrequency = random.float(bumpFreqMin,bumpFreqMax);
                    sectionBumpScale = random.float(bumpScaleMin,bumpScaleMax);
                }
                else
                {
                    sectionBumpFrequency = 0;
                    sectionBumpScale = bumpScaleMin;
                }
            }
        }

        if (i > trackEnd - 500)
            sectionTurn = 0; // no turns at end

        turn = lerp(.02,turn, sectionTurn); // smooth out turns

        // apply noise to height
        const noiseFrequency = currentNoiseFrequency 
            = lerp(.01, currentNoiseFrequency, sectionBumpFrequency);
        const noiseSize = currentNoiseScale 
            = lerp(.01, currentNoiseScale, sectionBumpScale);

        if (currentNoiseFrequency)
            noisePos += noiseFrequency/noiseSize;
        const noiseConstant = 20;
        height = noise1D(noisePos)*noiseConstant*noiseSize;

        // create track segment
        const o = vec3(turn, height, i*trackSegmentLength);
        track[i] = new TrackSegment(i, o, width);
    }

    // second pass
    for(let i=0; i < track.length; ++i)
    {
        // calculate pitch
        const iCheckpoint = i%checkpointTrackSegments;
        const t = track[i];
        const levelInfo = getLevelInfo(t.level);
        
        const previous = track[i-1];
        if (previous)
        {
            t.pitch = Math.atan2(previous.offset.y-t.offset.y, trackSegmentLength);
            const d = vec3(0,t.offset.y-previous.offset.y, trackSegmentLength);
            t.normal = d.cross(vec3(1,0)).normalize();
        }
    }
}