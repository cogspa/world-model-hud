import React, { useRef, useEffect, useState } from "react";

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * World Model HUD 2.0 – Visual Latent Orb
 *
 * Props:
 *   state: hudState from WorldModelSimulation
 *   params: world-model params (obsWeight, noise, memory, etc.)
 */
export default function LatentHUD({ state, params, visualParams }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const metricsRef = useRef({
        variance: 0.2,
        confidence: 0.8,
        driftX: 0,
        driftY: 0,
        regime: "BALANCED",
        cloudX: 0,
        cloudY: 0,
        // Default visual params
        trailAlpha: 0.15
    });

    const [mode, setMode] = useState("orb");

    // Update metricsRef whenever state/params change
    useEffect(() => {
        if (!state) return;

        const {
            cloudStd = 0,
            meanErrorToObs = 0,
            beliefVx = 0,
            beliefVy = 0,
            stochasticity = params?.noise ?? 1.0,
            obsWeight = params?.obsWeight ?? 0.08,
        } = state;

        // Visual Tuning
        const gain = visualParams?.varianceGain ?? 1.0;
        const smooth = visualParams?.confidenceSmooth ?? 0.12;

        // Heuristic normalization
        const normSpread = clamp(cloudStd / 400, 0, 1);
        const normError = clamp(meanErrorToObs / 300, 0, 1);

        // Apply Variance Gain
        const varianceTarget = clamp((0.15 + 0.85 * normSpread) * gain, 0, 1);

        // Apply Confidence Smoothing (manual lerp implementation over frames)
        // Since this effect runs on state updates (which might be slower than frames),
        // we might want to move smoothing to the render loop.
        // For now, let's just calculate the target here.
        const confidenceTarget = clamp(1 - 0.7 * normError, 0, 1);

        // Simple smoothing for confidence stored in ref
        const prevConf = metricsRef.current.confidence;
        const confidence = lerp(prevConf, confidenceTarget, smooth);

        const variance = varianceTarget; // Direct for now, or smooth it too if desired

        let regime = "BALANCED";
        if (obsWeight < 0.04) regime = "HALLUCINATING";
        else if (stochasticity > 1.6) regime = "UNCERTAIN";
        else if (obsWeight > 0.2 && stochasticity < 1.2) regime = "LOCKED";

        metricsRef.current = {
            variance,
            confidence,
            driftX: beliefVx,
            driftY: beliefVy,
            regime,
            cloudX: state.cloudCenterX,
            cloudY: state.cloudCenterY,
            trailAlpha: visualParams?.trailLength ?? 0.15
        };
    }, [state, params, visualParams]);

    // Canvas draw loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });

        let DPR = window.devicePixelRatio || 1;
        let W = (canvas.width = Math.floor(window.innerWidth * DPR));
        let H = (canvas.height = Math.floor(window.innerHeight * DPR));

        const resize = () => {
            DPR = window.devicePixelRatio || 1;
            W = canvas.width = Math.floor(window.innerWidth * DPR);
            H = canvas.height = Math.floor(window.innerHeight * DPR);
        };

        window.addEventListener("resize", resize);

        const draw = () => {
            const {
                variance,
                confidence,
                driftX,
                driftY,
                regime,
                cloudX,
                cloudY,
                trailAlpha
            } = metricsRef.current;

            // Trail Logic (Transparent Fade)
            // We use destination-out to gradually erase the previous frame's alpha
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();

            // Note: If trailAlpha is 1, it acts like clearRect (instant clear)
            // If trailAlpha is 0.1, it leaves long trails

            // Use the particle cloud's center, or fall back to screen center if not yet active
            const targetX = cloudX ?? W * 0.5;
            const targetY = cloudY ?? H * 0.5;

            // Map variance to color (blue -> purple -> red)
            const h = lerp(220, 0, Math.pow(variance, 0.85));
            const s = 75;
            const l = 52;

            const baseRadius = 20 * (W / 1280);
            const r = baseRadius + 60 * confidence;
            const sigma = 10 + 50 * variance;

            ctx.save();
            ctx.translate(targetX, targetY);

            if (mode === "orb") {
                // Glow
                const grd = ctx.createRadialGradient(
                    0,
                    0,
                    r * 0.4,
                    0,
                    0,
                    r + sigma
                );
                grd.addColorStop(0, `hsla(${h},${s}%,${l}%,0.22)`);
                grd.addColorStop(1, `hsla(${h},${s}%,${l}%,0)`);
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(0, 0, r + sigma, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = `hsl(${h},${s}%,${Math.max(l - 8, 30)}%)`;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();

                // Thin outline
                ctx.strokeStyle = `hsla(${h},${s}%,90%,0.9)`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            } else if (mode === "minimal") {
                // Just a ring + ticks
                ctx.strokeStyle = `hsla(${h},${s}%,80%,0.8)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();

                // Confidence notch
                ctx.save();
                ctx.rotate(-Math.PI / 2);
                const notchAngle = lerp(0.1, Math.PI * 1.2, confidence);
                ctx.strokeStyle = `hsla(${h},${s}%,90%,1)`;
                ctx.beginPath();
                ctx.arc(0, 0, r + 6, 0, notchAngle);
                ctx.stroke();
                ctx.restore();
            } else if (mode === "wire") {
                // Wireframe style: concentric rings based on variance
                const rings = 4;
                for (let i = 1; i <= rings; i++) {
                    const rr = r * (i / rings);
                    ctx.strokeStyle = `hsla(${h},${s}%,${40 + i * 8}%,0.6)`;
                    ctx.lineWidth = i === rings ? 1.5 : 0.8;
                    ctx.beginPath();
                    ctx.arc(0, 0, rr, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Drift vector (for all modes)
            const driftMag = Math.hypot(driftX, driftY);
            if (driftMag > 0.0005) {
                const ang = Math.atan2(driftY, driftX);
                const len = r * (mode === "minimal" ? 1.1 : 1.3);
                ctx.strokeStyle = `hsla(${h},${s}%,92%,0.95)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
                ctx.stroke();

                // Tip
                ctx.beginPath();
                ctx.arc(
                    Math.cos(ang) * len,
                    Math.sin(ang) * len,
                    3.5,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = `hsla(${h},${s}%,95%,0.95)`;
                ctx.fill();
            }

            ctx.restore();

            // Regime label in corner
            ctx.font = `${12 * (W / 1280)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = "right";
            const regimeColor =
                regime === "LOCKED"
                    ? "#4ade80"
                    : regime === "HALLUCINATING"
                        ? "#f87171"
                        : regime === "UNCERTAIN"
                            ? "#fbbf24"
                            : "#e5e7eb";
            ctx.fillStyle = "rgba(15,23,42,0.9)";
            const pad = 12 * (W / 1280);
            const boxW = 180 * (W / 1280);
            const boxH = 26 * (W / 1280);
            const bx = W - pad - boxW;
            const by = pad;

            ctx.beginPath();
            ctx.roundRect(bx, by, boxW, boxH, 6 * (W / 1280));
            ctx.fill();
            ctx.strokeStyle = "rgba(148,163,184,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#94a3b8";
            ctx.fillText("Regime:", bx + boxW - pad - 80 * (W / 1280), by + boxH * 0.68);

            ctx.fillStyle = regimeColor;
            ctx.fillText(regime, bx + boxW - pad, by + boxH * 0.68);

            animRef.current = requestAnimationFrame(draw);
        };

        // Initial clear & start
        ctx.clearRect(0, 0, W, H); // Start transparent!
        draw();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [mode]);

    return (
        <>
            {/* Visual Orb HUD */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    pointerEvents: "none",
                    zIndex: 5, // below text HUD (10), above simulation (0)
                }}
            />

            {/* Tiny mode toggle (clickable) */}
            <div
                style={{
                    position: "fixed",
                    right: 24,
                    bottom: 24,
                    zIndex: 55,
                    display: "flex",
                    gap: 6,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: 11,
                }}
            >
                {["orb", "minimal", "wire"].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(148,163,184,0.5)",
                            background:
                                mode === m
                                    ? "rgba(15,23,42,0.95)"
                                    : "rgba(15,23,42,0.6)",
                            color: mode === m ? "#e5e7eb" : "#9ca3af",
                            cursor: "pointer",
                            pointerEvents: "auto",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </>
    );
}
