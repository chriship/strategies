// @format
import { env } from "process";
import { resolve } from "path";

import { decodeCallOutput } from "eth-fun";

import logger from "../../logger.mjs";

export const decodeSolidityHexStringFactory = (props) => {
  const { strategyName, version, nextStrategyName } = props;

  const log = logger(strategyName);

  function onClose() {
    const fileName = `${strategyName}-transformation`;
    return {
      write: null,
      messages: [
        {
          type: "extraction",
          version,
          name: nextStrategyName,
          args: [resolve(env.DATA_DIR, fileName)],
        },
      ],
    };
  }

  function onError(error) {
    log(error.toString());
    throw error;
  }

  function onLine(line) {
    let decodedOutput;
    try {
      [decodedOutput] = decodeCallOutput(["string"], line);
    } catch (err) {
      log(err.toString());
      return {
        messages: [],
        write: null,
      };
    }
    return {
      messages: [],
      write: decodedOutput,
    };
  }

  return {
    onClose,
    onLine,
    onError,
  };
};
