import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box3D } from "./components/Box";
import { Globe } from "./components/Globe";
import { PaperPlane } from "./components/PaperPlane";
import { PaperPlaneController } from "./components/PaperPlaneController";

function App() {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <PaperPlaneController />
        <Globe />
        <axesHelper scale={0.1} />
      </Canvas>
    </div>
  );
}

export default App;
