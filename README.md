# World Model HUD

**An interactive visualization of how AI agents "imagine" the future.**

[![World Model Research](https://img.shields.io/badge/Presented%20by-World%20Model%20Research-2997ff)](https://worldmodelresearch.com)

This project is a visual metaphor for **Neural World Models** (like Dreamer, JEPA, or RSSM). It visualizes the internal "latent state" of an AI as a particle system, allowing you to intuitively understand concepts like **uncertainty**, **hallucination**, and **Bayesian filtering**.

## 🎮 Interactive Demo

The simulation visualizes a **Particle Filter** (Sequential Monte Carlo) running in real-time:

*   **Agents (Particles)**: Represent independent hypotheses about the state of the world.
*   **The Mouse**: Represents the "Ground Truth" or Sensor Observation.
*   **The "Wind" (Dynamics Prior)**: Represents the AI's internal prediction of how the world moves (without data).

### Key Features

*   **Interactive Controls**: Tweak the fundamental parameters of the AI's brain:
    *   **Observation Weight**: How much does the AI trust its eyes vs. its imagination?
    *   **Stochasticity (Noise)**: How "creative" or confused is the AI?
    *   **Belief Retention (Memory)**: How long does it hold onto past predictions?
*   **Visual Modes**:
    *   **Standard**: Ghost trails showing density.
    *   **Multiverse**: Colors particles by direction, visualizing divergent futures.
    *   **Error Heatmap**: Turns particles **Green** (accurate) or **Red** (hallucinating) based on distance from reality.
*   **Narrative HUD**: A dynamic story engine that diagnoses the AI's state (e.g., *"The AI is dreaming"*, *"The AI is dogmatic"*).
*   **Technical Panel**: View the underlying math (Kalman Filter / ELBO) and the code driving the simulation.

## 🧠 The Science

This demo maps directly to the mathematics of **Variational Inference**:

$$ s_{t+1} \sim p_\theta(s_{t+1} | s_t, a_t) $$

*   **Tracking Mode**: High observation weight. The model collapses its probability cloud to match the sensor data.
*   **Dreaming Mode**: Low observation weight + High noise. The model ignores the sensor and "hallucinates" a future based on its internal dynamics prior.

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
