import { useCallback, useContext, useEffect, useState } from "react";

import { RobotinoContext } from "../App";
import * as Commands from "../util/robotino-rest/Commands";

export const useVelocityControl = () => {
  const { robotino, waitTime } = useContext(RobotinoContext);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, omega: 0 });

  const updateVelocity = useCallback(
    (newVelocity: typeof velocity) => {
      setVelocity(newVelocity);
      robotino.post(Commands.SetVelocity, [newVelocity.x, newVelocity.y, newVelocity.omega]);
    },
    [robotino]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      robotino.post(Commands.SetVelocity, [velocity.x, velocity.y, velocity.omega]);
    }, waitTime);

    return () => clearInterval(interval);
  }, [robotino, velocity, waitTime]);

  return { velocity, updateVelocity };
};
