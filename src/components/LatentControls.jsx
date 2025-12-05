import React, { useState } from 'react';

export default function LatentControls({ params, setParams }) {
    const [showHelp, setShowHelp] = useState(false);

    const handleChange = (key, value) => {
        setParams(prev => ({ ...prev, [key]: parseFloat(value) }));
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            top: 20,
            left: 340, // Moved right to avoid overlap
            zIndex: 60,
            width: 250,
            padding: 12,
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 10,
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>Latent Visual Tuning</span>
                <span style={{ opacity: 0.5, fontSize: 9 }}>v2.1</span>
            </div>

            {/* Variance Gain */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    <span>Variance Gain</span>
                    <span>{params.varianceGain.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min="0" max="3" step="0.1"
                    value={params.varianceGain}
                    onChange={(e) => handleChange('varianceGain', e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            {/* Confidence Smoothing */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    <span>Confidence Smooth</span>
                    <span>{params.confidenceSmooth.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={params.confidenceSmooth}
                    onChange={(e) => handleChange('confidenceSmooth', e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
            </div>

            {/* Trail Length */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    <span>Trail Fade (Length)</span>
                    <span>{params.trailLength.toFixed(3)}</span>
                </div>
                <input
                    type="range"
                    min="0" max="0.2" step="0.005"
                    value={params.trailLength}
                    onChange={(e) => handleChange('trailLength', e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    Lower value = longer trails
                </div>
            </div>

            <button
                onClick={() => setShowHelp(true)}
                style={{
                    width: '100%',
                    marginTop: 15,
                    padding: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 10
                }}
            >
                Start Using this Tool? &rarr;
            </button>

            {/* Educational Overlay */}
            {showHelp && (
                <div className="wm-modal-backdrop" onClick={() => setShowHelp(false)}>
                    <div
                        className="wm-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: 500 }}
                    >
                        <div className="wm-modal-header">
                            <h2>Decoding the Latent Space</h2>
                            <button className="wm-modal-close" onClick={() => setShowHelp(false)}>×</button>
                        </div>
                        <div className="wm-modal-body" style={{ lineHeight: 1.6 }}>
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: 14, color: '#fff', margin: '0 0 8px 0' }}>The Dance: Observer vs. Model</h3>
                                <p style={{ fontSize: 13, margin: 0 }}>
                                    The <strong>Mouse Cursor</strong> represents <em>Reality</em> (The Observer).<br />
                                    The <strong>Orb</strong> represents the AI's <em>Belief State</em> (The World Model).
                                </p>
                                <p style={{ fontSize: 13, marginTop: 8, color: '#94a3b8', borderLeft: '3px solid #3b82f6', paddingLeft: 10 }}>
                                    <strong>Try This:</strong> Move the mouse abruptly. Notice how the Orb <em>lags behind</em>?
                                    That gap represents <strong>Surprise</strong> (Prediction Error). The model takes time to update its belief to match reality.
                                </p>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: 14, color: '#fff', margin: '0 0 8px 0' }}>Color = Variance ($\sigma^2$)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '12px auto', gap: 10, fontSize: 12, alignItems: 'center', marginBottom: 4 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'hsl(220, 80%, 50%)' }}></div>
                                    <span><strong>Blue (Low Variance):</strong> The model is calm. It predicts the next state well.</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '12px auto', gap: 10, fontSize: 12, alignItems: 'center' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'hsl(0, 80%, 50%)' }}></div>
                                    <span><strong>Red (High Variance):</strong> The model is panicked. The "Possibility Cloud" is expanding because it doesn't know what will happen next.</span>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: 14, color: '#fff', margin: '0 0 8px 0' }}>Size = Confidence</h3>
                                <p style={{ fontSize: 13, margin: 0 }}>
                                    An expanded Orb means the model is <strong>Confident</strong> (High Probability Mass).
                                    A blinking or shrinking orb means the model is <strong>Uncertain</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
