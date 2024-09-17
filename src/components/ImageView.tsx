import "@master/css";

import { useContext, useEffect, useState } from "react";

import { RobotinoContext } from "../App";
import { Disabled } from "../util/DisableReactEvent";
import * as Commands from "../util/robotino-rest/Commands";

const ImageView: React.FC<unknown> = () => {
  const { waitTime, robotino } = useContext(RobotinoContext);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const blob = await robotino.get(Commands.GetCam0);
        const url = URL.createObjectURL(blob);
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(url);
      } catch {}
    }, waitTime);

    return () => {
      clearInterval(interval);
    };
  }, [imageUrl, robotino, waitTime]);

  return imageUrl ? (
    <img
      src={imageUrl}
      onSelect={Disabled}
      className="h:85vh max-h:95vh w:auto b:solid pointer-events:none user-select:none user-drag:none"
    />
  ) : null;
};

export default ImageView;
