# World Model HUD

**An interactive visualization of how AI agents "imagine" the future.**
[![World Model Research](https://img.shields.io/badge/Presented%20by-World%20Model%20Research-2997ff)](https://worldmodelresearch.com)

## World Model HUD 2.0 (New Update)

World Model HUD 2.0 introduces an entirely new visual latent interface that reveals how the AI’s internal belief state evolves over time. While Version 1 focused on particle-based world-model dynamics, Version 2 adds a high-level, animated “mind’s-eye” visualization of the model’s uncertainty, confidence, drift, and regime.

This transforms the project from a simple simulation into a conceptual UX exploration of future world-model debugging tools.

### 🚀 What’s New in 2.0

#### 1. Latent Visual Orb (New HUD Layer)
A full-screen animated orb that summarizes the AI’s latent belief state:
*   **Orb Radius**: level of confidence
*   **Glow Radius / Texture**: uncertainty (variance of the particle cloud)
*   **Color Temperature**: uncertainty → blue (low) → red (high)
*   **Drift Needle**: direction of latent prediction
*   **Trails**: temporal smoothing visualizing temporal coherence

This provides an abstract but intuitive mental model of how a world model “feels” internally.

#### 2. True Latent Statistics (Not Fake Heuristics)
HUD 2.0 uses real statistics extracted from the agent cloud:
*   `cloudStd`: spread of the particle distribution
*   `meanErrorToObs`: average deviation from observations
*   `beliefVx`, `beliefVy`: latent drift vector
*   `phase`: agent-level uncertainty marker
*   `obsWeight`: grounding vs imagination
*   `stochasticity`: internal randomness

These metrics form the inputs to the latent orb rendering pipeline.

#### 3. New HUD Modes
Users can cycle between three visualization styles:
*   **Orb Mode (Default)**: A polished, cinematic representation of the latent state.
*   **Minimal Mode**: A thin-ring interface with attention-style ticks and small drift indicators.
*   **Wireframe Mode**: A more technical concentric-ring view reminiscent of Kalman covariance ellipses.

These modes reflect different potential UX paradigms for world model inspection.

#### 4. Regime Display (System-Level State)
HUD 2.0 infers and displays the current behavior regime:
*   **LOCKED** — strong grounding, stable predictions
*   **HALLUCINATING** — low observation weight, drifting from reality
*   **UNCERTAIN** — high noise or spread
*   **BALANCED** — good blend of prediction + observation

These regime labels visually diagnose the system at a glance.

#### 5. Fully Integrated Into Existing UI
The orb sits between the simulation and the textual HUD:
`WorldModelSimulation → LatentHUD → WorldModelHUD → Story HUD`

This layering mirrors how future AI tools may combine:
*   Full-state visualization
*   Latent-space abstraction
*   Symbolic/textual metrics
*   Narrative or natural language explanation

HUD 2.0 represents the “middle layer” of this stack.

---

## 🛠️ Tech Stack

*   **React 18**: UI and State Management.
*   **Vite**: Fast build tool.
*   **HTML5 Canvas**: High-performance 2D particle rendering (10,000+ agents).
*   **CSS Glassmorphism**: Custom "Sci-Fi HUD" aesthetic.

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/cogspa/world-model-hud.git
    cd world-model-hud
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 📄 License

MIT License. Feel free to use this code for educational purposes or your own research demos.
