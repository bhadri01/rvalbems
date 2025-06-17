import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
export const Experience = () => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 40}
        floatIntensity={0.5}
        speed={2}
        rotationIntensity={0.2}
      >
        <Book />
      </Float>
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={6}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.5}
      />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
