import React from "react";

export default function TechnicalPanel({ onClose }) {
    return (
        <div className="wm-technical-panel">
            <div className="wm-tech-header">
                <h3>Under the Hood</h3>
                <button onClick={onClose}>×</button>
            </div>

            <div className="wm-tech-section">
                <h4>1. The Math (Simplified Kalman Filter)</h4>
                <div className="wm-equation">
                    <div className="wm-eq-row">
                        <span className="var">v</span><sub>t+1</sub> =
                        <span className="var">v</span><sub>t</sub> · <span className="param">memory</span> +
                        <span className="param">K</span> · (<span className="var">obs</span> - <span className="var">x</span><sub>t</sub>)
                    </div>
                    <div className="wm-eq-row">
                        <span className="var">x</span><sub>t+1</sub> =
                        <span className="var">x</span><sub>t</sub> +
                        <span className="var">v</span><sub>t+1</sub> +
                        <span className="func">Noise</span>(t)
                    </div>
                </div>
                <p>
                    This is a <strong>Particle Filter</strong> update step.
                    <span className="param"> K</span> is the "Kalman Gain" (Observation Weight).
                    It blends the <em>Prediction</em> (internal velocity) with the <em>Correction</em> (pull towards observation).
                </p>
            </div>

            <div className="wm-tech-section">
                <h4>2. The Code (Simulation Loop)</h4>
                <pre className="wm-code-block">
                    {`// 1. Dynamics Prior (Prediction)
const noise = vnoise(a.x, a.y, t);

// 2. Observation (Correction)
const dx = obs.x - a.x;
const K = params.obsWeight;
a.vx += (dx * K) + noise;

// 3. State Update
a.x += a.vx * params.memory;`}
                </pre>
            </div>

            <div className="wm-tech-section">
                <h4>3. Directions for Improvement</h4>
                <ul>
                    <li>
                        <strong>Resampling (SIR):</strong> Currently, particles never die.
                        A true Particle Filter would <em>kill</em> particles far from the observation and <em>respawn</em> them near high-probability areas to track complex distributions better.
                    </li>
                    <li>
                        <strong>Learned Dynamics:</strong> Replace the static <code>vnoise()</code> function with a
                        <strong> Neural Network</strong> (e.g., a Transformer or RSSM) trained on real physics data.
                        This turns it into a "Learned World Model" (like DreamerV3).
                    </li>
                    <li>
                        <strong>Active Inference:</strong> Give agents <em>goals</em>.
                        Instead of just tracking the mouse, they could try to minimize "Free Energy" (surprise) by moving to where they <em>expect</em> the mouse to be.
                    </li>
                </ul>
            </div>
        </div>
    );
}
