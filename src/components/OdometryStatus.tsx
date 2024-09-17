import { useContext, useEffect, useState } from "react";

import { RobotinoContext } from "../App";
import * as Commands from "../util/robotino-rest/Commands";
import { WithLength } from "../util/WithLength";

const OdometryStatus: React.FC<unknown> = () => {
  const { waitTime, robotino } = useContext(RobotinoContext);

  const [status, setStatus] = useState<WithLength<number, 7>>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        robotino.get(Commands.GetOdometry).then(value => setStatus(value));
      } catch {}
      return () => clearInterval(interval);
    }, waitTime);

    return () => clearInterval(interval);
  }, [robotino, setStatus, waitTime]);

  return (
    <p>
      x: {status[0].toFixed(3)} y: {status[1].toFixed(3)} deg: {((status[2] / Math.PI) * 180).toFixed(3)}{" "}
    </p>
  );
};

export default OdometryStatus;
