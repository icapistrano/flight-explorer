import { useEffect } from "react";
import { KeysState, useKeysStore } from "../store/Keys.store";

export const ControlInput = () => {
  const { keys, setKey } = useKeysStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        setKey(key as keyof KeysState["keys"], true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys) {
        setKey(key as keyof KeysState["keys"], false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keys, setKey]);

  return null;
};
