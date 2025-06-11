import { FC } from "react";
import { latLongToVector3 } from "../helpers/helpers";

export const CoordinateMarker: FC = () => {
  const position = latLongToVector3(51.507351, -0.127758, 1.02); // Slightly above the Earth's surface

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};
