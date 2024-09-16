import "@master/css";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import OmniDriveController from "./components/OmniDriveController";
import * as Commands from "./util/robotino-rest/Commands";
import { Robotino } from "./util/robotino-rest/Robotino";

export const RobotinoContext = createContext<{
  waitTime: number;
  baseUrl: string;
  robotino: Robotino;
}>(undefined as never);

const IPAddressInput: React.FC<{
  setBaseUrl: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setBaseUrl }) => {
  const { baseUrl, robotino } = useContext(RobotinoContext);
  const [gotError, setGotError] = useState(false);
  const [connectable, setConnectable] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    async e => {
      const newBaseUrl = e.target.value;
      try {
        robotino.baseUrl = newBaseUrl;
        localStorage.setItem("nav-ipAddress", newBaseUrl);
        setGotError(false);
      } catch {
        setGotError(true);
      }
      setBaseUrl(newBaseUrl);
    },
    [setBaseUrl, setGotError]
  );

  useEffect(() => {
    const interval = setInterval(
      () =>
        !gotError &&
        robotino
          .get(Commands.Test)
          .catch(() => false)
          .then(v => setConnectable(v)),
      3000
    );
    return () => clearInterval(interval);
  }, [setConnectable]);

  const Status = useMemo(
    () =>
      gotError ? (
        <p className="f:red">有効なIPアドレスを入力してください</p>
      ) : connectable ? (
        <p>接続されています</p>
      ) : (
        <p className="f:red">接続されていません</p>
      ),
    [gotError, connectable]
  );

  return (
    <>
      <label htmlFor="ipAddress">IPアドレス</label>
      <input type="url" id="ipAddress" onChange={handleChange} value={baseUrl} />
      {Status}
    </>
  );
};

const waitTime = 100 + 10;
const ipAddress = localStorage.getItem("nav-ipAddress") ?? "192.168.0.1:13080";
const robotino = new Robotino(ipAddress, "web-nav", waitTime - 10);

const App: React.FC<unknown> = () => {
  const [baseUrl, setBaseUrl] = useState(ipAddress);

  return (
    <RobotinoContext.Provider value={{ waitTime, baseUrl, robotino }}>
      <div className="m:0px>*">
        <IPAddressInput setBaseUrl={setBaseUrl} />
        <p>url: {robotino.baseUrl}</p>
      </div>
      <div>
        <OmniDriveController />
      </div>
    </RobotinoContext.Provider>
  );
};

console.log(Commands, robotino);

export default App;
