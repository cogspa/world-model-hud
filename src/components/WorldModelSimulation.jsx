import React, { useRef, useEffect } from 'react';

// -----------------------------------------------------------
// Noise / Math helpers from original snippet
// -----------------------------------------------------------
function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
}
function smooth(t) {
    return t * t * (3 - 2 * t);
}
function vnoise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const v00 = hash2(xi, yi);
    const v10 = hash2(xi + 1, yi);
    const v01 = hash2(xi, yi + 1);
    const v11 = hash2(xi + 1, yi + 1);
    const i1 = v00 + (v10 - v00) * smooth(xf);
    const i2 = v01 + (v11 - v01) * smooth(xf);
    return i1 + (i2 - i1) * smooth(yf);
}

// -----------------------------------------------------------
// Terrain / Map Logic
// -----------------------------------------------------------
const getTerrainHeight = (x, y, time) => {
    // Base procedural noise (shifting map)
    const scale = 0.003;
    const v = vnoise(x * scale + time * 0.2, y * scale + time * 0.1);

    // "Islands" structure: smooth noise mapped to 0..1
    return v;
};

const gradient = (x, y, time, dist = 1) => {
    const h0 = getTerrainHeight(x, y, time);
    const hx = getTerrainHeight(x + dist, y, time);
    const hy = getTerrainHeight(x, y + dist, time);
    return { dx: hx - h0, dy: hy - h0 };
};

export default function WorldModelSimulation({ onUpdateHUD, params, onAgentCountChange }) {
    const canvasRef = useRef(null);
    const paramsRef = useRef(params);
    // User modifications (Click to add walls)
    // We store simple circular obstacles
    const userObstaclesRef = useRef([]);

    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // -----------------------------------------------------------
        // Configuration & State
        // -----------------------------------------------------------
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);

        const initAgents = () => {
            const N = paramsRef.current.agentCount || 4000;
            const spread = paramsRef.current.spread || 1.0;

            if (onAgentCountChange) onAgentCountChange(N);

            const marginX = (W * (1 - spread)) / 2;
            const marginY = (H * (1 - spread)) / 2;
            const spawnW = W * spread;
            const spawnH = H * spread;

            return new Array(N).fill(0).map((_, i) => ({
                index: i,
                x: marginX + Math.random() * spawnW,
                y: marginY + Math.random() * spawnH,
                vx: 0,
                vy: 0,
                phase: Math.random(),
            }));
        };

        let agents = initAgents();
        let currentCount = agents.length;
        let currentSpread = paramsRef.current.spread;

        let obs = { x: W / 2, y: H / 2, active: false, painting: false };

        const handleResize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };

        const updatePointer = (clientX, clientY) => {
            obs.x = clientX;
            obs.y = clientY;

            // Painting logic: Add obstacle if painting
            // Only add if far enough from last obstacle to prevent overcrowding
            if (obs.painting) {
                const lastOb = userObstaclesRef.current[userObstaclesRef.current.length - 1];
                const dist = lastOb ? Math.hypot(lastOb.x - clientX, lastOb.y - clientY) : 999;

                if (dist > 25) { // Spacing check
                    userObstaclesRef.current.push({
                        x: clientX,
                        y: clientY,
                        radius: 25 + Math.random() * 15,
                        life: 1.0,
                        angle: Math.random() * Math.PI * 2 // Rotation for visual variety
                    });
                }
            }
        };

        const onMouseMove = (e) => updatePointer(e.clientX, e.clientY);
        const onTouchMove = (e) => {
            if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        };
        const onDown = () => { obs.active = true; obs.painting = true; };
        const onUp = () => { obs.active = false; obs.painting = false; };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchstart', onDown);
        window.addEventListener('touchend', onUp);

        let t = 0;
        const render = () => {
            t += 0.005;
            const currentParams = paramsRef.current;

            if (currentParams.agentCount !== currentCount || currentParams.spread !== currentSpread) {
                agents = initAgents();
                currentCount = agents.length;
                currentSpread = currentParams.spread;
            }

            // Map Refresh (Clear)
            ctx.fillStyle = `rgba(10,12,14,${1 - currentParams.memory})`;
            ctx.fillRect(0, 0, W, H);

            if (obs.painting) {
                ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
                ctx.font = "12px monospace";
                ctx.fillText("PAINTING OBSTACLES", obs.x + 20, obs.y);
            }

            // -------------------------------------------------------
            // 1. Draw Environment (Topographic Map)
            // -------------------------------------------------------
            const gridSize = 30; // Resolution of map
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(70, 100, 120, 0.15)'; // Dim map lines
            ctx.beginPath();

            // Optimization: Don't draw every pixel. Draw marching squares or just grid points?
            // Simple approach: Draw grid, color changes based on height
            const wallThreshold = 0.65; // Height > 0.65 is a "Wall"

            for (let x = 0; x < W; x += gridSize) {
                for (let y = 0; y < H; y += gridSize) {
                    const h = getTerrainHeight(x, y, t);
                    if (h > wallThreshold) {
                        // Draw Wall Segment
                        ctx.fillStyle = `rgba(200, 100, 100, ${h - wallThreshold})`; // Red hue
                        ctx.fillRect(x, y, gridSize, gridSize);
                    } else if (h > 0.5 && h < 0.55) {
                        // Draw Contour Line
                        ctx.strokeRect(x, y, 2, 2);
                    }
                }
            }
            ctx.stroke();

            // 2. Draw User Obstacles (Void Zones)
            userObstaclesRef.current = userObstaclesRef.current.filter(o => o.life > 0.01);

            userObstaclesRef.current.forEach(o => {
                o.life *= 0.999; // Slower decay

                ctx.save();
                ctx.translate(o.x, o.y);
                // ctx.rotate(o.angle + t); // Removed rotation for static wall feel

                // Outer Dashed Box
                const size = o.radius * 2;
                ctx.strokeStyle = `rgba(255, 100, 100, ${o.life * 0.5})`;
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(-size / 2, -size / 2, size, size); // Draw centered square
                ctx.stroke();

                // Inner Void Fill
                ctx.fillStyle = `rgba(20, 0, 0, ${o.life * 0.9})`; // Darker void
                ctx.beginPath();
                ctx.rect(-(size * 0.85) / 2, -(size * 0.85) / 2, size * 0.85, size * 0.85);
                ctx.fill();

                // Crosshair / X
                ctx.strokeStyle = `rgba(255, 50, 50, ${o.life * 0.3})`;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.3);
                ctx.lineTo(size * 0.3, size * 0.3);
                ctx.moveTo(size * 0.3, -size * 0.3);
                ctx.lineTo(-size * 0.3, size * 0.3);
                ctx.stroke();

                ctx.restore();
            });

            // -------------------------------------------------------
            // 3. Agent Simulation
            // -------------------------------------------------------
            let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumDistToObs = 0;
            let probeAgent = agents[0];

            const batches = { standard: [], v1: [], v2: [], v3: [], v4: [], eLow: [], eMid: [], eHigh: [] };

            for (let i = 0; i < agents.length; i++) {
                const a = agents[i];

                // A) Terrain Avoidance Force
                const h = getTerrainHeight(a.x, a.y, t);
                // Calculate slope
                const { dx, dy } = gradient(a.x, a.y, t, 5); // Look ahead 5px

                // If on high ground (wall), slide down fast
                if (h > wallThreshold) {
                    a.vx -= dx * 10; // Simple gradient descent
                    a.vy -= dy * 10;
                }

                // B) User Obstacle Avoidance
                for (let ob of userObstaclesRef.current) {
                    const odx = a.x - ob.x;
                    const ody = a.y - ob.y;
                    const odist = Math.hypot(odx, ody);
                    const safeR = ob.radius * ob.life + 5;
                    if (odist < safeR) {
                        // Push out
                        const push = (safeR - odist) * 0.1;
                        const ang = Math.atan2(ody, odx);
                        a.vx += Math.cos(ang) * push;
                        a.vy += Math.sin(ang) * push;
                    }
                }

                // C) Standard Dynamics (Noise + Obs Attraction)
                const scale = 0.0017 * currentParams.noise;
                const n = vnoise(a.x * scale + t * 0.7, a.y * scale - t * 0.5);
                const ang = n * Math.PI * 2 + a.phase * 0.3;

                // Observation update (Attractor)
                // Only attract if user is NOT painting (painting = obstacle creation mode)
                // Actually, let's allow both. You are painting barriers, they run to your brush? 
                // Maybe better: They run to cursor, but cursor leaves barriers behind.
                const obsDx = obs.x - a.x;
                const obsDy = obs.y - a.y;
                const dist = Math.hypot(obsDx, obsDy) + 1e-5;

                sumX += a.x; sumY += a.y; sumX2 += a.x * a.x; sumY2 += a.y * a.y; sumDistToObs += dist;

                const K = currentParams.obsWeight * (obs.active ? 1.8 : 0.8);
                const obsX = (obsDx / dist) * K;
                const obsY = (obsDy / dist) * K;

                a.vx = (a.vx + Math.cos(ang) * 0.15 + obsX) * 0.96;
                a.vy = (a.vy + Math.sin(ang) * 0.15 + obsY) * 0.96;

                const prevX = a.x;
                const prevY = a.y;
                a.x += a.vx;
                a.y += a.vy;

                // Wrap
                if (a.x < 0) a.x += W;
                if (a.x > W) a.x -= W;
                if (a.y < 0) a.y += H;
                if (a.y > H) a.y -= H;

                // Rendering Batches
                if (currentParams.visualMode === 'velocity') {
                    const angle = Math.atan2(a.vy, a.vx);
                    if (angle > 0 && angle < 1.57) batches.v1.push(prevX, prevY, a.x, a.y);
                    else if (angle >= 1.57) batches.v2.push(prevX, prevY, a.x, a.y);
                    else if (angle < 0 && angle > -1.57) batches.v3.push(prevX, prevY, a.x, a.y);
                    else batches.v4.push(prevX, prevY, a.x, a.y);
                } else if (currentParams.visualMode === 'error') {
                    if (dist < 150) batches.eLow.push(prevX, prevY, a.x, a.y);
                    else if (dist < 400) batches.eMid.push(prevX, prevY, a.x, a.y);
                    else batches.eHigh.push(prevX, prevY, a.x, a.y);
                } else {
                    batches.standard.push(prevX, prevY, a.x, a.y);
                }
            }

            // Draw Batches
            ctx.lineWidth = currentParams.visualMode === 'error' ? 2 : 1;
            const drawBatch = (coords, color) => {
                if (coords.length === 0) return;
                ctx.strokeStyle = color;
                ctx.beginPath();
                for (let i = 0; i < coords.length; i += 4) {
                    ctx.moveTo(coords[i], coords[i + 1]);
                    ctx.lineTo(coords[i + 2], coords[i + 3]);
                }
                ctx.stroke();
            };

            if (currentParams.visualMode === 'velocity') {
                drawBatch(batches.v1, 'rgba(0, 255, 255, 0.4)');
                drawBatch(batches.v2, 'rgba(255, 0, 255, 0.4)');
                drawBatch(batches.v3, 'rgba(255, 255, 0, 0.4)');
                drawBatch(batches.v4, 'rgba(255, 255, 255, 0.4)');
            } else if (currentParams.visualMode === 'error') {
                drawBatch(batches.eLow, 'rgba(0, 255, 100, 0.9)');
                drawBatch(batches.eMid, 'rgba(255, 200, 0, 0.6)');
                drawBatch(batches.eHigh, 'rgba(255, 0, 50, 0.4)');
            } else {
                drawBatch(batches.standard, 'rgba(210, 225, 245, 0.08)');
            }

            if (onUpdateHUD && agents.length > 0) {
                const speed = Math.sqrt(probeAgent.vx ** 2 + probeAgent.vy ** 2);
                const N = agents.length;
                const meanX = sumX / N;
                const meanY = sumY / N;
                const varX = sumX2 / N - meanX * meanX;
                const varY = sumY2 / N - meanY * meanY;
                const cloudStd = Math.sqrt(Math.max(varX, 0) + Math.max(varY, 0));
                const meanErrorToObs = sumDistToObs / N;

                onUpdateHUD({
                    probeIndex: probeAgent.index,
                    latentX: probeAgent.x,
                    latentY: probeAgent.y,
                    beliefVx: probeAgent.vx,
                    beliefVy: probeAgent.vy,
                    speedNorm: speed,
                    phase: probeAgent.phase,
                    obsX: obs.x,
                    obsY: obs.y,
                    obsActive: obs.painting || obs.active, // Count painting as active obs
                    beliefRetention: currentParams.memory,
                    stochasticity: currentParams.noise,
                    obsWeight: currentParams.obsWeight,
                    cloudCenterX: meanX,
                    cloudCenterY: meanY,
                    cloudStd,
                    meanErrorToObs,
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        ctx.fillStyle = '#0a0c0e';
        ctx.fillRect(0, 0, W, H);
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchstart', onDown);
            window.removeEventListener('touchend', onUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
    );
}
