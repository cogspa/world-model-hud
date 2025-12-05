import React from "react";

export default function WorldModelControls({
    params,
    setParams,
    agentCount,
    onToggleTech,
    isRecording,
    onToggleRecord,
    score
}) {
    const handleChange = (key, value) => {
        let newValue = value;
        if (key !== "visualMode" && typeof value !== "boolean") {
            newValue = parseFloat(value);
        }
        setParams((prev) => ({ ...prev, [key]: newValue }));
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 50,
            width: 300,
            padding: 16,
            fontFamily: 'system-ui, sans-serif'
        }}>
            {/* Header with Title and Rec Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                    <span style={{ fontSize: 13, color: '#94a3b8', letterSpacing: '0.05em' }}>WORLD MODEL HUD</span>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>System Status</div>
                </div>

                <button
                    onClick={onToggleRecord}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px',
                        background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isRecording ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 16,
                        color: isRecording ? '#f87171' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 11
                    }}
                >
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isRecording ? '#ef4444' : '#64748b',
                        boxShadow: isRecording ? '0 0 8px #ef4444' : 'none',
                        animation: isRecording ? 'pulse 1s infinite' : 'none'
                    }} />
                    {isRecording ? 'REC' : 'DATA'}
                </button>
            </div>

            {/* Score Display */}
            <div style={{
                marginBottom: 16,
                padding: 8,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
            }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>MODEL SCORE</span>
                <span style={{ fontSize: 16, color: '#10b981', fontFamily: 'monospace' }}>
                    {Math.floor(score).toLocaleString()}
                </span>
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
