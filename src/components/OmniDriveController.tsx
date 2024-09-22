import "@master/css";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useVelocityControl } from "../hooks/useVelocityControl";
import ImageView from "./ImageView";
import OdometryStatus from "./OdometryStatus";
import PointerLockDraggingHandler from "./PointerLockHandler";

type Keys = "w" | "s" | "a" | "d" | "q" | "e";
type Velocity = { x: number; y: number; omega: number };

const keyToVelocity = new Map<Keys, Velocity>();
{
  const KV: { key: Keys; value: Velocity }[] = [
    { key: "w", value: { x: 0.1, y: 0, omega: 0 } },
    { key: "s", value: { x: -0.1, y: 0, omega: 0 } },
    { key: "a", value: { x: 0, y: 0.1, omega: 0 } },
    { key: "d", value: { x: 0, y: -0.1, omega: 0 } },
    { key: "q", value: { x: 0, y: 0, omega: (45 * Math.PI) / 180 } },
    { key: "e", value: { x: 0, y: 0, omega: (-45 * Math.PI) / 180 } },
  ];
  KV.map(value => keyToVelocity.set(value.key, value.value));
}
const OmniDriveController: React.FC<unknown> = () => {
  const [controlMode, setControlMode] = useState<"y" | "omega">("y");
  const { velocity, updateVelocity } = useVelocityControl();

  const [keyPressed, setKeyPressed] = useState(() => {
    const keyPressed = new Map<Keys, boolean>();
    (["w", "s", "a", "d", "q", "e"] as Keys[]).map(k => keyPressed.set(k, false));
    return keyPressed;
  });

  const [pointerVelocity, setPointerVelocity] = useState<Velocity>({ x: 0, y: 0, omega: 0 });
  const [keyboardVelocity, setKeyboardVelocity] = useState<Velocity>({ x: 0, y: 0, omega: 0 });

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLSpanElement>) => {
    setControlMode(event.button === 2 ? "y" : "omega");
  }, []);

  const handlePointerMove = useCallback(
    (_: React.PointerEvent<HTMLSpanElement>, totalMovement: { x: number; y: number }) => {
      const maxDistance = 2000;
      const x = Math.max(-0.3, Math.min(0.3, -totalMovement.y / maxDistance));
      const y = Math.max(-0.3, Math.min(0.3, -totalMovement.x / maxDistance));

      setPointerVelocity({
        x: x,
        y: controlMode === "y" ? y : 0,
        omega: controlMode === "omega" ? y : 0,
      });
    },
    [controlMode]
  );

  const handlePointerUp = useCallback(() => {
    setPointerVelocity({ x: 0, y: 0, omega: 0 });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase() as Keys;

      console.log(`down: ${key}`);
      if (keyToVelocity.has(key) && !keyPressed.get(key)) {
        setKeyPressed(prev => prev.set(key, true));
        setKeyboardVelocity(prev => {
          const newVelocity = { ...prev };
          const value = keyToVelocity.get(key)!;
          newVelocity.x += value.x;
          newVelocity.y += value.y;
          newVelocity.omega += value.omega;

          return newVelocity;
        });
      }
    },
    [keyPressed]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase() as Keys;
      console.log(`up: ${key}`);
      if (keyToVelocity.has(key) && keyPressed.get(key)) {
        setKeyPressed(prev => prev.set(key, false));
        setKeyboardVelocity(prev => {
          const newVelocity = { ...prev };
          const value = keyToVelocity.get(key)!;
          newVelocity.x -= value.x;
          newVelocity.y -= value.y;
          newVelocity.omega -= value.omega;
          return newVelocity;
        });
      }
    },
    [keyPressed]
  );

  useEffect(() => {
    const combinedVelocity = {
      x: pointerVelocity.x + keyboardVelocity.x,
      y: pointerVelocity.y + keyboardVelocity.y,
      omega: pointerVelocity.omega + keyboardVelocity.omega,
    };
    updateVelocity(combinedVelocity);
  }, [pointerVelocity, keyboardVelocity, updateVelocity]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const velocityView = useMemo(
    () => (
      <p className="m:0">
        vx: {velocity.x.toFixed(3)} vy: {velocity.y.toFixed(3)} omega: {velocity.omega.toFixed(3)}
      </p>
    ),
    [velocity]
  );

  return (
    <>
      <div className="h:100% w:100% m:auto display:flex justify-content:center">
        <PointerLockDraggingHandler
          onPointerLock={handlePointerDown}
          onPointerDrag={handlePointerMove}
          onPointerUnlock={handlePointerUp}
        >
          <span className="m:0% p:0% user-select:none user-drag:none">
            <ImageView />
          </span>
        </PointerLockDraggingHandler>
      </div>
      <span className="m:0px>*">
        {velocityView}
        <OdometryStatus />
      </span>
    </>
  );
};

export default OmniDriveController;
