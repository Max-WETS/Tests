const configurationFile = require("./configurationFile.json");
const changesList = require("./changesList.json");

Object.defineProperty(exports, "__esModule", { value: true });
const objectDepth = (obj) => {
  if (!obj || obj.length === 0 || typeof obj !== "object") return 0;
  const keys = Object.keys(obj);
  let depth = 0;
  keys.forEach((key) => {
    let tmpDepth = objectDepth(obj[key]);
    if (tmpDepth > depth) {
      depth = tmpDepth;
    }
  });
  return depth + 1;
};
const pathController = (config, changeArr, level) => {
  let errorMessage = "";
  let validPath = false;
  let slicedArr;
  const instruction = (() => {
    let obj = config;
    slicedArr = changeArr.slice(0, level);
    return slicedArr.reduce((prev, curr) => {
      return prev[curr];
    }, obj);
  })();
  if (instruction) {
    if (level < changeArr.length) {
      if (typeof instruction === "object") {
        level++;
        validPath = pathController(config, changeArr, level);
      } else {
        errorMessage =
          "The declared transformation path doesn't exist in the config file";
      }
    } else if (level === changeArr.length) {
      validPath = true;
    }
  } else {
    const arrayIdx = slicedArr.filter((el) => !isNaN(parseInt(el)));
    for (let idx of arrayIdx) {
      let i = 0;
      const nbrIdx = slicedArr.indexOf(arrayIdx[i]);
      const newStr = slicedArr[nbrIdx - 1] + `[${idx}]`;
      slicedArr[nbrIdx - 1] = newStr;
      slicedArr.splice(nbrIdx, 1);
      i++;
    }
    errorMessage = `The property ${slicedArr.join(".")} is undefined`;
  }
  if (validPath) {
    return validPath;
  } else {
    return errorMessage;
  }
};
const errorConsoleOutput = (errors, changesEntries) => {
  const errorObj = Object.assign({}, errors);
  const errorEntries = Object.entries(errorObj);
  console.dir("######################### ERROR LOG #########################");
  for (let error of errorEntries) {
    const transfNbr = parseInt(error[0].match(/\d+/gm)[0]);
    if (transfNbr) {
      const errorOutput = `- Transformation n°${transfNbr}: "${
        changesEntries[transfNbr - 1][0]
      }" failed / Cause: ${error[1]}`;
      console.dir(errorOutput);
    }
  }
  console.dir("---------------------- END ---------------------");
};
const instructionControllerFn = (configurationFile, changesList) => {
  const configuration = Object.assign({}, configurationFile);
  const changes = Object.assign({}, changesList);
  const configurationDepth = objectDepth(configuration);
  const changesEntries = Object.entries(changes);
  const errorObj = {};
  let changeRank = 1;
  for (let change of changesEntries) {
    let errorMessage = "";
    const pathArr = change[0].split(".");
    const regexp = /.+\[\d+\]$/gm;
    const results = pathArr.filter((word) => regexp.test(word));
    if (results) {
      for (let result of results) {
        const indexResult = pathArr.indexOf(result);
        const arrayIdx = result.match(/\[\d+\]/gm);
        if (arrayIdx) {
          pathArr[indexResult] = pathArr[indexResult].substring(
            0,
            pathArr[indexResult].length - arrayIdx[0].length
          );
          pathArr.splice(indexResult + 1, 0, arrayIdx[0][1]);
        }
      }
    }
    if (pathArr.length > configurationDepth) {
      errorMessage = "This transformation exceeds the config file's depth";
    } else {
      let level;
      const pathControlResult = pathController(
        configuration,
        pathArr,
        (level = 1)
      );
      if (pathControlResult === true) {
        const arrLastElement = pathArr.pop();
        let instructionPath = pathArr.reduce((prev, curr) => {
          return prev[curr];
        }, configuration);
        const newValueType = typeof change[1];
        if (newValueType === "object") {
          if (objectDepth(change[1]) > 1) {
            errorMessage = "The new value shouldn't exceed 1 line";
          } else {
            if (Array.isArray(change[1])) {
              change[1] = `[${change[1]}]`;
            } else {
              change[1] = `${JSON.stringify(change[1])}`;
            }
          }
        } else {
          change[1] = `"${change[1]}"`;
        }
        if (!errorMessage) {
          const update = JSON.parse(`{ "${arrLastElement}": ${change[1]} }`);
          Object.assign(instructionPath, update);
        }
      } else {
        errorMessage = pathControlResult;
      }
    }
    if (errorMessage) {
      const err = JSON.parse(
        `{ "transformation_nbr${changeRank}": "${errorMessage}" }`
      );
      Object.assign(errorObj, err);
    }
    errorMessage = "";
    changeRank++;
  }
  errorConsoleOutput(errorObj, changesEntries);
  return configuration;
};

console.log(
  JSON.stringify(instructionControllerFn(configurationFile, changesList))
);
