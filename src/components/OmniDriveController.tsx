import "@master/css";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { RobotinoContext } from "../App";
import { Disabled } from "../util/DisableReactEvent";
import * as Commands from "../util/robotino-rest/Commands";
import ImageView from "./ImageView";
import OdometryStatus from "./OdometryStatus";

const OmniDriveController: React.FC<unknown> = () => {
  const { waitTime, robotino } = useContext(RobotinoContext);
  const [isDragging, setIsDragging] = useState(false);
  const [controlMode, setControlMode] = useState<"y" | "omega">("y");
  const [velocity, setVelocity] = useState({ x: 0, y: 0, omega: 0 });
  const [totalMovement, setTotalMovement] = useState({ x: 0, y: 0 });
  const controllerRef = useRef<HTMLSpanElement>(null);

  const handlePointerDown: React.PointerEventHandler<HTMLSpanElement> = useCallback(event => {
    setIsDragging(true);
    setControlMode(event.button === 2 ? "y" : "omega");
    setTotalMovement({ x: 0, y: 0 }); // ドラッグ開始時に移動量をリセット
    event.preventDefault();

    if (controllerRef.current) {
      controllerRef.current.requestPointerLock();
    }
  }, []);

  const handlePointerMove: React.PointerEventHandler<HTMLSpanElement> = useCallback(
    event => {
      if (!isDragging) return;

      const deltaX = event.movementX;
      const deltaY = event.movementY;

      setTotalMovement(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      const maxDistance = 2000; // 感度調整用の値

      const x = Math.max(-0.3, Math.min(0.3, -totalMovement.y / maxDistance));
      const y = Math.max(-0.3, Math.min(0.3, -totalMovement.x / maxDistance));

      const newVelocity = {
        x: x,
        y: controlMode === "y" ? y : 0,
        omega: controlMode === "omega" ? y : 0,
      };

      setVelocity(newVelocity);
      robotino.post(Commands.SetVelocity, [newVelocity.x, newVelocity.y, newVelocity.omega]);
    },
    [isDragging, totalMovement.y, totalMovement.x, controlMode, robotino]
  );

  const handlePointerUp: React.PointerEventHandler<HTMLSpanElement> = () => {
    setIsDragging(false);
    document.exitPointerLock();
    const task = () => {
      setVelocity({ x: 0, y: 0, omega: 0 });
      robotino.post(Commands.SetVelocity, [0, 0, 0]);
    };
    task();
    setTimeout(() => {
      task();
    }, waitTime * 2);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      robotino.post(Commands.SetVelocity, [velocity.x, velocity.y, velocity.omega]);
    }, waitTime);

    return () => clearInterval(interval);
  }, [robotino, velocity, waitTime]);

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
        <span
          ref={controllerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={Disabled}
          className="m:0% p:0% user-select:none user-drag:none"
        >
          <ImageView />
        </span>
      </div>
      <span className="m:0px>*">
        {velocityView}
        <OdometryStatus />
      </span>
    </>
  );
};

export default OmniDriveController;
