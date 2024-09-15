import "@master/css";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { RobotinoContext } from "../App";
import { Disabled } from "../util/DisableReactEvent";
import * as Commands from "../util/robotino-rest/Commands";
import ImageView from "./ImageView";
import OdometryStatus from "./OdometryStatus";

const OmniDriveControler: React.FC<unknown> = () => {
  const { waitTime, robotino } = useContext(RobotinoContext);
  const [isDragging, setIsDragging] = useState(false);
  const [controlMode, setControlMode] = useState<"y" | "omega">("y");
  const [velocity, setVelocity] = useState({ x: 0, y: 0, omega: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(event => {
    setIsDragging(true);
    setDragStartPos({ x: event.clientX, y: event.clientY });
    setControlMode(event.button === 2 ? "y" : "omega"); // 右クリック時は横移動
    event.preventDefault();
  }, []);

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    event => {
      if (!isDragging || !dragStartPos) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const maxDistance = Math.min(rect.width, rect.height) / 2;

      const deltaX = event.clientX - dragStartPos.x;
      const deltaY = event.clientY - dragStartPos.y;

      const x = Math.max(-1, Math.min(1, -deltaY / maxDistance)) / 3;
      const y = Math.max(-1, Math.min(1, -deltaX / maxDistance)) / 3;

      const newVelocity = {
        x: x,
        y: controlMode === "y" ? y : 0,
        omega: controlMode === "omega" ? y : 0,
      };

      setVelocity(newVelocity);
      robotino.post(Commands.SetVelocity, [newVelocity.x, newVelocity.y, newVelocity.omega]);
    },
    [isDragging, dragStartPos, setVelocity]
  );

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    setIsDragging(false);
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
  }, [velocity]);

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
        <p
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={Disabled}
          className="m:0% p:0% user-select:none user-drag:none"
        >
          <ImageView />
        </p>
      </div>
      {velocityView}
      <OdometryStatus />
    </>
  );
};

export default OmniDriveControler;
