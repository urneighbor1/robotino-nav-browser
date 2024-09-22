import { useCallback, useRef, useState } from "react";

import { Disabled } from "../util/DisableReactEvent";

interface PointerLockDraggingHandlerProps {
  onPointerLock: (event: React.PointerEvent<HTMLSpanElement>) => void;
  onPointerDrag: (
    event: React.PointerEvent<HTMLSpanElement>,
    totalMovement: { x: number; y: number }
  ) => void;
  onPointerUnlock: (event: React.PointerEvent<HTMLSpanElement>) => void;
  children: React.ReactNode;
}

const PointerLockDraggingHandler: React.FC<PointerLockDraggingHandlerProps> = ({
  onPointerLock,
  onPointerDrag,
  onPointerUnlock,
  children,
}: PointerLockDraggingHandlerProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [totalMovement, setTotalMovement] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (containerRef.current) {
        setTotalMovement({ x: 0, y: 0 }); // ドラッグ開始時に移動量をリセット
        containerRef.current.requestPointerLock();
        setIsDragging(true);
        onPointerLock(event);
      }
    },
    [onPointerLock]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (!isDragging) return;
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      setTotalMovement(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      onPointerDrag(event, totalMovement);
    },
    [isDragging, onPointerDrag, totalMovement]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (document.pointerLockElement === containerRef.current) {
        document.exitPointerLock();
        setIsDragging(false);
        onPointerUnlock(event);
      }
    },
    [onPointerUnlock]
  );

  return (
    <span
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={Disabled}
      className="cursor:pointer"
    >
      {children}
    </span>
  );
};

export default PointerLockDraggingHandler;
