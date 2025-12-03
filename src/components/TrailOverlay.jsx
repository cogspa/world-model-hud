import React from 'react';

export default function TrailOverlay({ bundleUrl }) {
    return (
        <group>
            {/* Placeholder for TrailOverlay */}
            <mesh position={[20, 0, 0]}>
                <sphereGeometry args={[5, 16, 16]} />
                <meshStandardMaterial color="cyan" wireframe />
            </mesh>
        </group>
    );
}
