import React, { useState } from "react";

/**
 * Central place for all metric definitions.
 * You can tweak wording here without touching any UI logic.
 */
const METRIC_DEFS = {
    probeIndex: {
        label: "Probe agent index",
        description:
            "Which agent’s internal state you’re currently inspecting. " +
            "Useful when multiple world-model agents are running in parallel.",
    },
    latentX: {
        label: "Latent x",
        description:
            "The agent’s internal x-coordinate inside its learned latent world model. " +
            "This is not a raw simulator coordinate; it’s the position in the model’s ‘mental map’.",
    },
    latentY: {
        label: "Latent y",
        description:
            "The agent’s internal y-coordinate in latent space, part of its compressed belief " +
            "about where it is in the world.",
    },
    beliefVx: {
        label: "Belief vx",
        description:
            "Agent’s predicted velocity along the x-axis in latent space. " +
            "Derived from the world model, not directly from the environment.",
    },
    beliefVy: {
        label: "Belief vy",
        description:
            "Agent’s predicted velocity along the y-axis in latent space. " +
            "Together with Belief vx this forms the belief-velocity vector.",
    },
    speedNorm: {
        label: "Speed ∥v∥",
        description:
            "Magnitude of the belief-velocity vector: sqrt(vx² + vy²). " +
            "Represents how fast the agent thinks it is moving through its internal world.",
    },
    phase: {
        label: "Phase (uncertainty)",
        description:
            "Scalar representing uncertainty or phase in the agent’s internal dynamics. " +
            "Higher values ≈ more uncertain or noisy predictions; lower values ≈ confident, stable dynamics.",
    },
    obsX: {
        label: "Observation x",
        description:
            "Last observed x-position coming from the real environment (pixels, coordinates, or sensor input).",
    },
    obsY: {
        label: "Observation y",
        description:
            "Last observed y-position from the environment, paired with Observation x.",
    },
    obsActive: {
        label: "Obs active?",
        description:
            "Whether a recent observation is currently being used to update the belief state. " +
            "true = grounded in fresh sensory input, false = running in predictive / imagined mode.",
    },
    beliefRetention: {
        label: "Belief retention",
        description:
            "How much of the previous belief state is carried into the next step. " +
            "High values → slow-changing, memory-rich beliefs; low values → beliefs dominated by new evidence.",
    },
    stochasticity: {
        label: "Stochasticity",
        description:
            "Amount of randomness injected into the world-model’s predictions. " +
            "Higher values encourage more exploratory or chaotic trajectories.",
    },
    obsWeight: {
        label: "Observation wt.",
        description:
            "Blend factor between observation and prediction during the update step. " +
            "High values → perception dominates; low values → internal prediction dominates. " +
            "Conceptually similar to a Kalman-filter gain, but in learned latent space.",
    },
};

/** Tiny info icon (no external icon library needed) */
const InfoIcon = ({ size = 12 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ display: "block" }}
    >
        <circle cx="10" cy="10" r="9" stroke="currentColor" fill="none" />
        <line x1="10" y1="8" x2="10" y2="14" stroke="currentColor" />
        <circle cx="10" cy="5" r="1" fill="currentColor" />
    </svg>
);

/** Simple tooltip on hover */
const Tooltip = ({ text }) => (
    <div className="wm-tooltip">
        {text}
    </div>
);

/** Centered modal for full definitions */
const DefinitionModal = ({ open, onClose, title, body }) => {
    if (!open) return null;
    return (
        <div className="wm-modal-backdrop" onClick={onClose}>
            <div
                className="wm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="wm-modal-header">
                    <h2>{title}</h2>
                    <button className="wm-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="wm-modal-body">
                    <p>{body}</p>
                </div>
            </div>
        </div>
    );
};

/**
 * WorldModelHUD
 * Props:
 *   state: {
 *     probeIndex,
 *     latentX, latentY,
 *     beliefVx, beliefVy, speedNorm, phase,
 *     obsX, obsY, obsActive,
 *     beliefRetention, stochasticity, obsWeight
 *   }
 */
export default function WorldModelHUD({ state }) {
    const [hoverKey, setHoverKey] = useState(null);
    const [modalMetric, setModalMetric] = useState(null);

    const openModal = (metricKey) => {
        setModalMetric(metricKey);
    };

    const closeModal = () => setModalMetric(null);

    const renderRow = (metricKey, valueFormatter = (v) => v) => {
        const def = METRIC_DEFS[metricKey];
        if (!def) return null;
        const value = valueFormatter(state?.[metricKey]);

        return (
            <div
                key={metricKey}
                className="wm-row"
                onMouseLeave={() => setHoverKey(null)}
            >
                <div className="wm-row-label" onClick={() => openModal(metricKey)}>
                    {def.label}
                </div>
                <div className="wm-row-value">{value}</div>

                <div
                    className="wm-info-wrapper"
                    onMouseEnter={() => setHoverKey(metricKey)}
                    onFocus={() => setHoverKey(metricKey)}
                    onClick={() => openModal(metricKey)}
                >
                    <InfoIcon />
                    {hoverKey === metricKey && <Tooltip text={def.description} />}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="wm-hud glass-panel">
                <div className="wm-hud-title">World-Model HUD</div>

                <div className="wm-hud-section-label">Agent</div>
                {renderRow("probeIndex", (v) => (v ?? 0))}

                <div className="wm-hud-section-label">Latent position</div>
                {renderRow("latentX", (v) => (v != null ? v.toFixed(1) : "—"))}
                {renderRow("latentY", (v) => (v != null ? v.toFixed(1) : "—"))}

                <div className="wm-hud-section-label">Belief dynamics</div>
                {renderRow("beliefVx", (v) => (v != null ? v.toFixed(3) : "—"))}
                {renderRow("beliefVy", (v) => (v != null ? v.toFixed(3) : "—"))}
                {renderRow("speedNorm", (v) => (v != null ? v.toFixed(3) : "—"))}
                {renderRow("phase", (v) => (v != null ? v.toFixed(3) : "—"))}

                <div className="wm-hud-section-label">Observations</div>
                {renderRow("obsX", (v) => (v != null ? v.toFixed(1) : "—"))}
                {renderRow("obsY", (v) => (v != null ? v.toFixed(1) : "—"))}
                {renderRow("obsActive", (v) => (v ? "true" : "false"))}

                <div className="wm-hud-section-label">Meta-parameters</div>
                {renderRow("beliefRetention", (v) =>
                    v != null ? v.toFixed(3) : "—"
                )}
                {renderRow("stochasticity", (v) =>
                    v != null ? v.toFixed(2) : "—"
                )}
                {renderRow("obsWeight", (v) =>
                    v != null ? v.toFixed(3) : "—"
                )}

                <div className="wm-hud-section-label" style={{ marginTop: 16, color: "#fff" }}>
                    System Status
                </div>
                <div style={{
                    marginTop: 4,
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 6,
                    fontSize: "11px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span>Regime:</span>
                    <strong style={{
                        color: (state?.obsWeight > 0.2 && state?.stochasticity < 1.2) ? "#4ade80" :
                            (state?.obsWeight < 0.05) ? "#f87171" : "#fbbf24"
                    }}>
                        {(state?.obsWeight > 0.2 && state?.stochasticity < 1.2) ? "LOCKED (Stable)" :
                            (state?.obsWeight < 0.05) ? "HALLUCINATING" : "UNCERTAIN"}
                    </strong>
                </div>

                <div style={{ marginTop: 20, textAlign: "center" }}>
                    <a href="https://worldmodelresearch.com" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/wmr-logo.png"
                            alt="World Model Research"
                            style={{ width: "100%", maxWidth: 120, opacity: 0.8, transition: "opacity 0.2s" }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                            onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                        />
                    </a>
                    <div style={{
                        marginTop: 12,
                        fontSize: "9px",
                        color: "rgba(255, 255, 255, 0.3)",
                        letterSpacing: "0.05em"
                    }}>
                        Concept Design by Joe Micallef (COGSPA) 2025
                    </div>
                </div>
            </div>

            {/* Pop-up with full definition */}
            <DefinitionModal
                open={!!modalMetric}
                onClose={closeModal}
                title={modalMetric ? METRIC_DEFS[modalMetric].label : ""}
                body={modalMetric ? METRIC_DEFS[modalMetric].description : ""}
            />
        </>
    );
}
