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

export default function WorldModelSimulation({ onUpdateHUD, params, onAgentCountChange }) {
    const canvasRef = useRef(null);

    // Use a ref to keep track of params inside the animation loop
    // without causing the effect to re-run and reset the simulation.
    const paramsRef = useRef(params);
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

        // -----------------------------------------------------------
        // Agents Setup (Re-run when count/spread changes)
        // -----------------------------------------------------------
        // We use a mutable array ref so we don't need to re-bind the render loop
        // but we do need to re-populate it.

        const initAgents = () => {
            const N = paramsRef.current.agentCount || 4000;
            const spread = paramsRef.current.spread || 1.0;

            if (onAgentCountChange) onAgentCountChange(N);

            // Calculate spawn bounds based on spread
            // spread=1.0 -> full screen
            // spread=0.1 -> small center box
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

        // Check if we need to re-init (simple polling in render loop or effect dependency?)
        // Effect dependency is cleaner for initialization.
        // But we want to avoid re-attaching event listeners.
        // Let's just use a separate effect for agents? 
        // Actually, simpler: just check paramsRef in the loop? 
        // No, re-allocating 10k objects per frame is bad.
        // Let's use a "dirty" flag or just compare counts.

        let currentCount = agents.length;
        let currentSpread = paramsRef.current.spread;

        // -----------------------------------------------------------
        // Interaction State
        // -----------------------------------------------------------
        let obs = { x: W / 2, y: H / 2, active: false };

        const handleResize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };

        const updatePointer = (clientX, clientY) => {
            obs.x = clientX;
            obs.y = clientY;
        };

        // Event Listeners
        window.addEventListener('resize', handleResize);

        const onMouseMove = (e) => updatePointer(e.clientX, e.clientY);
        const onTouchMove = (e) => {
            if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        };
        const onDown = () => (obs.active = true);
        const onUp = () => (obs.active = false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchstart', onDown);
        window.addEventListener('touchend', onUp);

        // -----------------------------------------------------------
        // Animation Loop
        // -----------------------------------------------------------
        let t = 0;
        const render = () => {
            t += 0.003;
            const currentParams = paramsRef.current;

            // Check for Re-init triggers
            if (currentParams.agentCount !== currentCount || currentParams.spread !== currentSpread) {
                agents = initAgents();
                currentCount = agents.length;
                currentSpread = currentParams.spread;
            }

            // (a) Memory decay (trails)
            ctx.fillStyle = `rgba(10,12,14,${1 - currentParams.memory})`;
            ctx.fillRect(0, 0, W, H);

            // (b) Observation visualization
            const obsGrad = ctx.createRadialGradient(obs.x, obs.y, 4, obs.x, obs.y, 120);
            obsGrad.addColorStop(0, `rgba(180,200,255,0.05)`);
            obsGrad.addColorStop(1, `rgba(255,255,255,0)`);
            ctx.fillStyle = obsGrad;
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, 120, 0, Math.PI * 2);
            ctx.fill();

            // (b.5) Dynamics Prior Visualization (The "Wind")
            if (currentParams.showPrior) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();

                const gridSize = 40;
                const arrowLen = 12;

                for (let x = 0; x < W; x += gridSize) {
                    for (let y = 0; y < H; y += gridSize) {
                        // Calculate noise at this grid point (same as agent logic)
                        const scale = 0.0017 * currentParams.noise; // Use current noise param
                        // Note: We use t*0.7 to match agent time evolution
                        const n = vnoise(x * scale + t * 0.7, y * scale - t * 0.5);
                        const ang = n * Math.PI * 2; // Base angle without phase offset

                        const dx = Math.cos(ang) * arrowLen;
                        const dy = Math.sin(ang) * arrowLen;

                        ctx.moveTo(x, y);
                        ctx.lineTo(x + dx, y + dy);

                        // Arrowhead (optional, maybe too expensive/cluttered? simple lines are better)
                    }
                }
                ctx.stroke();
            }

            // (c) & (d) Dynamics + Rollout

            // We'll track the "Probe" agent (index 0) to send to HUD
            let probeAgent = agents[0];

            // Prepare batches for colored rendering
            // Standard: 1 batch
            // Velocity: 4 batches (Cyan, Magenta, Yellow, White)
            // Error: 3 batches (Blue, Purple, Red)
            const batches = {
                standard: [],
                // Velocity buckets (by quadrant)
                v1: [], v2: [], v3: [], v4: [],
                // Error buckets (by distance)
                eLow: [], eMid: [], eHigh: []
            };

            for (let i = 0; i < agents.length; i++) {
                const a = agents[i];

                // Dynamics prior (noise field)
                const scale = 0.0017 * currentParams.noise;
                const n = vnoise(a.x * scale + t * 0.7, a.y * scale - t * 0.5);
                const ang = n * Math.PI * 2 + a.phase * 0.3;

                // Observation update
                const dx = obs.x - a.x;
                const dy = obs.y - a.y;
                const dist = Math.hypot(dx, dy) + 1e-5;

                // "Kalman gain" equivalent
                const K = currentParams.obsWeight * (obs.active ? 1.8 : 0.8);
                const obsX = (dx / dist) * K;
                const obsY = (dy / dist) * K;

                // Belief update
                a.vx = (a.vx + Math.cos(ang) * 0.15 + obsX) * 0.96;
                a.vy = (a.vy + Math.sin(ang) * 0.15 + obsY) * 0.96;

                // Rollout
                const prevX = a.x;
                const prevY = a.y;
                a.x += a.vx;
                a.y += a.vy;

                // Wrap
                if (a.x < 0) a.x += W;
                if (a.x > W) a.x -= W;
                if (a.y < 0) a.y += H;
                if (a.y > H) a.y -= H;

                // Batching for render
                if (currentParams.visualMode === 'velocity') {
                    // Color by angle
                    const angle = Math.atan2(a.vy, a.vx);
                    if (angle > 0 && angle < 1.57) batches.v1.push(prevX, prevY, a.x, a.y);
                    else if (angle >= 1.57) batches.v2.push(prevX, prevY, a.x, a.y);
                    else if (angle < 0 && angle > -1.57) batches.v3.push(prevX, prevY, a.x, a.y);
                    else batches.v4.push(prevX, prevY, a.x, a.y);
                } else if (currentParams.visualMode === 'error') {
                    // Color by distance to obs
                    if (dist < 150) batches.eLow.push(prevX, prevY, a.x, a.y);
                    else if (dist < 400) batches.eMid.push(prevX, prevY, a.x, a.y);
                    else batches.eHigh.push(prevX, prevY, a.x, a.y);
                } else {
                    // Standard
                    batches.standard.push(prevX, prevY, a.x, a.y);
                }
            }

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
                drawBatch(batches.v1, 'rgba(0, 255, 255, 0.4)'); // Cyan
                drawBatch(batches.v2, 'rgba(255, 0, 255, 0.4)'); // Magenta
                drawBatch(batches.v3, 'rgba(255, 255, 0, 0.4)'); // Yellow
                drawBatch(batches.v4, 'rgba(255, 255, 255, 0.4)'); // White
            } else if (currentParams.visualMode === 'error') {
                // Heatmap Style: High visibility
                drawBatch(batches.eLow, 'rgba(0, 255, 100, 0.9)');   // Bright Green (Close)
                drawBatch(batches.eMid, 'rgba(255, 200, 0, 0.6)');   // Orange/Yellow (Medium)
                drawBatch(batches.eHigh, 'rgba(255, 0, 50, 0.4)');   // Red (Far)
            } else {
                drawBatch(batches.standard, 'rgba(210, 225, 245, 0.08)');
            }

            // Update HUD with Probe Data
            if (onUpdateHUD) {
                const speed = Math.sqrt(probeAgent.vx ** 2 + probeAgent.vy ** 2);
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
                    obsActive: obs.active,
                    beliefRetention: currentParams.memory,
                    stochasticity: currentParams.noise,
                    obsWeight: currentParams.obsWeight,
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        // Start
        ctx.fillStyle = '#0a0c0e';
        ctx.fillRect(0, 0, W, H);
        render();

        // Cleanup
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
    }, []); // Run once on mount

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
    );
}
