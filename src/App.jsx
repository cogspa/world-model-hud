import React, { useState } from "react";
import WorldModelSimulation from "./components/WorldModelSimulation.jsx";
import WorldModelHUD from "./components/WorldModelHUD.jsx";
import LatentControls from "./components/LatentControls.jsx";
import LatentHUD from "./components/LatentHUD.jsx";
import WorldModelControls from "./components/WorldModelControls.jsx";
import WorldModelStory from "./components/WorldModelStory.jsx";
import TechnicalPanel from "./components/TechnicalPanel.jsx";
import IntroOverlay from "./components/IntroOverlay.jsx";

const App = () => {
  const [hudState, setHudState] = useState(null);
  const [agentCount, setAgentCount] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showTech, setShowTech] = useState(false);

  // World Model Physics Params
  const [params, setParams] = useState({
    agentCount: 4000,
    spread: 1.0,
    memory: 0.96,
    noise: 1.0,
    obsWeight: 0.08,
    visualMode: "standard", // standard, velocity, error
    showPrior: false,
  });

  // Visual Rendering Params (The "Game Feel" of the Orb)
  const [latentParams, setLatentParams] = useState({
    varianceGain: 1.0,
    confidenceSmooth: 0.12,
    trailLength: 0.08 // Lower default for better visibility
  });

  // Data Recording & Scoring
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const recordedData = React.useRef([]);

  // Monitor HUD state for recording & scoring
  React.useEffect(() => {
    if (!hudState) return;

    // 1. Update Score (Simple inverse error accumulation)
    // If error is 0, score + 1. If error is high, score + small amount.
    const accuracy = 1 / (1 + (hudState.meanErrorToObs / 100));
    setScore(prev => prev + accuracy);

    // 2. Record Data
    if (isRecording) {
      // Flatten data for easier CSV/JSON analysis later
      recordedData.current.push({
        timestamp: Date.now(),
        ...hudState
      });
    }
  }, [hudState, isRecording]);

  const handleToggleRecord = () => {
    if (isRecording) {
      // Stop & Save
      setIsRecording(false);
      const blob = new Blob([JSON.stringify(recordedData.current, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `world_model_session_${Date.now()}.json`;
      a.click();
      recordedData.current = []; // Clear buffer
    } else {
      // Start
      recordedData.current = [];
      setIsRecording(true);
      setScore(0); // Reset score on new session
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#0a0c0e" }}>
      {/* The 2D Simulation Canvas */}
      <WorldModelSimulation
        onUpdateHUD={setHudState}
        params={params}
        onAgentCountChange={setAgentCount}
      />

      {/* Control Panels */}
      <WorldModelControls
        params={params}
        setParams={setParams}
        agentCount={agentCount}
        onToggleTech={() => setShowTech(!showTech)}
        // Data Recording Props
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        score={score}
      />

      <LatentControls
        params={latentParams}
        setParams={setLatentParams}
      />

      {/* Critical Alert Overlay */}
      {hudState && hudState.meanErrorToObs > 220 && (
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          <div style={{
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '0.2em',
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ef4444',
            animation: 'pulse 0.2s infinite' // Fast flicker
          }}>
            ⚠ BELIEF TELEPORT
          </div>
          <div style={{
            color: '#fca5a5',
            fontSize: '11px',
            marginTop: '4px',
            letterSpacing: '0.1em',
            textShadow: '0 0 10px #ef4444'
          }}>
            PHYSICS ABANDONED
          </div>
        </div>
      )}

      {/* HUD overlays on top of the canvas */}
      <LatentHUD state={hudState} params={params} visualParams={latentParams} />
      <WorldModelHUD state={hudState} />

      {/* Story HUD (Bottom Center) */}
      <WorldModelStory params={params} />

      {/* Technical Panel */}
      {showTech && <TechnicalPanel onClose={() => setShowTech(false)} />}

      {/* Intro Overlay */}
      {showIntro && (
        <IntroOverlay
          onClose={() => setShowIntro(false)}
          agentCount={agentCount}
        />
      )}

      {/* Help Button to reopen intro */}
      {!showIntro && (
        <button
          id="intro-help-button"
          onClick={() => setShowIntro(true)}
          title="Show Intro"
        >
          ?
        </button>
      )}
    </div>
  );
};

export default App;
