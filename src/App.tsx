import { Canvas } from "@react-three/fiber";
import { Globe } from "./components/Globe";
import { PaperPlaneController } from "./components/PaperPlaneController";
import { CameraFollower } from "./components/CameraFollower";
import { ControlInput } from "./components/ControlInput";

function App() {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <ambientLight intensity={1} />
        <ControlInput />
        <CameraFollower />
        <PaperPlaneController />
        <Globe />
      </Canvas>
    </div>
  );
}

export default App;
