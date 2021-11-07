const jsonfile = require("jsonfile");
const configurationFile = require("./configurationFile.json");
const changesList = require("./changesList3.json");

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
  let validPath = false;
  const instruction = (() => {
    let obj = config;
    const slicedArr = changeArr.slice(0, level);
    console.log("slice array: ", slicedArr);
    console.log("inputs array length: ", changeArr.length);
    return slicedArr.reduce((prev, curr) => {
      return prev[curr];
    }, obj);
  })();

  console.log(instruction);
  //   console.log(config["page1"]);

  if (instruction) {
    if (level < changeArr.length) {
      if (typeof instruction === "object") {
        level++;
        console.log("level", level);
        validPath = pathController(config, changeArr, level);
      } else {
        console.log("this path doesn't exist");
      }
    } else if (level === changeArr.length) {
      validPath = true;
      console.log("end instruction", instruction);
    }
  } else {
    console.log("this property doesn't exist");
  }

  console.log("validPath: ", validPath);
  return validPath;
};

const instructionController = (configurationFile, changesList) => {
  const configuration = { ...configurationFile };
  const changes = { ...changesList };

  const configurationDepth = objectDepth(configuration);

  const changesEntries = Object.entries(changes);

  for (let change of changesEntries) {
    const pathArr = change[0].split(".");
    const regexp = /.+\[\d+\]$/gm;
    const result = pathArr.filter((word) => regexp.test(word));
    const indexResult = pathArr.indexOf(result[0]);
    const arrayIdx = result[0].match(/\[\d+\]/gm);
    // pathArr[indexResult].replace(/\[\d+\]/gm, "");
    // console.log(arrayIdx[0].length);
    pathArr[indexResult] = pathArr[indexResult].substring(
      0,
      pathArr[indexResult].length - arrayIdx[0].length
    );
    // console.log(pathArr[indexResult]);
    pathArr.splice(indexResult + 1, 0, arrayIdx[0][1]);
    console.log(pathArr);

    if (pathArr.length > configurationDepth) {
      console.dir("this instruction exceeds the config file's depth");
    } else {
      const doesPathExist = pathController(configuration, pathArr, (level = 1));
      console.log("doesPathExist: ", doesPathExist);

      if (doesPathExist) {
        const arrLastElement = pathArr.pop();
        let instructionPath = pathArr.reduce((prev, curr) => {
          return prev[curr];
        }, configuration);
        console.log("instruction path: ", instructionPath);
        console.log(instructionPath);
        const newValueType = typeof change[1];
        if (newValueType === "object" && Array.isArray(change[1]))
          change[1] = `[${change[1]}]`;
        if (newValueType === "object" && !Array.isArray(change[1]))
          change[1] = `${JSON.stringify(change[1])}`;
        if (newValueType === "string") change[1] = `${change[1]}`;

        const update = JSON.parse(`{ "${arrLastElement}": ${change[1]} }`);
        console.log("update: ", update);
        // console.log(typeof update);
        Object.assign(instructionPath, update);
        console.log(JSON.stringify(configuration));
        // configuration.page1.initialSettings.color = change[1];
        // console.log(
        //   configuration.page1.initialSettings.color === instructionPath
        // );
      }
    }
  }

  return configuration;
};

instructionController(configurationFile, changesList);
