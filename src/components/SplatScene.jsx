import React from 'react';

export default function SplatScene({ bundleUrl }) {
    return (
        <group>
            {/* Placeholder for SplatScene */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 10, 10]} />
                <meshStandardMaterial color="orange" wireframe />
            </mesh>
        </group>
    );
}
