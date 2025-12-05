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
      />

      <LatentControls
        params={latentParams}
        setParams={setLatentParams}
      />

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
