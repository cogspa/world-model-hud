import React, { useMemo } from "react";

export default function WorldModelStory({ params }) {
    const story = useMemo(() => {
        const { obsWeight, noise, memory } = params;

        // 1. Check for "Hallucination" (Detachment from reality)
        if (obsWeight < 0.04) {
            return (
                <span>
                    <strong style={{ color: "#f87171" }}>The AI is dreaming.</strong> With observation weight so low, it barely notices the real world (your cursor).
                    It relies entirely on its internal priors. In a real LLM or robot, this causes <em>hallucinations</em>—confidently stating things that aren't true because it ignores external evidence.
                </span>
            );
        }

        // 2. Check for "Amnesia" (Low Memory)
        if (memory < 0.88) {
            return (
                <span>
                    <strong style={{ color: "#60a5fa" }}>The AI has no attention span.</strong> It forgets its past beliefs almost instantly.
                    While it reacts quickly to new data, it cannot build a coherent long-term understanding of the world. It lives entirely in the "now."
                </span>
            );
        }

        // 3. Check for "High Uncertainty" (High Noise)
        if (noise > 1.6) {
            return (
                <span>
                    <strong style={{ color: "#fbbf24" }}>The AI is confused.</strong> High stochasticity means it believes <em>anything</em> could happen next.
                    Its predictions spread out in all directions. This is useful for exploration, but bad for precise planning.
                </span>
            );
        }

        // 4. Check for "Overconfidence" (Low Noise + High Memory)
        if (noise < 0.3 && memory > 0.95) {
            return (
                <span>
                    <strong style={{ color: "#c084fc" }}>The AI is dogmatic.</strong> It believes the future is perfectly deterministic.
                    If the world changes unexpectedly, this AI will fail catastrophically because it left no room for doubt.
                </span>
            );
        }

        // 5. Check for "Precision / Locked In" (High Obs + Moderate Noise)
        if (obsWeight > 0.2) {
            return (
                <span>
                    <strong style={{ color: "#4ade80" }}>The AI is grounded.</strong> It trusts its sensors implicitly.
                    This is ideal for a robot arm catching a ball—it tracks reality tightly. However, it may lack the "imagination" needed to solve creative problems.
                </span>
            );
        }

        // Default / Balanced
        return (
            <span>
                <strong style={{ color: "#fff" }}>Balanced Learning.</strong> The AI is maintaining a healthy mix of internal prediction and external observation.
                It respects the data but keeps an open mind about the future.
            </span>
        );
    }, [params.obsWeight, params.noise, params.memory]);

    return (
        <div className="wm-story-hud glass-panel">
            {story}
            <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                fontSize: "12px",
                fontFamily: "Times New Roman, serif",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.6)"
            }}>
                <span title="Evidence Lower Bound (ELBO) - The core objective function for training World Models">
                    L(θ, φ) = <span style={{ color: "#4ade80" }}>E<sub>q</sub>[ln p(x|z)]</span> - <span style={{ color: "#f87171" }}>β D<sub>KL</sub>[q(z|x) || p(z)]</span>
                </span>
            </div>
        </div>
    );
}
