import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Stars, Float, Box, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { AppStage, WordToken } from '../types';

// --- Types Fix ---
// Augment both global JSX and React.JSX to cover different TS configurations for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      points: any;
      sphereGeometry: any;
      pointsMaterial: any;
      cylinderGeometry: any;
      bufferGeometry: any;
      lineBasicMaterial: any;
      color: any;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any;
        mesh: any;
        boxGeometry: any;
        meshStandardMaterial: any;
        meshBasicMaterial: any;
        ambientLight: any;
        pointLight: any;
        points: any;
        sphereGeometry: any;
        pointsMaterial: any;
        cylinderGeometry: any;
        bufferGeometry: any;
        lineBasicMaterial: any;
        color: any;
      }
    }
  }
}

// --- Constants & Data ---
const THEME = {
  text: '#ffffff',
  token: '#3b82f6', // Blue
  embedding: '#ec4899', // Pink
  attention: '#f59e0b', // Amber
  ffn: '#10b981', // Emerald
  highlight: '#60a5fa'
};

const INPUT_TOKENS: WordToken[] = [
  { id: 0, text: "The", tokenId: 464, vector: { x: -3, y: 0, z: 0 }, category: 'other' },
  { id: 1, text: "quick", tokenId: 2048, vector: { x: -1, y: 0, z: 0 }, category: 'adjective' },
  { id: 2, text: "brown", tokenId: 3521, vector: { x: 1, y: 0, z: 0 }, category: 'adjective' },
  { id: 3, text: "fox", tokenId: 1845, vector: { x: 3, y: 0, z: 0 }, category: 'noun' },
];

// --- Reusable Components ---

interface LabelProps {
  text: string;
  position: [number, number, number];
  color?: string;
  size?: number;
  anchorX?: number | 'center' | 'left' | 'right';
  anchorY?: number | 'center' | 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom';
}

const Label = ({ 
  text, 
  position, 
  color = "white", 
  size = 0.25,
  anchorX = "center",
  anchorY = "middle"
}: LabelProps) => (
  <Text 
    position={position} 
    fontSize={size} 
    color={color} 
    anchorX={anchorX} 
    anchorY={anchorY} 
    outlineWidth={0.02} 
    outlineColor="#000"
  >
    {text}
  </Text>
);

const ConnectionLine = ({ start, end, color, opacity = 0.5, animated = false }: { start: THREE.Vector3, end: THREE.Vector3, color: string, opacity?: number, animated?: boolean }) => {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  useFrame((state) => {
    if (animated && materialRef.current) {
        materialRef.current.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });
  
  return (
    <Line points={[start, end]} color={color} opacity={opacity} transparent lineWidth={1} />
  );
};

const AnimatedResidual = ({ start, end }: { start: [number, number, number]; end: [number, number, number] }) => {
  const lineRef = useRef<any>(null);
  const packetRef = useRef<THREE.Mesh>(null);
  
  const vStart = useMemo(() => new THREE.Vector3(...start), [start]);
  const vEnd = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((state, delta) => {
    // Animate line dashes
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.dashOffset -= delta * 0.5;
      lineRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
    
    // Animate packet travel
    if (packetRef.current) {
      const speed = 0.5;
      const t = (state.clock.elapsedTime * speed) % 1;
      packetRef.current.position.lerpVectors(vStart, vEnd, t);
      
      // Pulse packet scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      packetRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={[vStart, vEnd]}
        color="#e2e8f0"
        dashed
        dashSize={0.4}
        gapSize={0.2}
        opacity={0.5}
        transparent
        lineWidth={2}
      />
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
        <pointLight intensity={1} distance={1.5} color="white" />
      </mesh>
    </group>
  );
};

// --- STAGE 1: TOKENIZATION (Detailed) ---
const TokenizationStage = () => {
    // Shows raw text splitting into tokens with IDs
    return (
        <group>
            <Label text="Raw Text Input" position={[0, 3, 0]} color="#9ca3af" size={0.3} />
            <Text position={[0, 2.2, 0]} fontSize={0.8} color="white">The quick brown fox</Text>
            
            {/* Arrows pointing down */}
            {INPUT_TOKENS.map((t, i) => (
                <group key={i} position={[t.vector.x, 0, 0]}>
                    <Line points={[[0, 1.5, 0], [0, 0.8, 0]]} color="#4b5563" />
                    
                    {/* The Token Box */}
                    <RoundedBox args={[1.8, 1, 0.5]} radius={0.1}>
                        <meshStandardMaterial color={THEME.token} transparent opacity={0.9} />
                    </RoundedBox>
                    <Text position={[0, 0.1, 0.26]} fontSize={0.4} color="white">{t.text}</Text>
                    
                    {/* The Token ID */}
                    <Text position={[0, -0.8, 0]} fontSize={0.3} color={THEME.highlight}>ID: {t.tokenId}</Text>
                    <Label text="Input ID" position={[0, -1.2, 0]} color="#6b7280" size={0.15} />
                </group>
            ))}

            <Label text="Tokenizer (BPE)" position={[0, -2.5, 0]} color="#9ca3af" size={0.4} />
            <Text position={[0, -3, 0]} fontSize={0.25} maxWidth={6} textAlign="center" color="#6b7280">
                Algorithmically splits text into sub-word units found in the vocabulary.
            </Text>
        </group>
    );
};

// --- STAGE 2: EMBEDDING LOOKUP (The Matrix) ---
const EmbeddingStage = () => {
    // Visualizing the Lookup Table. A grid of "stored" vectors.
    const matrixRows = 8;
    const matrixCols = 12; // Visual simplification of dimensionality
    
    return (
        <group>
            <Label text="Embedding Matrix (Lookup Table)" position={[0, 3.5, 0]} color={THEME.embedding} />
            
            {/* The Matrix Visualization */}
            <group position={[0, 0.5, -2]}>
                {Array.from({ length: matrixRows }).map((_, r) => (
                    Array.from({ length: matrixCols }).map((_, c) => {
                         // Highlight specific rows corresponding to our tokens mock-up
                         const activeRow = [1, 3, 5, 7].includes(r);
                         const color = activeRow ? THEME.embedding : '#1f2937';
                         const emissive = activeRow ? 1 : 0;
                         
                         return (
                            <Box key={`${r}-${c}`} position={[(c - matrixCols/2) * 0.5, (r - matrixRows/2) * 0.6, 0]} args={[0.4, 0.4, 0.4]}>
                                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} transparent opacity={activeRow ? 1 : 0.3} />
                            </Box>
                         )
                    })
                ))}
            </group>

            {/* Connecting Tokens to Matrix Rows */}
            {INPUT_TOKENS.map((t, i) => {
                 const rowY = ([1, 3, 5, 7][i] - matrixRows/2) * 0.6;
                 const start = new THREE.Vector3(t.vector.x, -2, 1);
                 const end = new THREE.Vector3(-3, rowY + 0.5, -2);
                 
                 return (
                    <group key={i}>
                        {/* The Token ID Input */}
                        <RoundedBox position={[t.vector.x, -2, 1]} args={[1.5, 0.6, 0.2]} radius={0.1}>
                            <meshStandardMaterial color={THEME.token} />
                        </RoundedBox>
                        <Text position={[t.vector.x, -2, 1.11]} fontSize={0.3} color="white">{t.tokenId}</Text>

                        {/* Connection Line */}
                        <Line points={[start, end]} color={THEME.embedding} lineWidth={1} transparent opacity={0.4} />
                        
                        {/* Extracted Vector representation (The column flying out) */}
                        <group position={[t.vector.x, -2, 3]}>
                             <Cylinder args={[0.1, 0.1, 1.5, 8]} rotation={[Math.PI/2, 0, 0]}>
                                 <meshStandardMaterial color={THEME.embedding} emissive={THEME.embedding} emissiveIntensity={0.5} />
                             </Cylinder>
                             <Label text={`d_model`} position={[0.4, 0, 0]} size={0.15} color={THEME.embedding} />
                        </group>
                    </group>
                 )
            })}

            <Label text="Dense Vectors" position={[0, -3.5, 0]} color="white" />
        </group>
    );
};

// --- STAGE 3: TRANSFORMER BLOCK (Detailed) ---
const TransformerStage = () => {
    // This scene needs to show the flow: Input -> Attention -> FFN -> Output
    // We visualize one "Layer"
    
    // Positions
    const bottomY = -3;
    const attnY = -0.5;
    const ffnY = 2;
    const topY = 4;

    return (
        <group>
             <Label text="Transformer Layer (N=1)" position={[-5, 3.5, 0]} color="white" size={0.4} anchorX="left" />

             {/* 1. INPUT VECTORS */}
             {INPUT_TOKENS.map((t, i) => (
                 <group key={`in-${i}`} position={[t.vector.x, bottomY, 0]}>
                     <Sphere args={[0.2, 16, 16]}>
                         <meshStandardMaterial color={THEME.embedding} />
                     </Sphere>
                     <Text position={[0, -0.4, 0]} fontSize={0.2} color="gray">{t.text}</Text>
                 </group>
             ))}

             {/* Flow Lines to Attention */}
             {INPUT_TOKENS.map((t, i) => (
                 <Line key={`l1-${i}`} points={[[t.vector.x, bottomY, 0], [t.vector.x, attnY - 0.5, 0]]} color="gray" opacity={0.2} transparent />
             ))}

             {/* 2. MULTI-HEAD ATTENTION BLOCK */}
             <group position={[0, attnY, 0]}>
                 <RoundedBox args={[8, 1.5, 1]} radius={0.2}>
                     <meshStandardMaterial color="#1e1b4b" transparent opacity={0.8} />
                 </RoundedBox>
                 <Text position={[-3, 0, 1.1]} fontSize={0.3} color={THEME.attention} anchorX="left">Self-Attention</Text>
                 
                 {/* Visualizing Attention Weights (The "Web") */}
                 {INPUT_TOKENS.map((source, i) => (
                     INPUT_TOKENS.map((target, j) => {
                         // Only draw some lines to avoid clutter, representing significant attention
                         if (Math.abs(i - j) <= 1 || (source.text === 'fox' && target.text === 'quick')) {
                             const intensity = (source.text === 'fox' && target.text === 'quick') ? 1 : 0.2;
                             const curveHeight = 0.5;
                             const p1 = new THREE.Vector3(source.vector.x, -0.4, 0.6);
                             const p2 = new THREE.Vector3(target.vector.x, -0.4, 0.6);
                             const mid = p1.clone().add(p2).multiplyScalar(0.5).add(new THREE.Vector3(0, curveHeight, 0));
                             
                             return (
                                 <Line 
                                    key={`attn-${i}-${j}`} 
                                    points={[p1, mid, p2]} 
                                    color={THEME.attention} 
                                    opacity={intensity} 
                                    transparent 
                                    lineWidth={intensity * 2} 
                                 />
                             )
                         }
                         return null;
                     })
                 ))}
             </group>

             {/* Residual Connection & Norm (Dynamic Visual) */}
             <AnimatedResidual start={[4.5, bottomY, 0]} end={[4.5, topY, 0]} />
             <Label text="Residual Stream" position={[5.2, 0, 0]} size={0.2} color="gray" />

             {/* Flow Lines to FFN */}
             {INPUT_TOKENS.map((t, i) => (
                 <Line key={`l2-${i}`} points={[[t.vector.x, attnY + 0.8, 0], [t.vector.x, ffnY - 0.8, 0]]} color="gray" opacity={0.2} transparent />
             ))}

             {/* 3. FEED FORWARD NETWORK BLOCK */}
             <group position={[0, ffnY, 0]}>
                 <RoundedBox args={[8, 1.5, 1]} radius={0.2}>
                     <meshStandardMaterial color="#064e3b" transparent opacity={0.8} />
                 </RoundedBox>
                 <Text position={[-3, 0, 1.1]} fontSize={0.3} color={THEME.ffn} anchorX="left">Feed Forward (MLP)</Text>
                 
                 {/* Neural Nodes visual */}
                 {[-2, -1, 0, 1, 2].map((x, k) => (
                     <Sphere key={k} position={[x, 0, 0.6]} args={[0.15, 16, 16]}>
                         <meshStandardMaterial color={THEME.ffn} emissive={THEME.ffn} emissiveIntensity={2} />
                     </Sphere>
                 ))}
             </group>

             {/* Flow to Output */}
             {INPUT_TOKENS.map((t, i) => (
                 <group key={`out-${i}`}>
                    <Line points={[[t.vector.x, ffnY + 0.8, 0], [t.vector.x, topY, 0]]} color={THEME.embedding} />
                    <Sphere position={[t.vector.x, topY, 0]} args={[0.25, 16, 16]}>
                        <meshStandardMaterial color={THEME.embedding} emissive={THEME.embedding} emissiveIntensity={1} />
                    </Sphere>
                 </group>
             ))}
        </group>
    )
}

// --- STAGE 4: PREDICTION (Logits & Softmax) ---
const PredictionStage = () => {
    // Focus on the last token "Fox" predicting the next word
    const lastTokenPos = INPUT_TOKENS[3].vector;
    
    const candidates = [
        { word: "jumps", prob: 0.75, color: "#10b981" },
        { word: "runs", prob: 0.15, color: "#f59e0b" },
        { word: "sleeps", prob: 0.05, color: "#ef4444" },
        { word: "eats", prob: 0.03, color: "#6b7280" },
        { word: "is", prob: 0.02, color: "#6b7280" },
    ];

    return (
        <group>
            {/* The Context Vector (Result of Transformer) */}
            <Label text="Final Context Vector (Last Token)" position={[0, -2.5, 0]} color={THEME.embedding} />
            <Sphere position={[0, -2, 0]} args={[0.4, 32, 32]}>
                <meshStandardMaterial color={THEME.embedding} emissive={THEME.embedding} emissiveIntensity={2} />
            </Sphere>

            {/* Expansion to Logits (Unembedding Matrix) */}
            <group position={[0, -0.5, 0]}>
                <Line points={[[0, -1.5, 0], [-3, 0, 0]]} color="gray" transparent opacity={0.2} />
                <Line points={[[0, -1.5, 0], [3, 0, 0]]} color="gray" transparent opacity={0.2} />
                <Label text="Unembedding (Linear Layer)" position={[0, -1, 0]} size={0.2} color="gray" />
            </group>

            {/* Probability Distribution */}
            <group position={[-3, 1, 0]}>
                {candidates.map((c, i) => (
                    <group key={i} position={[i * 1.5, 0, 0]}>
                        {/* Bar */}
                        <mesh position={[0, c.prob * 2, 0]}>
                            <boxGeometry args={[0.8, c.prob * 4, 0.2]} />
                            <meshStandardMaterial color={c.color} />
                        </mesh>
                        {/* Word */}
                        <Text position={[0, -0.5, 0]} fontSize={0.25} color="white">{c.word}</Text>
                        {/* Percentage */}
                        <Text position={[0, c.prob * 4 + 0.3, 0]} fontSize={0.25} color={c.color}>{(c.prob * 100).toFixed(0)}%</Text>
                    </group>
                ))}
            </group>

            <Label text="Softmax Probability Distribution" position={[0, 3.5, 0]} color="#a78bfa" />
            <Text position={[0, -3.5, 0]} fontSize={0.2} color="gray" italic>
                Next Token Selection: "jumps" (Greedy) or via Sampling
            </Text>
        </group>
    );
}


// --- MAIN VISUALIZER ---

interface VisualizerProps {
  stage: AppStage;
}

const Visualizer3D: React.FC<VisualizerProps> = ({ stage }) => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Environment */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            maxPolarAngle={Math.PI / 1.5} 
            minPolarAngle={Math.PI / 3}
            autoRotate={stage === AppStage.INTRO}
            autoRotateSpeed={0.5}
        />

        {/* Content based on Stage */}
        <group>
            {stage === AppStage.INTRO && (
                <group>
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                        <Text fontSize={1.2} color={THEME.highlight} anchorX="center" anchorY="middle">LLM ARCHITECTURE</Text>
                        <Text position={[0, -1, 0]} fontSize={0.4} color="gray">Interactive 3D Pipeline Visualization</Text>
                    </Float>
                    {/* Abstract brain/network visual */}
                    <points position={[0,0,-2]}>
                        <sphereGeometry args={[3, 48, 48]} />
                        <pointsMaterial size={0.03} color={THEME.token} transparent opacity={0.3} />
                    </points>
                </group>
            )}

            {stage === AppStage.TOKENIZATION && <TokenizationStage />}
            {stage === AppStage.EMBEDDING && <EmbeddingStage />}
            {stage === AppStage.TRANSFORMER && <TransformerStage />}
            {stage === AppStage.PREDICTION && <PredictionStage />}
        </group>

      </Canvas>
    </div>
  );
};

export default Visualizer3D;