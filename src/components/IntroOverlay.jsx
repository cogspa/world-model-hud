import React from "react";

export default function IntroOverlay({ onClose, agentCount }) {
    return (
        <div id="intro-overlay">
            <div id="intro-card">
                <h2>World Model Guide</h2>
                <div style={{ fontSize: '11px', color: '#2997ff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Presented by World Model Research
                </div>

                <div className="intro-section">
                    <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
                        Note: This is a toy, visual metaphor for how a world model behaves.
                        It’s not a full research system, but it captures the same roles you’d see in a learned neural world model.
                    </p>
                </div>

                <div className="intro-section">
                    <h3>In this demo:</h3>
                    <ul>
                        <li><strong>Agents (particles)</strong> ≈ samples of the model’s belief about where things are.</li>
                        <li><strong>The Mouse</strong> ≈ the observer or sensor stream (the “real world”).</li>
                        <li><strong>vnoise field</strong> ≈ a hand-written dynamics prior – a simple guess about how things tend to move when no new observations arrive.</li>
                        <li><strong>Sliders</strong> ≈ knobs on the inference process: how much we trust sensors vs prior, how uncertain we are, and how much history we keep.</li>
                    </ul>
                </div>

                <div className="intro-section">
                    <h3>A Real Neural World Model</h3>
                    <p>
                        It would keep the same structure—beliefs, observations, dynamics—but the dynamics would be learned by a neural network from data.
                        It would take a latent state and predict a distribution over the next state:
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '12px',
                        borderRadius: '8px',
                        margin: '12px 0',
                        textAlign: 'center',
                        fontFamily: 'Times New Roman, serif',
                        fontStyle: 'italic',
                        fontSize: '48px',
                        color: '#fff'
                    }}>
                        s<sub>t+1</sub> ∼ p<sub>θ</sub>(s<sub>t+1</sub> | s<sub>t</sub>, a<sub>t</sub>)
                    </div>
                    <p>
                        In <strong>“tracking” mode</strong>, it combines those predictions with incoming sensors (like high obs-weight).
                        <br />
                        In <strong>“dreaming” mode</strong>, it free-runs forward without observations, imagining futures (like low obs-weight + high noise).
                    </p>
                </div>

                <div className="intro-section">
                    <p>
                        <strong>So:</strong> this canvas is a simplified stage where you can see the same ideas at work—beliefs, priors, observations, grounding vs hallucinating—that a learned neural world model would use at much higher dimensionality.
                    </p>
                </div>

                <button id="intro-close" onClick={onClose}>Got it</button>
            </div>
        </div>
    );
}
