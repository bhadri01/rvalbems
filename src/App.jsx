import { Loader } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { UI } from "./components/UI"
import { OrientationProvider } from "./components/OrientationProvider"
import { Experience } from "./components/Experience"

export default function Home() {
  return (
    <OrientationProvider>
      <UI />
      <Loader />
      <Canvas
        shadows
        camera={{
          position: [-0.5, 1, typeof window !== "undefined" && window.innerWidth > 800 ? 4 : 9],
          fov: 45,
        }}
      >
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </OrientationProvider>
  )
}
