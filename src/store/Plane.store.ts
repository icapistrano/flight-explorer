import { create } from "zustand";
import * as THREE from "three";

interface PlaneState {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Quaternion;
  setPosition: (position: THREE.Vector3) => void;
  setDirection: (direction: THREE.Vector3) => void;
  setRotation: (rotation: THREE.Quaternion) => void;
}

export const usePlaneStore = create<PlaneState>((set) => ({
  position: new THREE.Vector3(0, 0, 0),
  direction: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Quaternion(0, 0, 0, 1),

  setPosition: (position) => set({ position }),
  setDirection: (direction) => set({ direction }),
  setRotation: (rotation) => set({ rotation }),
}));
