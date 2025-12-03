import React from "react";

export default function WorldModelControls({
    params,
    setParams,
    agentCount,
    onToggleTech
}) {
    const handleChange = (key, value) => {
        let newValue = value;
        if (key !== "visualMode" && typeof value !== "boolean") {
            newValue = parseFloat(value);
        }
        setParams((prev) => ({ ...prev, [key]: newValue }));
    };

    return (
        <div className="wm-controls glass-panel">
            <div className="wm-controls-title">
                <a href="https://worldmodelresearch.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    World Model Research
                </a>
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', letterSpacing: '0.05em' }}>
                INTERACTIVE DEMO
            </div>

            <div className="wm-control-group">
                <label>Visual Metaphor:</label>
                <select
                    value={params.visualMode}
                    onChange={(e) => handleChange("visualMode", e.target.value)}
                    style={{
                        width: "100%",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginBottom: "8px"
                    }}
                >
                    <option value="standard">Standard (Ghost Trails)</option>
                    <option value="velocity">Multiverse (Color by Angle)</option>
                    <option value="error">Error Heatmap (Dist to Truth)</option>
                </select>

                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                    <input
                        type="checkbox"
                        checked={params.showPrior}
                        onChange={(e) => handleChange("showPrior", e.target.checked)}
                        style={{ width: "auto", marginRight: "8px", accentColor: "#2997ff" }}
                    />
                    Show Dynamics Prior (The "Wind")
                </label>
            </div>

            <div className="wm-control-group">
                <label>Agent Count: {params.agentCount}</label>
                <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={params.agentCount}
                    onChange={(e) => handleChange("agentCount", e.target.value)}
                />
            </div>

            <div className="wm-control-group">
                <label>Spread (Distribution): {Math.round(params.spread * 100)}%</label>
                <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={params.spread}
                    onChange={(e) => handleChange("spread", e.target.value)}
                />
            </div>

            <div className="wm-control-group">
                <label>Belief retention (memory):</label>
                <input
                    type="range"
                    min="0.80"
                    max="0.999"
                    step="0.001"
                    value={params.memory}
                    onChange={(e) => handleChange("memory", e.target.value)}
                />
            </div>

            <div className="wm-control-group">
                <label>Stochasticity (exploration noise):</label>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={params.noise}
                    onChange={(e) => handleChange("noise", e.target.value)}
                />
            </div>

            <div className="wm-control-group">
                <label>Observation weight:</label>
                <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.005"
                    value={params.obsWeight}
                    onChange={(e) => handleChange("obsWeight", e.target.value)}
                />
            </div>

            <div className="wm-controls-footer">
                Move pointer / tap & drag to provide observations.<br />
                Agents update beliefs + roll out futures.
                <div style={{ marginTop: 12 }}>
                    <button
                        onClick={onToggleTech}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            color: "#94a3b8",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                            width: "100%"
                        }}
                    >
                        View Math & Code
                    </button>
                </div>
            </div>
        </div>
    );
}
